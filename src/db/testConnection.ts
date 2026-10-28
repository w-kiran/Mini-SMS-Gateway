import "../config/env";
import { prisma } from "./prisma";

async function main() {
  const result = await prisma.$queryRaw`SELECT 1 AS ok`;
  console.log("Database connected:", result);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Database connection failed:", err.message);
  process.exit(1);
});