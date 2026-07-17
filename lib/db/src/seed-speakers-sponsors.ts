import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { speakersTable, sponsorsTable, homepageContentTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const speakers = [
  {
    name: "Dr. Carlos Augusto Silva",
    title: "Cirurgião Ortopedista – FMUSP",
    institution: "Faculdade de Medicina USP",
    bio: "Especialista em artroplastia de quadril com mais de 20 anos de experiência clínica e cirúrgica. Coordenador do Serviço de Ortopedia do HC-FMUSP e pesquisador na área de biomateriais.",
    talkTopic: "Abertura Oficial do Conecta Orto 2026",
    talkDate: "23/08/2026",
    talkTime: "08:30",
    displayOrder: 1,
    active: true,
  },
  {
    name: "Dra. Ana Paula Costa",
    title: "Cirurgiã de Joelho – Unifesp",
    institution: "Universidade Federal de São Paulo",
    bio: "Referência nacional em artroplastias de revisão. Membro da SBOT e pesquisadora ativa na área de implantes biocompatíveis e longevidade de próteses.",
    talkTopic: "Medo de implantes: o que a engenharia pode explicar",
    talkDate: "23/08/2026",
    talkTime: "09:00",
    displayOrder: 2,
    active: true,
  },
  {
    name: "Dr. Roberto Alves",
    title: "Ortopedista – UnDF",
    institution: "Universidade do Distrito Federal",
    bio: "Pioneiro em cirurgia robótica ortopédica no Brasil. Realizou mais de 500 cirurgias assistidas por robô e é professor da UnDF no Lago Norte.",
    talkTopic: "Materiais biocompatíveis e segurança no corpo humano",
    talkDate: "23/08/2026",
    talkTime: "10:00",
    displayOrder: 3,
    active: true,
  },
  {
    name: "Dr. Marcos Ferreira",
    title: "Traumatologista – FMRP-USP",
    institution: "Faculdade de Medicina de Ribeirão Preto",
    bio: "Especialista em trauma ortopédico e fixadores internos modernos. Professor associado da FMRP-USP com mais de 150 artigos publicados.",
    talkTopic: "Demonstração: placas, pinos e próteses ortopédicas",
    talkDate: "23/08/2026",
    talkTime: "11:00",
    displayOrder: 4,
    active: true,
  },
  {
    name: "Profa. Dra. Fernanda Lima",
    title: "Engenheira Biomédica – UnB",
    institution: "Universidade de Brasília",
    bio: "Pesquisadora em materiais para implantes ortopédicos. Doutora pela USP com pós-doutorado em biomateriais pela Universidade de Toronto.",
    talkTopic: "Mesa-redonda: tecnologia, saúde e confiança do paciente",
    talkDate: "23/08/2026",
    talkTime: "16:30",
    displayOrder: 5,
    active: true,
  },
];

const sponsors = [
  { name: "Stryker Brasil", logoUrl: "", websiteUrl: "https://www.stryker.com/br", category: "ouro", displayOrder: 1, active: true },
  { name: "Johnson & Johnson MedTech", logoUrl: "", websiteUrl: "https://www.jnjmedtech.com", category: "ouro", displayOrder: 2, active: true },
  { name: "Zimmer Biomet", logoUrl: "", websiteUrl: "https://www.zimmerbiomet.com", category: "prata", displayOrder: 3, active: true },
  { name: "Synthes Brasil", logoUrl: "", websiteUrl: "https://www.synthes.com", category: "prata", displayOrder: 4, active: true },
  { name: "UnDF – Universidade do Distrito Federal", logoUrl: "", websiteUrl: "https://universidade.df.gov.br", category: "apoio", displayOrder: 5, active: true },
  { name: "SBOT – Sociedade Brasileira de Ortopedia", logoUrl: "", websiteUrl: "https://www.sbot.org.br", category: "apoio", displayOrder: 6, active: true },
];

const homepageContent = [
  { key: "hero_title", value: "Conecta Orto 2026" },
  { key: "hero_subtitle", value: "O maior congresso de ortopedia do Centro-Oeste. Ciência, tecnologia e inovação em implantes ortopédicos." },
  { key: "event_date", value: "23 de agosto de 2026" },
  { key: "event_location", value: "Campus UnDF – Lago Norte, Brasília – DF" },
  { key: "event_time", value: "08h00 às 18h00" },
  { key: "about_text", value: "O Conecta Orto 2026 reúne estudantes, profissionais e pesquisadores da área de ortopedia para dois dias de imersão em tecnologia, ciência e prática clínica. Realizado na Universidade do Distrito Federal, o evento oferece minicursos práticos, palestras com especialistas nacionais e uma exposição interativa de implantes ortopédicos." },
];

async function seed() {
  console.log("=== Palestrantes ===");
  for (const s of speakers) {
    const existing = await db.select().from(speakersTable).where(eq(speakersTable.name, s.name));
    if (existing.length === 0) {
      await db.insert(speakersTable).values(s);
      console.log(`✓ ${s.name}`);
    } else {
      await db.update(speakersTable).set(s).where(eq(speakersTable.name, s.name));
      console.log(`~ atualizado: ${s.name}`);
    }
  }

  console.log("\n=== Patrocinadores ===");
  for (const sp of sponsors) {
    const existing = await db.select().from(sponsorsTable).where(eq(sponsorsTable.name, sp.name));
    if (existing.length === 0) {
      await db.insert(sponsorsTable).values(sp);
      console.log(`✓ ${sp.name}`);
    } else {
      console.log(`- Já existe: ${sp.name}`);
    }
  }

  console.log("\n=== Homepage Content ===");
  for (const h of homepageContent) {
    const existing = await db.select().from(homepageContentTable).where(eq(homepageContentTable.key, h.key));
    if (existing.length === 0) {
      await db.insert(homepageContentTable).values(h);
      console.log(`✓ ${h.key}`);
    } else {
      await db.update(homepageContentTable).set({ value: h.value }).where(eq(homepageContentTable.key, h.key));
      console.log(`~ ${h.key}`);
    }
  }

  console.log("\n✅ Feito!");
  await pool.end();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
