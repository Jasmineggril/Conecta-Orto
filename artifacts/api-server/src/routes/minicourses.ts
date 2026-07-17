import { Router } from "express";
import { db } from "@workspace/db";
import { minicoursesTable, enrollmentsTable, registrationsTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

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

/* GET /minicourses — public list (only active) */
router.get("/minicourses", async (_req, res) => {
  const courses = await db.select().from(minicoursesTable).where(eq(minicoursesTable.active, true));
  const counts = await db
    .select({ minicourseId: enrollmentsTable.minicourseId, count: sql<number>`count(*)::int` })
    .from(enrollmentsTable)
    .groupBy(enrollmentsTable.minicourseId);

  const countMap = Object.fromEntries(counts.map((c) => [c.minicourseId, c.count]));

  return res.json(
    courses.map((c) => ({
      id: c.id,
      title: c.title,
      instructor: c.instructor,
      description: c.description,
      duration: c.duration,
      maxCapacity: c.maxCapacity,
      type: c.type,
      active: c.active,
      date: c.date,
      time: c.time,
      location: c.location,
      workload: c.workload,
      generatesCertificate: c.generatesCertificate,
      enrollmentsClosed: c.enrollmentsClosed,
      enrollmentCount: countMap[c.id] ?? 0,
    }))
  );
});

/* GET /minicourses/all — admin list (all) */
router.get("/minicourses/all", async (_req, res) => {
  const courses = await db.select().from(minicoursesTable);
  const counts = await db
    .select({ minicourseId: enrollmentsTable.minicourseId, count: sql<number>`count(*)::int` })
    .from(enrollmentsTable)
    .groupBy(enrollmentsTable.minicourseId);

  const countMap = Object.fromEntries(counts.map((c) => [c.minicourseId, c.count]));

  return res.json(
    courses.map((c) => ({
      ...c,
      enrollmentCount: countMap[c.id] ?? 0,
    }))
  );
});

/* GET /minicourses/:id/enrollees — admin: list of enrolled students */
router.get("/minicourses/:id/enrollees", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const rows = await db
    .select({
      enrollmentId: enrollmentsTable.id,
      registrationId: registrationsTable.id,
      name: registrationsTable.name,
      email: registrationsTable.email,
      phone: registrationsTable.phone,
      emailConfirmed: registrationsTable.emailConfirmed,
      minicoursePresence: enrollmentsTable.minicoursePresence,
    })
    .from(enrollmentsTable)
    .innerJoin(registrationsTable, eq(enrollmentsTable.registrationId, registrationsTable.id))
    .where(eq(enrollmentsTable.minicourseId, id));

  return res.json(rows);
});

/* POST /minicourses/:id/presence/:registrationId — mark presence */
router.post("/minicourses/:id/presence/:registrationId", async (req, res) => {
  const minicourseId = Number(req.params.id);
  const registrationId = Number(req.params.registrationId);
  const { present } = req.body as { present: boolean };

  await db
    .update(enrollmentsTable)
    .set({ minicoursePresence: present })
    .where(and(eq(enrollmentsTable.minicourseId, minicourseId), eq(enrollmentsTable.registrationId, registrationId)));

  return res.json({ success: true });
});

export default router;
