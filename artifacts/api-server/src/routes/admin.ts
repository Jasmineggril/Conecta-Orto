import { Router } from "express";
import { db } from "@workspace/db";
import {
  registrationsTable, enrollmentsTable, minicoursesTable,
  speakersTable, galleryItemsTable, sponsorsTable, certificatesTable,
  confirmationTokensTable,
} from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import crypto from "node:crypto";

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required but not set");
  return secret;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, getJwtSecret());
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

/* POST /admin/login */
router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Senha incorreta" });
  }
  const token = jwt.sign({ admin: true }, getJwtSecret(), { expiresIn: "8h" });
  return res.json({ token });
});

/* GET /admin/stats */
router.get("/admin/stats", authMiddleware, async (_req, res) => {
  const [{ count: totalRegistrants }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrationsTable);

  const [{ count: confirmed }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrationsTable)
    .where(eq(registrationsTable.emailConfirmed, true));

  const [{ count: speakerCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(speakersTable);

  const [{ count: certCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(certificatesTable);

  const courses = await db.select().from(minicoursesTable);
  const counts = await db
    .select({ minicourseId: enrollmentsTable.minicourseId, count: sql<number>`count(*)::int` })
    .from(enrollmentsTable)
    .groupBy(enrollmentsTable.minicourseId);

  const countMap = Object.fromEntries(counts.map((c) => [c.minicourseId, c.count]));

  return res.json({
    totalRegistrants,
    confirmed,
    pending: totalRegistrants - confirmed,
    speakerCount,
    certCount,
    minicourseEnrollments: courses.map((c) => ({
      id: c.id,
      title: c.title,
      enrollmentCount: countMap[c.id] ?? 0,
      maxCapacity: c.maxCapacity,
      active: c.active,
    })),
  });
});

/* GET /admin/registrants — full list */
router.get("/admin/registrants", authMiddleware, async (_req, res) => {
  const registrants = await db.select().from(registrationsTable).orderBy(registrationsTable.createdAt);

  const enrollments = await db
    .select({
      registrationId: enrollmentsTable.registrationId,
      minicourseId: minicoursesTable.id,
      title: minicoursesTable.title,
    })
    .from(enrollmentsTable)
    .innerJoin(minicoursesTable, eq(enrollmentsTable.minicourseId, minicoursesTable.id));

  const enrollMap: Record<number, { id: number; title: string }[]> = {};
  for (const e of enrollments) {
    if (!enrollMap[e.registrationId]) enrollMap[e.registrationId] = [];
    enrollMap[e.registrationId].push({ id: e.minicourseId, title: e.title });
  }

  return res.json(
    registrants.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      city: r.city,
      profession: r.profession,
      status: r.status,
      emailConfirmed: r.emailConfirmed,
      eventPresence: r.eventPresence,
      certificateReleased: r.certificateReleased,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt?.toISOString() ?? null,
      minicourses: enrollMap[r.id] ?? [],
    }))
  );
});

/* PUT /admin/registrants/:id — edit student */
router.put("/admin/registrants/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const { name, email, phone, city, profession, status, emailConfirmed, eventPresence, certificateReleased } = req.body;
  const [reg] = await db
    .update(registrationsTable)
    .set({ name, email, phone, city, profession, status, emailConfirmed, eventPresence, certificateReleased, updatedAt: new Date() })
    .where(eq(registrationsTable.id, id))
    .returning();
  if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });
  return res.json({ ...reg, createdAt: reg.createdAt.toISOString() });
});

/* DELETE /admin/registrants/:id */
router.delete("/admin/registrants/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.registrationId, id));
  await db.delete(confirmationTokensTable).where(eq(confirmationTokensTable.registrationId, id));
  await db.delete(registrationsTable).where(eq(registrationsTable.id, id));
  return res.json({ success: true });
});

/* POST /admin/registrants/:id/presence — mark event presence */
router.post("/admin/registrants/:id/presence", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { present } = req.body as { present: boolean };
  await db.update(registrationsTable).set({ eventPresence: present, updatedAt: new Date() }).where(eq(registrationsTable.id, id));
  return res.json({ success: true });
});

/* POST /admin/registrants/:id/release-certificate */
router.post("/admin/registrants/:id/release-certificate", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { released } = req.body as { released: boolean };
  await db.update(registrationsTable).set({ certificateReleased: released, updatedAt: new Date() }).where(eq(registrationsTable.id, id));
  return res.json({ success: true });
});

/* POST /admin/registrants/:id/confirm — manually confirm email */
router.post("/admin/registrants/:id/confirm", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(registrationsTable).set({
    emailConfirmed: true,
    emailConfirmedAt: new Date(),
    status: "confirmado",
    updatedAt: new Date(),
  }).where(eq(registrationsTable.id, id));
  return res.json({ success: true });
});

/* POST /admin/registrants/:id/enrollments — add to minicourse */
router.post("/admin/registrants/:id/enrollments", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { minicourseId } = req.body as { minicourseId: number };
  try {
    await db.insert(enrollmentsTable).values({ registrationId: id, minicourseId });
    return res.status(201).json({ success: true });
  } catch {
    return res.status(409).json({ error: "Já inscrito" });
  }
});

/* DELETE /admin/registrants/:id/enrollments/:minicourseId — remove from minicourse */
router.delete("/admin/registrants/:id/enrollments/:minicourseId", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const minicourseId = Number(req.params.minicourseId);
  await db.delete(enrollmentsTable).where(
    and(eq(enrollmentsTable.registrationId, id), eq(enrollmentsTable.minicourseId, minicourseId))
  );
  return res.json({ success: true });
});

