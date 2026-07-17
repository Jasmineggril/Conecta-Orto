import {
  pgTable, serial, text, integer, timestamp, unique,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ─── registrations ─────────────────────────────────────────────── */
export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  profession: text("profession").notNull(),
  status: text("status").notNull().default("pendente"),
  emailConfirmed: boolean("email_confirmed").notNull().default(false),
  emailConfirmedAt: timestamp("email_confirmed_at"),
  eventPresence: boolean("event_presence").notNull().default(false),
  certificateReleased: boolean("certificate_released").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true, createdAt: true, updatedAt: true,
  status: true, emailConfirmed: true, emailConfirmedAt: true,
  eventPresence: true, certificateReleased: true,
});
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;

/* ─── confirmation_tokens ───────────────────────────────────────── */
export const confirmationTokensTable = pgTable("confirmation_tokens", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull().references(() => registrationsTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─── minicourses ───────────────────────────────────────────────── */
export const minicoursesTable = pgTable("minicourses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  instructor: text("instructor").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(30),
  type: text("type").notNull().default("pratico"),
  active: boolean("active").notNull().default(true),
  date: text("date").notNull().default(""),
  time: text("time").notNull().default(""),
  location: text("location").notNull().default(""),
  workload: text("workload").notNull().default("4 horas"),
  generatesCertificate: boolean("generates_certificate").notNull().default(true),
  enrollmentsClosed: boolean("enrollments_closed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMinicourseSchema = createInsertSchema(minicoursesTable).omit({ id: true, createdAt: true });
export type InsertMinicourse = z.infer<typeof insertMinicourseSchema>;
export type Minicourse = typeof minicoursesTable.$inferSelect;

/* ─── enrollments ───────────────────────────────────────────────── */
export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull().references(() => registrationsTable.id, { onDelete: "cascade" }),
  minicourseId: integer("minicourse_id").notNull().references(() => minicoursesTable.id, { onDelete: "cascade" }),
  minicoursePresence: boolean("minicourse_presence").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.registrationId, table.minicourseId),
]);

export const insertEnrollmentSchema = createInsertSchema(enrollmentsTable).omit({ id: true, createdAt: true, minicoursePresence: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollmentsTable.$inferSelect;

/* ─── speakers ──────────────────────────────────────────────────── */
export const speakersTable = pgTable("speakers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  institution: text("institution").notNull().default(""),
  bio: text("bio").notNull().default(""),
  talkTopic: text("talk_topic").notNull().default(""),
  talkDate: text("talk_date").notNull().default(""),
  talkTime: text("talk_time").notNull().default(""),
  linkedinUrl: text("linkedin_url"),
  photoUrl: text("photo_url"),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Speaker = typeof speakersTable.$inferSelect;

/* ─── gallery_items ─────────────────────────────────────────────── */
export const galleryItemsTable = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  caption: text("caption").notNull().default(""),
  altText: text("alt_text").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("geral"),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GalleryItem = typeof galleryItemsTable.$inferSelect;

/* ─── homepage_content ──────────────────────────────────────────── */
export const homepageContentTable = pgTable("homepage_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type HomepageContent = typeof homepageContentTable.$inferSelect;

/* ─── sponsors ──────────────────────────────────────────────────── */
export const sponsorsTable = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  websiteUrl: text("website_url").notNull().default(""),
  category: text("category").notNull().default("apoio"),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Sponsor = typeof sponsorsTable.$inferSelect;

/* ─── certificates ──────────────────────────────────────────────── */
export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull().references(() => registrationsTable.id),
  minicourseId: integer("minicourse_id").references(() => minicoursesTable.id),
  type: text("type").notNull(),           // 'event' | 'minicourse'
  validationCode: text("validation_code").notNull().unique(),
  workload: text("workload").notNull().default(""),
  status: text("status").notNull().default("ativo"),  // 'ativo' | 'cancelado'
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

export type Certificate = typeof certificatesTable.$inferSelect;
