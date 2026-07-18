// @ts-nocheck
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ─── DB ───────────────────────────────────────────────────────────────────────
// Lazy pool — created once and reused across warm invocations
let _pool = null;
function getPool() {
  if (!_pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL is not set");
    _pool = new Pool({
      connectionString: connStr,
      ssl: connStr.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 10000,
    });
    _pool.on("error", (err) => console.error("[Pool error]", err.message));
  }
  return _pool;
}

async function query(sql, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const getSecret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET not set");
  return s;
};

function verifyToken(req) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    jwt.verify(auth.slice(7), getSecret());
    return true;
  } catch {
    return false;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function camel(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = v;
  }
  return out;
}
const camels = (rows) => rows.map(camel);

function match(pattern, path) {
  const pp = pattern.split("/");
  const lp = path.split("/");
  if (pp.length !== lp.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = lp[i];
    else if (pp[i] !== lp[i]) return null;
  }
  return params;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const rawPath = req.url?.split("?")[0] ?? "/";
  const path = rawPath.replace(/^\/api/, "") || "/";
  const method = req.method ?? "GET";
  const body = req.body ?? {};

  try {
    // Health
    if (method === "GET" && path === "/healthz")
      return res.json({ status: "ok" });

    // Config
    if (method === "GET" && path === "/config")
      return res.json({ supabaseUrl: process.env.SUPABASE_URL ?? "", supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "" });

    // Admin login
    if (method === "POST" && path === "/admin/login") {
      const { password } = body;
      if (!password || password !== process.env.ADMIN_PASSWORD)
        return res.status(401).json({ error: "Senha incorreta" });
      const token = jwt.sign({ admin: true }, getSecret(), { expiresIn: "8h" });
      return res.json({ token });
    }

    // Admin stats
    if (method === "GET" && path === "/admin/stats") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const [[totalRow], [confirmedRow], [speakerRow], [certRow], courses, counts] = await Promise.all([
        query("SELECT count(*)::int AS count FROM registrations"),
        query("SELECT count(*)::int AS count FROM registrations WHERE email_confirmed = true"),
        query("SELECT count(*)::int AS count FROM speakers"),
        query("SELECT count(*)::int AS count FROM certificates"),
        query("SELECT id, title, max_capacity, active FROM minicourses ORDER BY id"),
        query("SELECT minicourse_id, count(*)::int AS count FROM enrollments GROUP BY minicourse_id"),
      ]);
      const countMap = Object.fromEntries(counts.map((r) => [r.minicourse_id, r.count]));
      const total = totalRow.count;
      return res.json({
        totalRegistrants: total,
        confirmed: confirmedRow.count,
        pending: total - confirmedRow.count,
        speakerCount: speakerRow.count,
        certCount: certRow.count,
        minicourseEnrollments: courses.map((c) => ({
          id: c.id, title: c.title, enrollmentCount: countMap[c.id] ?? 0,
          maxCapacity: c.max_capacity, active: c.active,
        })),
      });
    }

    // Admin registrants
    if (method === "GET" && path === "/admin/registrants") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const [registrants, enrollments] = await Promise.all([
        query("SELECT * FROM registrations ORDER BY created_at"),
        query("SELECT e.registration_id, m.id AS minicourse_id, m.title FROM enrollments e JOIN minicourses m ON e.minicourse_id = m.id"),
      ]);
      const enrollMap = {};
      for (const e of enrollments) {
        if (!enrollMap[e.registration_id]) enrollMap[e.registration_id] = [];
        enrollMap[e.registration_id].push({ id: e.minicourse_id, title: e.title });
      }
      return res.json(camels(registrants).map((r) => ({ ...r, minicourses: enrollMap[r.id] ?? [] })));
    }

    // Admin update registration
    { const p = match("/admin/registrants/:id", path);
      if (method === "PUT" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        const { status, emailConfirmed, eventPresence, certificateReleased } = body;
        await query("UPDATE registrations SET status=$1, email_confirmed=$2, event_presence=$3, certificate_released=$4, updated_at=now() WHERE id=$5",
          [status, emailConfirmed, eventPresence, certificateReleased, Number(p.id)]);
        const [row] = await query("SELECT * FROM registrations WHERE id=$1", [Number(p.id)]);
        return res.json(camel(row));
      }
      if (method === "DELETE" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        await query("DELETE FROM registrations WHERE id=$1", [Number(p.id)]);
        return res.json({ success: true });
      }
    }

    // Registrations: create
    if (method === "POST" && path === "/registrations") {
      const { name, email, phone, city, profession } = body;
      if (!name || !email || !phone || !city || !profession)
        return res.status(400).json({ error: "Dados inválidos" });
      const existing = await query("SELECT id FROM registrations WHERE email=$1", [email]);
      if (existing.length > 0) return res.status(409).json({ error: "Email já cadastrado" });
      const [reg] = await query(
        "INSERT INTO registrations (name, email, phone, city, profession) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [name, email, phone, city, profession]
      );
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      query("INSERT INTO confirmation_tokens (registration_id, token, expires_at) VALUES ($1,$2,$3)",
        [reg.id, token, expiresAt]).catch(console.error);
      return res.status(201).json(camel(reg));
    }

    // Registrations: count
    if (method === "GET" && path === "/registrations") {
      const [row] = await query("SELECT count(*)::int AS count FROM registrations");
      return res.json({ count: row.count });
    }

    // Registrations: lookup by email
    if (method === "POST" && path === "/registrations/lookup") {
      const { email } = body;
      if (!email) return res.status(400).json({ error: "Email obrigatório" });
      const [reg] = await query("SELECT * FROM registrations WHERE email=$1", [email]);
      if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });
      const enrollments = await query(
        `SELECT e.minicourse_id AS "minicourseId", m.title FROM enrollments e
         JOIN minicourses m ON e.minicourse_id = m.id WHERE e.registration_id=$1`, [reg.id]);
      return res.json({ ...camel(reg), enrollments });
    }

    // Registrations: by id
    { const p = match("/registrations/by-id/:id", path);
      if (method === "GET" && p) {
        const [reg] = await query("SELECT * FROM registrations WHERE id=$1", [Number(p.id)]);
        if (!reg) return res.status(404).json({ error: "Não encontrado" });
        const enrollments = await query(
          `SELECT e.minicourse_id AS "minicourseId" FROM enrollments e WHERE e.registration_id=$1`, [reg.id]);
        return res.json({ ...camel(reg), enrollments });
      }
    }

    // Email confirmation
    { const p = match("/confirmar/:token", path);
      if (method === "GET" && p) {
        const [tok] = await query(
          "SELECT * FROM confirmation_tokens WHERE token=$1 AND used_at IS NULL AND expires_at > now()", [p.token]);
        if (!tok) return res.status(400).json({ error: "Token inválido ou expirado" });
        await query("UPDATE registrations SET email_confirmed=true, email_confirmed_at=now() WHERE id=$1", [tok.registration_id]);
        await query("UPDATE confirmation_tokens SET used_at=now() WHERE id=$1", [tok.id]);
        const [reg] = await query("SELECT name FROM registrations WHERE id=$1", [tok.registration_id]);
        return res.json({ success: true, name: reg.name });
      }
    }

    // Minicourses: public
    if (method === "GET" && path === "/minicourses") {
      const [courses, counts] = await Promise.all([
        query("SELECT * FROM minicourses WHERE active=true ORDER BY id"),
        query("SELECT minicourse_id, count(*)::int AS count FROM enrollments GROUP BY minicourse_id"),
      ]);
      const countMap = Object.fromEntries(counts.map((r) => [r.minicourse_id, r.count]));
      return res.json(courses.map((c) => ({
        id: c.id, title: c.title, instructor: c.instructor, description: c.description,
        duration: c.duration, maxCapacity: c.max_capacity, type: c.type, active: c.active,
        date: c.date, time: c.time, location: c.location, workload: c.workload,
        generatesCertificate: c.generates_certificate, enrollmentsClosed: c.enrollments_closed,
        enrollmentCount: countMap[c.id] ?? 0,
      })));
    }

    // Minicourses: admin all
    if (method === "GET" && path === "/minicourses/all") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const [courses, counts] = await Promise.all([
        query("SELECT * FROM minicourses ORDER BY id"),
        query("SELECT minicourse_id, count(*)::int AS count FROM enrollments GROUP BY minicourse_id"),
      ]);
      const countMap = Object.fromEntries(counts.map((r) => [r.minicourse_id, r.count]));
      return res.json(courses.map((c) => ({ ...camel(c), enrollmentCount: countMap[c.id] ?? 0 })));
    }

    // Minicourses: create
    if (method === "POST" && path === "/minicourses") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const { title, instructor, description, duration, maxCapacity = 30, type = "pratico",
        active = true, date = "", time = "", location = "", workload = "4 horas",
        generatesCertificate = true, enrollmentsClosed = false } = body;
      const [row] = await query(
        `INSERT INTO minicourses (title,instructor,description,duration,max_capacity,type,active,date,time,location,workload,generates_certificate,enrollments_closed)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [title, instructor, description, duration, maxCapacity, type, active, date, time, location, workload, generatesCertificate, enrollmentsClosed]);
      return res.status(201).json(camel(row));
    }

    // Minicourses: update/delete
    { const p = match("/minicourses/:id", path);
      if (method === "PUT" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        const { title, instructor, description, duration, maxCapacity, type, active, date, time, location, workload, generatesCertificate, enrollmentsClosed } = body;
        const [row] = await query(
          `UPDATE minicourses SET title=$1,instructor=$2,description=$3,duration=$4,max_capacity=$5,type=$6,active=$7,date=$8,time=$9,location=$10,workload=$11,generates_certificate=$12,enrollments_closed=$13 WHERE id=$14 RETURNING *`,
          [title, instructor, description, duration, maxCapacity, type, active, date, time, location, workload, generatesCertificate, enrollmentsClosed, Number(p.id)]);
        if (!row) return res.status(404).json({ error: "Não encontrado" });
        return res.json(camel(row));
      }
      if (method === "DELETE" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        await query("DELETE FROM minicourses WHERE id=$1", [Number(p.id)]);
        return res.json({ success: true });
      }
    }

    // Minicourses: enrollees
    { const p = match("/minicourses/:id/enrollees", path);
      if (method === "GET" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        const rows = await query(
          `SELECT e.id AS "enrollmentId", r.id AS "registrationId", r.name, r.email, r.phone,
                  r.email_confirmed AS "emailConfirmed", e.minicourse_presence AS "minicoursePresence"
           FROM enrollments e JOIN registrations r ON e.registration_id = r.id WHERE e.minicourse_id=$1`,
          [Number(p.id)]);
        return res.json(rows);
      }
    }

    // Minicourses: mark presence
    { const p = match("/minicourses/:id/presence/:registrationId", path);
      if (method === "POST" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        await query("UPDATE enrollments SET minicourse_presence=$1 WHERE minicourse_id=$2 AND registration_id=$3",
          [body.present, Number(p.id), Number(p.registrationId)]);
        return res.json({ success: true });
      }
    }

    // Enrollments: create
    if (method === "POST" && path === "/enrollments") {
      const { registrationId, minicourseId } = body;
      if (!registrationId || !minicourseId) return res.status(400).json({ error: "Dados inválidos" });
      const [[reg], [course], [{ count }]] = await Promise.all([
        query("SELECT id FROM registrations WHERE id=$1", [registrationId]),
        query("SELECT id, max_capacity, enrollments_closed FROM minicourses WHERE id=$1", [minicourseId]),
        query("SELECT count(*)::int AS count FROM enrollments WHERE minicourse_id=$1", [minicourseId]),
      ]);
      if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });
      if (!course) return res.status(404).json({ error: "Minicurso não encontrado" });
      if (course.enrollments_closed || count >= course.max_capacity)
        return res.status(409).json({ error: "Minicurso lotado" });
      try {
        const [enrollment] = await query(
          "INSERT INTO enrollments (registration_id, minicourse_id) VALUES ($1,$2) RETURNING *",
          [registrationId, minicourseId]);
        return res.status(201).json(camel(enrollment));
      } catch {
        return res.status(409).json({ error: "Já inscrito neste minicurso" });
      }
    }

    // Speakers
    if (method === "GET" && path === "/speakers") {
      return res.json(camels(await query("SELECT * FROM speakers WHERE active=true ORDER BY display_order, id")));
    }
    if (method === "GET" && path === "/speakers/all") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      return res.json(camels(await query("SELECT * FROM speakers ORDER BY display_order, id")));
    }
    if (method === "POST" && path === "/speakers") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const { name, title = "", institution = "", bio = "", talkTopic = "", talkDate = "", talkTime = "",
        linkedinUrl = null, photoUrl = null, displayOrder = 0, active = true } = body;
      const [row] = await query(
        "INSERT INTO speakers (name,title,institution,bio,talk_topic,talk_date,talk_time,linkedin_url,photo_url,display_order,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
        [name, title, institution, bio, talkTopic, talkDate, talkTime, linkedinUrl, photoUrl, displayOrder, active]);
      return res.status(201).json(camel(row));
    }
    { const p = match("/speakers/:id", path);
      if (method === "PUT" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        const { name, title = "", institution = "", bio = "", talkTopic = "", talkDate = "", talkTime = "",
          linkedinUrl = null, photoUrl = null, displayOrder = 0, active = true } = body;
        const [row] = await query(
          "UPDATE speakers SET name=$1,title=$2,institution=$3,bio=$4,talk_topic=$5,talk_date=$6,talk_time=$7,linkedin_url=$8,photo_url=$9,display_order=$10,active=$11 WHERE id=$12 RETURNING *",
          [name, title, institution, bio, talkTopic, talkDate, talkTime, linkedinUrl, photoUrl, displayOrder, active, Number(p.id)]);
        if (!row) return res.status(404).json({ error: "Não encontrado" });
        return res.json(camel(row));
      }
      if (method === "DELETE" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        await query("DELETE FROM speakers WHERE id=$1", [Number(p.id)]);
        return res.json({ success: true });
      }
    }

    // Sponsors
    if (method === "GET" && path === "/sponsors") {
      return res.json(camels(await query("SELECT * FROM sponsors WHERE active=true ORDER BY display_order, id")));
    }
    if (method === "GET" && path === "/sponsors/all") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      return res.json(camels(await query("SELECT * FROM sponsors ORDER BY display_order, id")));
    }
    if (method === "POST" && path === "/sponsors") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const { name, logoUrl = "", websiteUrl = "", category = "apoio", displayOrder = 0, active = true } = body;
      const [row] = await query(
        "INSERT INTO sponsors (name,logo_url,website_url,category,display_order,active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [name, logoUrl, websiteUrl, category, displayOrder, active]);
      return res.status(201).json(camel(row));
    }
    { const p = match("/sponsors/:id", path);
      if (method === "PUT" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        const { name, logoUrl = "", websiteUrl = "", category = "apoio", displayOrder = 0, active = true } = body;
        const [row] = await query(
          "UPDATE sponsors SET name=$1,logo_url=$2,website_url=$3,category=$4,display_order=$5,active=$6 WHERE id=$7 RETURNING *",
          [name, logoUrl, websiteUrl, category, displayOrder, active, Number(p.id)]);
        if (!row) return res.status(404).json({ error: "Não encontrado" });
        return res.json(camel(row));
      }
      if (method === "DELETE" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        await query("DELETE FROM sponsors WHERE id=$1", [Number(p.id)]);
        return res.json({ success: true });
      }
    }

    // Gallery
    if (method === "GET" && path === "/gallery") {
      return res.json(camels(await query("SELECT * FROM gallery_items WHERE active=true ORDER BY display_order, id")));
    }
    if (method === "GET" && path === "/gallery/all") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      return res.json(camels(await query("SELECT * FROM gallery_items ORDER BY display_order, id")));
    }
    if (method === "POST" && path === "/gallery") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      const { title = "", caption = "", altText = "", imageUrl, category = "geral", displayOrder = 0, active = true } = body;
      if (!imageUrl) return res.status(400).json({ error: "imageUrl obrigatório" });
      const [row] = await query(
        "INSERT INTO gallery_items (title,caption,alt_text,image_url,category,display_order,active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [title, caption, altText, imageUrl, category, displayOrder, active]);
      return res.status(201).json(camel(row));
    }
    { const p = match("/gallery/:id", path);
      if (method === "PUT" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        const { title = "", caption = "", altText = "", imageUrl, category = "geral", displayOrder = 0, active = true } = body;
        const [row] = await query(
          "UPDATE gallery_items SET title=$1,caption=$2,alt_text=$3,image_url=$4,category=$5,display_order=$6,active=$7 WHERE id=$8 RETURNING *",
          [title, caption, altText, imageUrl, category, displayOrder, active, Number(p.id)]);
        if (!row) return res.status(404).json({ error: "Não encontrado" });
        return res.json(camel(row));
      }
      if (method === "DELETE" && p) {
        if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
        await query("DELETE FROM gallery_items WHERE id=$1", [Number(p.id)]);
        return res.json({ success: true });
      }
    }

    // Homepage content
    if (method === "GET" && path === "/homepage") {
      const rows = await query("SELECT key, value FROM homepage_content");
      const content = {};
      for (const r of rows) content[r.key] = r.value;
      return res.json(content);
    }
    if (method === "PUT" && path === "/homepage") {
      if (!verifyToken(req)) return res.status(401).json({ error: "Não autorizado" });
      for (const [key, value] of Object.entries(body ?? {})) {
        await query(
          "INSERT INTO homepage_content (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=now()",
          [key, String(value)]);
      }
      return res.json({ success: true });
    }

    // Certificates: validate
    { const p = match("/certificates/validate/:code", path);
      if (method === "GET" && p) {
        const [cert] = await query(
          `SELECT c.type, c.validation_code, c.workload, c.status, c.issued_at, r.name, m.title AS minicourse_title
           FROM certificates c JOIN registrations r ON c.registration_id = r.id
           LEFT JOIN minicourses m ON c.minicourse_id = m.id WHERE c.validation_code=$1`,
          [p.code.toUpperCase()]);
        if (!cert) return res.status(404).json({ valid: false, error: "Certificado não encontrado" });
        return res.json({
          valid: cert.status === "ativo",
          name: cert.name,
          type: cert.type,
          title: cert.type === "event" ? "Conecta Orto 2026" : (cert.minicourse_title ?? ""),
          workload: cert.workload,
          issuedAt: cert.issued_at,
          validationCode: cert.validation_code,
          status: cert.status,
        });
      }
    }

    return res.status(404).json({ error: `Rota não encontrada: ${method} ${path}` });

  } catch (err) {
    console.error("[API Error]", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