/* ─── Admin: Minicourses CRUD ─────────────────────────────────── */
const minicourseSchema = z.object({
  title: z.string().min(1),
  instructor: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  maxCapacity: z.number().int().positive().default(30),
  type: z.string().default("pratico"),
  active: z.boolean().default(true),
  date: z.string().default(""),
  time: z.string().default(""),
  location: z.string().default(""),
  workload: z.string().default("4 horas"),
  generatesCertificate: z.boolean().default(true),
  enrollmentsClosed: z.boolean().default(false),
});

router.post("/admin/minicourses", authMiddleware, async (req, res) => {
  const parsed = minicourseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(minicoursesTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

router.put("/admin/minicourses/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = minicourseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(minicoursesTable).set(parsed.data).where(eq(minicoursesTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Minicurso não encontrado" });
  return res.json(row);
});

router.delete("/admin/minicourses/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.minicourseId, id));
  await db.delete(minicoursesTable).where(eq(minicoursesTable.id, id));
  return res.json({ success: true });
});

/* ─── Admin: Speakers CRUD ───────────────────────────────────── */
const speakerSchema = z.object({
  name: z.string().min(1),
  title: z.string().default(""),
  institution: z.string().default(""),
  bio: z.string().default(""),
  talkTopic: z.string().default(""),
  talkDate: z.string().default(""),
  talkTime: z.string().default(""),
  linkedinUrl: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

router.post("/admin/speakers", authMiddleware, async (req, res) => {
  const parsed = speakerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(speakersTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

router.put("/admin/speakers/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = speakerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(speakersTable).set(parsed.data).where(eq(speakersTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Palestrante não encontrado" });
  return res.json(row);
});

router.delete("/admin/speakers/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(speakersTable).where(eq(speakersTable.id, id));
  return res.json({ success: true });
});

/* ─── Admin: Gallery CRUD ────────────────────────────────────── */
const gallerySchema = z.object({
  title: z.string().default(""),
  caption: z.string().default(""),
  altText: z.string().default(""),
  imageUrl: z.string().min(1),
  category: z.string().default("geral"),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

router.post("/admin/gallery", authMiddleware, async (req, res) => {
  const parsed = gallerySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(galleryItemsTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

router.put("/admin/gallery/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = gallerySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(galleryItemsTable).set(parsed.data).where(eq(galleryItemsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Item não encontrado" });
  return res.json(row);
});

router.delete("/admin/gallery/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(galleryItemsTable).where(eq(galleryItemsTable.id, id));
  return res.json({ success: true });
});

/* ─── Admin: Sponsors CRUD ───────────────────────────────────── */
const sponsorSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().default(""),
  websiteUrl: z.string().default(""),
  category: z.string().default("apoio"),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

router.post("/admin/sponsors", authMiddleware, async (req, res) => {
  const parsed = sponsorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(sponsorsTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

router.put("/admin/sponsors/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = sponsorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(sponsorsTable).set(parsed.data).where(eq(sponsorsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Patrocinador não encontrado" });
  return res.json(row);
});

router.delete("/admin/sponsors/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(sponsorsTable).where(eq(sponsorsTable.id, id));
  return res.json({ success: true });
});

/* ─── Admin: Certificates CRUD ──────────────────────────────── */
router.get("/admin/certificates", authMiddleware, async (_req, res) => {
  const certs = await db
    .select({
      id: certificatesTable.id,
      type: certificatesTable.type,
      validationCode: certificatesTable.validationCode,
      workload: certificatesTable.workload,
      status: certificatesTable.status,
      issuedAt: certificatesTable.issuedAt,
      registrationId: certificatesTable.registrationId,
      minicourseId: certificatesTable.minicourseId,
      name: registrationsTable.name,
      email: registrationsTable.email,
      minicourseTitle: minicoursesTable.title,
    })
    .from(certificatesTable)
    .innerJoin(registrationsTable, eq(certificatesTable.registrationId, registrationsTable.id))
    .leftJoin(minicoursesTable, eq(certificatesTable.minicourseId, minicoursesTable.id));

  return res.json(certs.map(c => ({ ...c, issuedAt: c.issuedAt.toISOString() })));
});

/* POST /admin/certificates/generate — generate cert for a registration */
router.post("/admin/certificates/generate", authMiddleware, async (req, res) => {
  const { registrationId, type, minicourseId, workload } = req.body as {
    registrationId: number;
    type: "event" | "minicourse";
    minicourseId?: number;
    workload?: string;
  };

  // Check if already exists
  const existing = await db
    .select()
    .from(certificatesTable)
    .where(
      type === "minicourse" && minicourseId
        ? and(eq(certificatesTable.registrationId, registrationId), eq(certificatesTable.minicourseId, minicourseId))
        : and(eq(certificatesTable.registrationId, registrationId), eq(certificatesTable.type, "event"))
    )
    .limit(1);

  if (existing.length > 0) return res.status(409).json({ error: "Certificado já existe", cert: existing[0] });

  const validationCode = crypto.randomBytes(16).toString("hex").toUpperCase();
  const [cert] = await db.insert(certificatesTable).values({
    registrationId,
    minicourseId: minicourseId ?? null,
    type,
    validationCode,
    workload: workload ?? (type === "event" ? "10 horas" : "4 horas"),
  }).returning();

  return res.status(201).json({ ...cert, issuedAt: cert.issuedAt.toISOString() });
});

/* PUT /admin/certificates/:id/status — cancel or reactivate */
router.put("/admin/certificates/:id/status", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: "ativo" | "cancelado" };
  const [cert] = await db
    .update(certificatesTable)
    .set({ status, cancelledAt: status === "cancelado" ? new Date() : null })
    .where(eq(certificatesTable.id, id))
    .returning();
  if (!cert) return res.status(404).json({ error: "Certificado não encontrado" });
  return res.json({ ...cert, issuedAt: cert.issuedAt.toISOString() });
});

export default router;
