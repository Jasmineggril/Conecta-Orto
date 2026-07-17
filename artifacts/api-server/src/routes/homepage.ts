import { Router } from "express";
import { db } from "@workspace/db";
import { homepageContentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

/* GET /homepage — get all key-value pairs */
router.get("/homepage", async (_req, res) => {
  const rows = await db.select().from(homepageContentTable);
  const content: Record<string, string> = {};
  for (const row of rows) content[row.key] = row.value;
  return res.json(content);
});

/* PUT /homepage — upsert multiple keys at once */
router.put("/homepage", async (req, res) => {
  const updates = req.body as Record<string, string>;
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  for (const [key, value] of Object.entries(updates)) {
    const existing = await db
      .select()
      .from(homepageContentTable)
      .where(eq(homepageContentTable.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(homepageContentTable)
        .set({ value: String(value), updatedAt: new Date() })
        .where(eq(homepageContentTable.key, key));
    } else {
      await db.insert(homepageContentTable).values({ key, value: String(value) });
    }
  }
  return res.json({ success: true });
});

export default router;
