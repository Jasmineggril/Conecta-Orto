import { Router } from "express";
import { db } from "@workspace/db";
import { speakersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

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

/* GET /speakers — public, active only */
router.get("/speakers", async (_req, res) => {
  const rows = await db
    .select()
    .from(speakersTable)
    .where(eq(speakersTable.active, true))
    .orderBy(asc(speakersTable.displayOrder));
  return res.json(rows);
});

/* GET /speakers/all — admin, all */
router.get("/speakers/all", async (_req, res) => {
  const rows = await db
    .select()
    .from(speakersTable)
    .orderBy(asc(speakersTable.displayOrder));
  return res.json(rows);
});

/* POST /speakers */
router.post("/speakers", async (req, res) => {
  const parsed = speakerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(speakersTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

/* PUT /speakers/:id */
router.put("/speakers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = speakerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(speakersTable).set(parsed.data).where(eq(speakersTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Palestrante não encontrado" });
  return res.json(row);
});

/* DELETE /speakers/:id */
router.delete("/speakers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(speakersTable).where(eq(speakersTable.id, id));
  return res.json({ success: true });
});

export default router;
