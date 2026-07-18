/**
 * POST /api/admin/restore
 * Secure endpoint to restore backup data into an empty production database.
 * Protected by ADMIN_PASSWORD. Only works when tables are empty to prevent double-seeding.
 */
import { Router } from "express";
import { pool } from "@workspace/db";
import jwt from "jsonwebtoken";

const router = Router();

function verifyAdmin(req: any): boolean {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return false;
    jwt.verify(auth.slice(7), secret);
    return true;
  } catch {
    return false;
  }
}

router.post("/admin/restore", async (req, res) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const client = await pool.connect();
  try {
    // Safety check: only restore if tables are empty
    const { rows: existing } = await client.query("SELECT count(*)::int AS count FROM minicourses");
    if (existing[0].count > 0) {
      return res.status(409).json({ error: "Banco já possui dados. Restauração cancelada." });
    }

    const { minicourses = [], speakers = [], sponsors = [], gallery = [],
            homepage = {}, registrants = [] } = req.body;

    await client.query("BEGIN");

    // Minicourses
    for (const m of minicourses) {
      await client.query(
        `INSERT INTO minicourses (id,title,instructor,description,duration,max_capacity,type,active,date,"time",location,workload,generates_certificate,enrollments_closed,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO NOTHING`,
        [m.id,m.title,m.instructor,m.description,m.duration,m.max_capacity,m.type,m.active,
         m.date,m.time,m.location,m.workload,m.generates_certificate,m.enrollments_closed,m.created_at]
      );
    }

    // Reset minicourses sequence
    if (minicourses.length > 0) {
      const maxId = Math.max(...minicourses.map((m: any) => m.id));
      await client.query(`SELECT setval('minicourses_id_seq', $1)`, [maxId]);
    }

    // Speakers
    for (const s of speakers) {
      await client.query(
        `INSERT INTO speakers (id,name,title,institution,bio,talk_topic,talk_date,talk_time,linkedin_url,photo_url,display_order,active,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [s.id,s.name,s.title,s.institution,s.bio,s.talkTopic??s.talk_topic,
         s.talkDate??s.talk_date,s.talkTime??s.talk_time,
         s.linkedinUrl??s.linkedin_url,s.photoUrl??s.photo_url,
         s.displayOrder??s.display_order,s.active,s.createdAt??s.created_at]
      );
    }
    if (speakers.length > 0) {
      const maxId = Math.max(...speakers.map((s: any) => s.id));
      await client.query(`SELECT setval('speakers_id_seq', $1)`, [maxId]);
    }

    // Sponsors
    for (const s of sponsors) {
      await client.query(
        `INSERT INTO sponsors (id,name,logo_url,website_url,category,display_order,active,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [s.id,s.name,s.logoUrl??s.logo_url,s.websiteUrl??s.website_url,
         s.category,s.displayOrder??s.display_order,s.active,s.createdAt??s.created_at]
      );
    }
    if (sponsors.length > 0) {
      const maxId = Math.max(...sponsors.map((s: any) => s.id));
      await client.query(`SELECT setval('sponsors_id_seq', $1)`, [maxId]);
    }

    // Gallery
    for (const g of gallery) {
      await client.query(
        `INSERT INTO gallery_items (id,title,caption,alt_text,image_url,category,display_order,active,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [g.id,g.title,g.caption,g.altText??g.alt_text,g.imageUrl??g.image_url,
         g.category,g.displayOrder??g.display_order,g.active,g.createdAt??g.created_at]
      );
    }

    // Homepage content
    for (const [key, value] of Object.entries(homepage)) {
      await client.query(
        `INSERT INTO homepage_content (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2`,
        [key, String(value)]
      );
    }

    // Registrations
    for (const r of registrants) {
      await client.query(
        `INSERT INTO registrations (id,name,email,phone,city,profession,status,email_confirmed,email_confirmed_at,event_presence,certificate_released,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [r.id,r.name,r.email,r.phone,r.city,r.profession,r.status,
         r.emailConfirmed??r.email_confirmed,r.emailConfirmedAt??r.email_confirmed_at,
         r.eventPresence??r.event_presence,r.certificateReleased??r.certificate_released,
         r.createdAt??r.created_at,r.updatedAt??r.updated_at]
      );
    }
    if (registrants.length > 0) {
      const maxId = Math.max(...registrants.map((r: any) => r.id));
      await client.query(`SELECT setval('registrations_id_seq', $1)`, [maxId]);
    }

    // Enrollments (from registrants.minicourses field)
    let enrollmentCount = 0;
    for (const r of registrants) {
      for (const m of (r.minicourses ?? [])) {
        try {
          await client.query(
            `INSERT INTO enrollments (registration_id, minicourse_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [r.id, m.id ?? m.minicourseId]
          );
          enrollmentCount++;
        } catch {}
      }
    }

    await client.query("COMMIT");

    return res.json({
      success: true,
      restored: {
        minicourses: minicourses.length,
        speakers: speakers.length,
        sponsors: sponsors.length,
        gallery: gallery.length,
        registrations: registrants.length,
        enrollments: enrollmentCount,
      }
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("[restore]", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
