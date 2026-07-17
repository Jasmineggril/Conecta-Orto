import { Router } from "express";
import { db } from "@workspace/db";
import { galleryItemsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const gallerySchema = z.object({
  title: z.string().default(""),
  caption: z.string().default(""),
  altText: z.string().default(""),
  imageUrl: z.string().min(1),
  category: z.string().default("geral"),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

/* GET /gallery — public, active only */
router.get("/gallery", async (_req, res) => {
  const rows = await db
    .select()
    .from(galleryItemsTable)
    .where(eq(galleryItemsTable.active, true))
    .orderBy(asc(galleryItemsTable.displayOrder));
  return res.json(rows);
});

/* GET /gallery/all — admin */
router.get("/gallery/all", async (_req, res) => {
  const rows = await db
    .select()
    .from(galleryItemsTable)
    .orderBy(asc(galleryItemsTable.displayOrder));
  return res.json(rows);
});

/* POST /gallery */
router.post("/gallery", async (req, res) => {
  const parsed = gallerySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.insert(galleryItemsTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

/* PUT /gallery/:id */
router.put("/gallery/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const parsed = gallerySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos" });
  const [row] = await db.update(galleryItemsTable).set(parsed.data).where(eq(galleryItemsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Item não encontrado" });
  return res.json(row);
});

/* DELETE /gallery/:id */
router.delete("/gallery/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db.delete(galleryItemsTable).where(eq(galleryItemsTable.id, id));
  return res.json({ success: true });
});

export default router;
