import { db } from "@workspace/db";
import { minicoursesTable } from "@workspace/db";

const minicourses = [
  {
    title: "Biomecânica dos Implantes Ortopédicos",
    instructor: "Prof. Dr. Carlos Mendes",
    description: "Fundamentos de biomecânica aplicados ao design e seleção de implantes ortopédicos modernos.",
    duration: "3h",
    maxCapacity: 30,
  },
  {
    title: "Técnicas Cirúrgicas Minimamente Invasivas",
    instructor: "Dra. Ana Beatriz Souza",
    description: "Abordagens cirúrgicas modernas com foco em menor tempo de recuperação e melhores resultados clínicos.",
    duration: "3h",
    maxCapacity: 25,
  },
];

async function seed() {
  console.log("Seeding minicourses...");
  for (const m of minicourses) {
    const existing = await db.select().from(minicoursesTable);
    if (existing.length === 0) {
      await db.insert(minicoursesTable).values(m);
      console.log(`Inserted: ${m.title}`);
    } else {
      console.log("Minicourses already seeded, skipping.");
      break;
    }
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
