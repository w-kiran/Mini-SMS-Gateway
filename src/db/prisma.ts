import { PrismaClient } from "@prisma/client";

// one shared Prisma client for the whole app
export const prisma = new PrismaClient({
  transactionOptions: { maxWait: 15000, timeout: 15000 },
});