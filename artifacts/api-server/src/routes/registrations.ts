import { Router } from "express";
import { db } from "@workspace/db";
import { registrationsTable, enrollmentsTable, minicoursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  city: z.string().min(1),
  profession: z.string().min(1),
});

router.post("/registrations", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const existing = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.email, parsed.data.email))
    .limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Email já cadastrado" });
  }

  const [reg] = await db.insert(registrationsTable).values(parsed.data).returning();
  return res.status(201).json({ ...reg, createdAt: reg.createdAt.toISOString() });
});

router.get("/registrations", async (_req, res) => {
  const result = await db.select().from(registrationsTable);
  return res.json({ count: result.length });
});

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
    })
    .from(enrollmentsTable)
    .innerJoin(minicoursesTable, eq(enrollmentsTable.minicourseId, minicoursesTable.id))
    .where(eq(enrollmentsTable.registrationId, reg.id));

  return res.json({
    ...reg,
    createdAt: reg.createdAt.toISOString(),
    enrollments,
  });
});

router.get("/registrations/by-id/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const [reg] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, id))
    .limit(1);
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

  return res.json({
    ...reg,
    createdAt: reg.createdAt.toISOString(),
    enrollments,
  });
});

export default router;
