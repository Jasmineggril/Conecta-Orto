import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  profession: text("profession").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({ id: true, createdAt: true });
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;

export const minicoursesTable = pgTable("minicourses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  instructor: text("instructor").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(30),
  type: text("type").notNull().default("pratico"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMinicourseSchema = createInsertSchema(minicoursesTable).omit({ id: true, createdAt: true });
export type InsertMinicourse = z.infer<typeof insertMinicourseSchema>;
export type Minicourse = typeof minicoursesTable.$inferSelect;

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull().references(() => registrationsTable.id),
  minicourseId: integer("minicourse_id").notNull().references(() => minicoursesTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.registrationId, table.minicourseId),
]);

export const insertEnrollmentSchema = createInsertSchema(enrollmentsTable).omit({ id: true, createdAt: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollmentsTable.$inferSelect;
