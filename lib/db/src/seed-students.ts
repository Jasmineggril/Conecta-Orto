import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { registrationsTable, enrollmentsTable, minicoursesTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

/* ── MINICURSOS EXTRAS ─────────────────────────────────── */
const newMinicourses = [
  {
    title: "Introdução aos Implantes Ortopédicos",
    instructor: "Dr. Marcos Figueiredo",
    description: "Visão geral dos principais tipos de implantes utilizados na ortopedia moderna, indicações clínicas e critérios de escolha.",
    duration: "1h30",
    maxCapacity: 40,
    type: "teoria",
    date: "23/08/2026",
    time: "08h00",
    location: "Sala de Aula 01",
    workload: "2 horas",
    generatesCertificate: true,
    enrollmentsClosed: false,
    active: true,
  },
  {
    title: "Artroscopia: Técnicas e Simulação",
    instructor: "Dr. Thiago Almeida",
    description: "Simulação prática de procedimentos artroscópicos com uso de modelos anatômicos. Técnicas de acesso e manejo de instrumental.",
    duration: "2h",
    maxCapacity: 20,
    type: "pratico",
    date: "23/08/2026",
    time: "10h00",
    location: "Laboratório 01",
    workload: "2 horas",
    generatesCertificate: true,
    enrollmentsClosed: false,
    active: true,
  },
  {
    title: "Prótese Total de Quadril: Do Diagnóstico à Cirurgia",
    instructor: "Dr. Eduardo Meireles",
    description: "Abordagem completa da coxartrose: diagnóstico por imagem, planejamento pré-operatório e técnica cirúrgica da artroplastia total de quadril.",
    duration: "2h",
    maxCapacity: 25,
    type: "clinico",
    date: "23/08/2026",
    time: "13h00",
    location: "Laboratório 02",
    workload: "2 horas",
    generatesCertificate: true,
    enrollmentsClosed: false,
    active: true,
  },
  {
    title: "Fixação de Fraturas: Placas e Parafusos",
    instructor: "Dr. André Castilho",
    description: "Princípios de osteossíntese com foco em placas bloqueadas e parafusos canulados. Casos clínicos e discussão de complicações.",
    duration: "1h30",
    maxCapacity: 30,
    type: "pratico",
    date: "23/08/2026",
    time: "15h00",
    location: "Laboratório 03",
    workload: "2 horas",
    generatesCertificate: true,
    enrollmentsClosed: false,
    active: true,
  },
  {
    title: "Inteligência Artificial aplicada à Ortopedia",
    instructor: "Eng. Rafael Torres",
    description: "Uso de algoritmos de IA para análise de imagens radiológicas, planejamento cirúrgico assistido e predição de resultados clínicos.",
    duration: "1h30",
    maxCapacity: 35,
    type: "tecnologia",
    date: "23/08/2026",
    time: "16h30",
    location: "Sala de Treinamento",
    workload: "2 horas",
    generatesCertificate: true,
    enrollmentsClosed: false,
    active: true,
  },
];

/* ── 60 ALUNOS ─────────────────────────────────────────── */
const cidades = [
  "Brasília", "Goiânia", "Belo Horizonte", "São Paulo", "Rio de Janeiro",
  "Salvador", "Fortaleza", "Recife", "Manaus", "Curitiba",
  "Porto Alegre", "Belém", "Natal", "Maceió", "Teresina",
  "Campo Grande", "João Pessoa", "Aracaju", "Macapá", "Palmas",
];

const profissoes = [
  "Médico Ortopedista", "Residente em Ortopedia", "Acadêmico de Medicina",
  "Fisioterapeuta", "Enfermeiro", "Biomédico", "Engenheiro Biomédico",
  "Técnico de Radiologia", "Acadêmico de Fisioterapia",
];

const nomes = [
  "Ana Carolina Silva", "Bruno Henrique Santos", "Camila Rodrigues Lima",
  "Daniel Ferreira Costa", "Eduarda Martins Alves", "Felipe Oliveira Souza",
  "Gabriela Nascimento Pereira", "Henrique Araujo Moreira", "Isabela Carvalho Dias",
  "João Pedro Ribeiro", "Karla Cristina Fonseca", "Lucas Mendes Barbosa",
  "Mariana Gomes Freitas", "Nicolas Andrade Pinto", "Olivia Batista Correia",
  "Paulo Roberto Teixeira", "Queila Fernandes Novaes", "Rafael Torres Magalhães",
  "Sabrina Lima Castro", "Thiago Alves Vieira", "Úrsula Monteiro Ramos",
  "Vinícius Pereira Cruz", "Wanessa Costa Rocha", "Xavier Silva Nunes",
  "Yasmin Araújo Campos", "Zélio Borges Matos", "Amanda Cunha Lopes",
  "Bernardo Faria Reis", "Cecília Prado Vasconcelos", "Diego Sousa Mendonça",
  "Elisa Tavares Guimarães", "Fábio Cardoso Moura", "Giovanna Leite Azevedo",
  "Hélio Pires Miranda", "Ingrid Cavalcante Brito", "Jonas Macêdo Sampaio",
  "Karina Duarte Rezende", "Leonardo Siqueira Braga", "Mônica Esteves Queiroz",
  "Natália Lobato Figueiredo", "Otávio Rangel Medeiros", "Priscila Viana Domingues",
  "Quirino Bastos Valente", "Renata Melo Lacerda", "Sérgio Paiva Wanderley",
  "Tatiana Freire Albuquerque", "Ugo Fontes Carneiro", "Vera Lúcia Marinho",
  "Wellington Dias Flores", "Xênia Pinheiro Coutinho", "Yara Bentes Uchôa",
  "Zilmar Cordeiro Sepúlveda", "Aline Pacheco Drumond", "Bruno Lemos Holanda",
  "Carla Neves Pedreira", "Danilo Ramos Furtado", "Elena Parente Couto",
  "Frederico Sá Carneiro", "Graça Salgado Vidal", "Igor Menezes Pamplona",
];

const students = nomes.map((name, i) => ({
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${i + 1}@gmail.com`,
  phone: `(61) 9${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
  city: cidades[i % cidades.length],
  profession: profissoes[i % profissoes.length],
  status: i % 3 === 0 ? "confirmado" : "pendente",
  emailConfirmed: i % 3 === 0,
}));

async function seed() {
  console.log("=== Inserindo minicursos extras ===");
  const existingCourses = await db.select().from(minicoursesTable);
  const existingTitles = new Set(existingCourses.map(c => c.title));

  const insertedCourseIds: number[] = [];
  for (const m of newMinicourses) {
    if (!existingTitles.has(m.title)) {
      const [inserted] = await db.insert(minicoursesTable).values(m).returning();
      console.log(`✓ Minicurso: ${m.title}`);
      insertedCourseIds.push(inserted.id);
    } else {
      const existing = existingCourses.find(c => c.title === m.title);
      if (existing) insertedCourseIds.push(existing.id);
      console.log(`- Já existe: ${m.title}`);
    }
  }

  // Todos os IDs de minicursos disponíveis
  const allCourses = await db.select().from(minicoursesTable);
  const allCourseIds = allCourses.map(c => c.id);

  console.log(`\n=== Inserindo 60 alunos ===`);
  const existingEmails = new Set(
    (await db.select({ email: registrationsTable.email }).from(registrationsTable))
      .map(r => r.email)
  );

  let inserted = 0;
  for (const s of students) {
    if (existingEmails.has(s.email)) {
      console.log(`- Já existe: ${s.email}`);
      continue;
    }
    const [reg] = await db.insert(registrationsTable).values({
      name: s.name,
      email: s.email,
      phone: s.phone,
      city: s.city,
      profession: s.profession,
      status: s.status,
      emailConfirmed: s.emailConfirmed,
      emailConfirmedAt: s.emailConfirmed ? new Date() : null,
    }).returning();

    // Matricular em 1 ou 2 minicursos aleatórios
    const shuffled = [...allCourseIds].sort(() => Math.random() - 0.5);
    const count = (inserted % 3 === 0) ? 2 : 1;
    const chosen = shuffled.slice(0, count);
    for (const cId of chosen) {
      await db.insert(enrollmentsTable).values({
        registrationId: reg.id,
        minicourseId: cId,
      }).onConflictDoNothing();
    }

    console.log(`✓ ${s.name} — ${s.city} — ${s.profession}`);
    inserted++;
  }

  console.log(`\n✅ ${inserted} alunos inseridos + ${insertedCourseIds.length} minicursos.`);
  await pool.end();
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
