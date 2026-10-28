import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const providers = [
    { name: "ROUTE_A", priority: 1, balance: 1000, failureRate: 0.2 },
    { name: "ROUTE_B", priority: 2, balance: 1000, failureRate: 0.1 },
    { name: "ROUTE_C", priority: 3, balance: 1000, failureRate: 0 },
  ];

  for (const p of providers) {
    // upsert = create if missing, so running the seed twice is safe
    await prisma.provider.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log("Providers seeded");
}

main().finally(() => prisma.$disconnect());