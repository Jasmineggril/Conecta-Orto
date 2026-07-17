import { Router } from "express";
import { db } from "@workspace/db";
import {
  certificatesTable, registrationsTable, minicoursesTable, enrollmentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

/* GET /certificates/lookup?email= — public: find certs by email */
router.get("/certificates/lookup", async (req, res) => {
  const { email } = req.query as { email: string };
  if (!email) return res.status(400).json({ error: "Email obrigatório" });

  const [reg] = await db
    .select()
    .from(registrationsTable)
    .where(eq(registrationsTable.email, email.toLowerCase()))
    .limit(1);

  if (!reg) return res.status(404).json({ error: "Participante não encontrado" });

  // Check eligibility
  if (!reg.emailConfirmed) {
    return res.status(403).json({
      error: "Cadastro não confirmado. Verifique seu e-mail para confirmar a inscrição.",
    });
  }

  // Get certs
  const certs = await db
    .select({
      id: certificatesTable.id,
      type: certificatesTable.type,
      validationCode: certificatesTable.validationCode,
      workload: certificatesTable.workload,
      status: certificatesTable.status,
      issuedAt: certificatesTable.issuedAt,
      minicourseId: certificatesTable.minicourseId,
      minicourseTitle: minicoursesTable.title,
      minicourseInstructor: minicoursesTable.instructor,
    })
    .from(certificatesTable)
    .leftJoin(minicoursesTable, eq(certificatesTable.minicourseId, minicoursesTable.id))
    .where(and(eq(certificatesTable.registrationId, reg.id), eq(certificatesTable.status, "ativo")));

  // Enrollments for context
  const enrollments = await db
    .select({ title: minicoursesTable.title, instructor: minicoursesTable.instructor, workload: minicoursesTable.workload, generatesCertificate: minicoursesTable.generatesCertificate })
    .from(enrollmentsTable)
    .innerJoin(minicoursesTable, eq(enrollmentsTable.minicourseId, minicoursesTable.id))
    .where(eq(enrollmentsTable.registrationId, reg.id));

  return res.json({
    registration: {
      id: reg.id,
      name: reg.name,
      emailConfirmed: reg.emailConfirmed,
      eventPresence: reg.eventPresence,
      certificateReleased: reg.certificateReleased,
    },
    certificates: certs.map(c => ({ ...c, issuedAt: c.issuedAt.toISOString() })),
    enrollments,
    eligibility: {
      event: reg.emailConfirmed && reg.eventPresence && reg.certificateReleased,
    },
  });
});

/* GET /certificates/validate/:code — public validation */
router.get("/certificates/validate/:code", async (req, res) => {
  const { code } = req.params;

  const [cert] = await db
    .select({
      id: certificatesTable.id,
      type: certificatesTable.type,
      validationCode: certificatesTable.validationCode,
      workload: certificatesTable.workload,
      status: certificatesTable.status,
      issuedAt: certificatesTable.issuedAt,
      name: registrationsTable.name,
      minicourseTitle: minicoursesTable.title,
    })
    .from(certificatesTable)
    .innerJoin(registrationsTable, eq(certificatesTable.registrationId, registrationsTable.id))
    .leftJoin(minicoursesTable, eq(certificatesTable.minicourseId, minicoursesTable.id))
    .where(eq(certificatesTable.validationCode, code.toUpperCase()))
    .limit(1);

  if (!cert) return res.status(404).json({ valid: false, error: "Certificado não encontrado" });

  return res.json({
    valid: cert.status === "ativo",
    name: cert.name,
    type: cert.type,
    title: cert.type === "event" ? "Conecta Orto 2026" : (cert.minicourseTitle ?? ""),
    workload: cert.workload,
    issuedAt: cert.issuedAt.toISOString(),
    validationCode: cert.validationCode,
    status: cert.status,
  });
});

export default router;
