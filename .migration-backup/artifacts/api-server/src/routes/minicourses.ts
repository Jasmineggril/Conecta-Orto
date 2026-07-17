import { Router } from "express";
import { db } from "@workspace/db";
import { minicoursesTable, enrollmentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/minicourses", async (_req, res) => {
  const courses = await db.select().from(minicoursesTable);
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
      enrollmentCount: countMap[c.id] ?? 0,
    }))
  );
});

export default router;
