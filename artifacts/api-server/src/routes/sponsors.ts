import { Router } from "express";
import { db } from "@workspace/db";
import { sponsorsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const sponsorSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().default(""),
  websiteUrl: z.string().default(""),
  category: z.string().default("apoio"),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

/* GET /sponsors — public, active only */
router.get("/sponsors", async (_req, res) => {
  const rows = await db
    .select()
    .from(sponsorsTable)
    .where(eq(sponsorsTable.active, true))
    .orderBy(asc(sponsorsTable.displayOrder));
  return res.json(rows);
});

/* GET /sponsors/all — admin */
router.get("/sponsors/all", async (_req, res) => {
  const rows = await db
    .select()
    .from(sponsorsTable)
    .orderBy(asc(sponsorsTable.displayOrder));
  return res.json(rows);
});

/* POST /sponsors */
router.post("/sponsors", async (req, res) => {
  const parsed = sponsorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(sponsorsTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

/* PUT /sponsors/:id */
router.put("/sponsors/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = sponsorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(sponsorsTable).set(parsed.data).where(eq(sponsorsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Patrocinador não encontrado" });
  return res.json(row);
});

/* DELETE /sponsors/:id */
router.delete("/sponsors/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(sponsorsTable).where(eq(sponsorsTable.id, id));
  return res.json({ success: true });
});

export default router;
