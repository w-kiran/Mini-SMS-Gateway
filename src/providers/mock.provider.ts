import type { Provider } from "@prisma/client";
import { prisma } from "../db/prisma";

// current balance of a provider, read from the database
export async function getBalance(providerId: string) {
  const p = await prisma.provider.findUniqueOrThrow({ where: { id: providerId } });
  return p.balance;
}

// Take balance atomically. Returns false if the provider does not have enough.
export async function reserveBalance(providerId: string, amount: number) {
  const rows = await prisma.$executeRaw`
    UPDATE "Provider" SET balance = balance - ${amount}
    WHERE id = ${providerId} AND balance >= ${amount}`;
  return rows === 1;
}

// Give balance back (used when a send fails)
export async function releaseBalance(providerId: string, amount: number) {
  await prisma.$executeRaw`
    UPDATE "Provider" SET balance = balance + ${amount} WHERE id = ${providerId}`;
}

// Simulated network call. failureRate 0 = always succeeds, 1 = always fails.
export async function sendThroughProvider(provider: Provider): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return Math.random() >= provider.failureRate;
}