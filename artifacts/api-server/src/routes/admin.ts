import { Router } from "express";
import { db } from "@workspace/db";
import { registrationsTable, enrollmentsTable, minicoursesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const router = Router();

function getJwtSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "fallback-secret";
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  const token = auth.slice(7);
  try {
    jwt.verify(token, getJwtSecret());
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Senha incorreta" });
  }
  const token = jwt.sign({ admin: true }, getJwtSecret(), { expiresIn: "8h" });
  return res.json({ token });
});

router.get("/admin/registrants", authMiddleware, async (_req: Request, res: Response) => {
  const registrants = await db
    .select()
    .from(registrationsTable)
    .orderBy(registrationsTable.createdAt);

  const enrollments = await db
    .select({
      registrationId: enrollmentsTable.registrationId,
      title: minicoursesTable.title,
    })
    .from(enrollmentsTable)
    .innerJoin(minicoursesTable, eq(enrollmentsTable.minicourseId, minicoursesTable.id));

  const enrollMap: Record<number, string[]> = {};
  for (const e of enrollments) {
    if (!enrollMap[e.registrationId]) enrollMap[e.registrationId] = [];
    enrollMap[e.registrationId].push(e.title);
  }

  return res.json(
    registrants.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      city: r.city,
      profession: r.profession,
      createdAt: r.createdAt.toISOString(),
      minicourses: enrollMap[r.id] ?? [],
    }))
  );
});

router.get("/admin/stats", authMiddleware, async (_req: Request, res: Response) => {
  const [{ count: totalRegistrants }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(registrationsTable);

  const courses = await db.select().from(minicoursesTable);
  const counts = await db
    .select({
      minicourseId: enrollmentsTable.minicourseId,
      count: sql<number>`count(*)::int`,
    })
    .from(enrollmentsTable)
    .groupBy(enrollmentsTable.minicourseId);

  const countMap = Object.fromEntries(counts.map((c) => [c.minicourseId, c.count]));

  return res.json({
    totalRegistrants,
    minicourseEnrollments: courses.map((c) => ({
      id: c.id,
      title: c.title,
      enrollmentCount: countMap[c.id] ?? 0,
      maxCapacity: c.maxCapacity,
    })),
  });
});

export default router;
