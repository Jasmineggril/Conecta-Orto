import { Router } from "express";
import { db } from "@workspace/db";
import {
  registrationsTable, enrollmentsTable, minicoursesTable, confirmationTokensTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import crypto from "node:crypto";
import { sendEmail, buildConfirmationEmail } from "../lib/email";

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  city: z.string().min(1),
  profession: z.string().min(1),
});

function getAppUrl(): string {
  return process.env.APP_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN ?? "localhost"}`;
}

async function createAndSendToken(registrationId: number, email: string, name: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
  await db.insert(confirmationTokensTable).values({ registrationId, token, expiresAt });

  const appUrl = getAppUrl();
  const confirmUrl = `${appUrl}/confirmar/${token}`;
  await sendEmail({
    to: email,
    subject: "Confirme sua inscrição no Conecta Orto 2026",
    html: buildConfirmationEmail({ name, confirmUrl }),
  });
  return token;
}

/* POST /registrations — create */
router.post("/registrations", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });

  const existing = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.email, parsed.data.email))
    .limit(1);
  if (existing.length > 0) return res.status(409).json({ error: "Email já cadastrado" });

  const [reg] = await db.insert(registrationsTable).values(parsed.data).returning();

  // Send confirmation email (non-blocking)
  createAndSendToken(reg.id, reg.email, reg.name).catch(console.error);

  return res.status(201).json({ ...reg, createdAt: reg.createdAt.toISOString() });
});

/* GET /registrations — count (public) */
router.get("/registrations", async (_req, res) => {
  const result = await db.select().from(registrationsTable);
  return res.json({ count: result.length });
});

/* POST /registrations/lookup — find by email */
router.post("/registrations/lookup", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email obrigatório" });

  const [reg] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.email, String(email)))
    .limit(1);
  if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });

  const enrollments = await db
    .select({
      minicourseId: enrollmentsTable.minicourseId,
      title: minicoursesTable.title,
      instructor: minicoursesTable.instructor,
      minicoursePresence: enrollmentsTable.minicoursePresence,
      generatesCertificate: minicoursesTable.generatesCertificate,
      workload: minicoursesTable.workload,
    })
    .from(enrollmentsTable)
    .innerJoin(minicoursesTable, eq(enrollmentsTable.minicourseId, minicoursesTable.id))
    .where(eq(enrollmentsTable.registrationId, reg.id));

  return res.json({ ...reg, createdAt: reg.createdAt.toISOString(), enrollments });
});

/* GET /registrations/by-id/:id */
router.get("/registrations/by-id/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
  if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });

  const enrollments = await db
    .select({
      minicourseId: enrollmentsTable.minicourseId,
      title: minicoursesTable.title,
      instructor: minicoursesTable.instructor,
    })
    .from(enrollmentsTable)
    .innerJoin(minicoursesTable, eq(enrollmentsTable.minicourseId, minicoursesTable.id))
    .where(eq(enrollmentsTable.registrationId, reg.id));

  return res.json({ ...reg, createdAt: reg.createdAt.toISOString(), enrollments });
});

/* GET /registrations/confirm/:token — confirm email */
router.get("/registrations/confirm/:token", async (req, res) => {
  const { token } = req.params;
  const [tokenRow] = await db
    .select()
    .from(confirmationTokensTable)
    .where(eq(confirmationTokensTable.token, token))
    .limit(1);

  if (!tokenRow) return res.status(404).json({ error: "Token inválido" });
  if (tokenRow.usedAt) return res.status(410).json({ error: "Token já utilizado" });
  if (new Date() > tokenRow.expiresAt) return res.status(410).json({ error: "Token expirado" });

  await db
    .update(registrationsTable)
    .set({ emailConfirmed: true, emailConfirmedAt: new Date(), status: "confirmado", updatedAt: new Date() })
    .where(eq(registrationsTable.id, tokenRow.registrationId));

  await db
    .update(confirmationTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(confirmationTokensTable.id, tokenRow.id));

  const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, tokenRow.registrationId)).limit(1);
  return res.json({ success: true, name: reg?.name ?? "" });
});

/* POST /registrations/:id/resend-confirmation */
router.post("/registrations/:id/resend-confirmation", async (req, res) => {
  const id = Number(req.params.id);
  const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
  if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });
  if (reg.emailConfirmed) return res.status(409).json({ error: "E-mail já confirmado" });

  await createAndSendToken(reg.id, reg.email, reg.name);
  return res.json({ success: true });
});

export default router;
