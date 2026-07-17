import { db } from "@workspace/db";
import { minicoursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const minicourses = [
  {
    title: "Biomecânica dos Implantes Ortopédicos",
    instructor: "Prof. Dr. Carlos Mendes",
    description: "Fundamentos de biomecânica aplicados ao design e seleção de implantes ortopédicos modernos. Entenda por que cada material e geometria importa.",
    duration: "1h30",
    maxCapacity: 30,
    type: "teoria",
  },
  {
    title: "Materiais Biocompatíveis: Do Titânio ao Polietileno",
    instructor: "Profa. Dra. Fernanda Lima",
    description: "Exploração dos principais materiais usados em implantes ortopédicos, suas propriedades, vantagens e limitações na prática clínica.",
    duration: "1h30",
    maxCapacity: 25,
    type: "teoria",
  },
  {
    title: "Técnicas Cirúrgicas Minimamente Invasivas",
    instructor: "Dra. Ana Beatriz Souza",
    description: "Abordagens cirúrgicas modernas com foco em menor tempo de recuperação e melhores resultados clínicos. Demonstração com modelos anatômicos.",
    duration: "2h",
    maxCapacity: 20,
    type: "pratico",
  },
  {
    title: "Impressão 3D e Manufatura Personalizada em Ortopedia",
    instructor: "Eng. Ricardo Oliveira",
    description: "Como a impressão 3D está revolucionando a fabricação de próteses e implantes personalizados. Exemplos reais e tendências futuras.",
    duration: "1h30",
    maxCapacity: 30,
    type: "tecnologia",
  },
  {
    title: "Reabilitação Pós-Implante: O Papel da Fisioterapia",
    instructor: "Ft. Juliana Carvalho",
    description: "Protocolo de reabilitação após colocação de implantes ortopédicos. Exercícios, cuidados e expectativas para o paciente.",
    duration: "1h30",
    maxCapacity: 25,
    type: "clinico",
  },
];

async function seed() {
  console.log("Seeding minicourses...");
  for (const m of minicourses) {
    const existing = await db.select().from(minicoursesTable).where(eq(minicoursesTable.title, m.title));
    if (existing.length === 0) {
      await db.insert(minicoursesTable).values(m);
      console.log(`Inserted: ${m.title}`);
    } else {
      console.log(`Already exists, skipping: ${m.title}`);
    }
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
