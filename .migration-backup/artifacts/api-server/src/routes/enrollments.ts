import { Router } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, minicoursesTable, registrationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const enrollSchema = z.object({
  registrationId: z.number().int().positive(),
  minicourseId: z.number().int().positive(),
});

router.post("/enrollments", async (req, res) => {
  const parsed = enrollSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });

  const { registrationId, minicourseId } = parsed.data;

  const [reg] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.id, registrationId))
    .limit(1);
  if (!reg) return res.status(404).json({ error: "Inscrição não encontrada" });

  const [course] = await db
    .select()
    .from(minicoursesTable)
    .where(eq(minicoursesTable.id, minicourseId))
    .limit(1);
  if (!course) return res.status(404).json({ error: "Minicurso não encontrado" });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.minicourseId, minicourseId));

  if (count >= course.maxCapacity) {
    return res.status(409).json({ error: "Minicurso lotado" });
  }

  try {
    const [enrollment] = await db
      .insert(enrollmentsTable)
      .values(parsed.data)
      .returning();
    return res.status(201).json({ ...enrollment, createdAt: enrollment.createdAt.toISOString() });
  } catch {
    return res.status(409).json({ error: "Já inscrito neste minicurso" });
  }
});

export default router;
