import { prisma } from "../db/prisma";
import { refundMessage } from "./refund.service";
import { validatePhones } from "../utils/phone";
import { analyzeMessage } from "../utils/sms";
import { appError } from "../utils/errors";
import { releaseBalance, reserveBalance, sendThroughProvider } from "../providers/mock.provider";

// the fields we return to the client
export const messageFields = {
  id: true,
  to: true,
  body: true,
  encoding: true,
  segments: true,
  cost: true,
  status: true,
  provider: true,
  createdAt: true,
};

// Try providers in priority order until one works (NO transaction open here)
async function deliver(messageId: string, segments: number) {
  const providers = await prisma.provider.findMany({ orderBy: { priority: "asc" } });

  for (const provider of providers) {
    // skip providers that do not have enough balance
    if (!(await reserveBalance(provider.id, segments))) continue;

    const success = await sendThroughProvider(provider);
    await prisma.providerAttempt.create({
      data: { messageId, providerId: provider.id, success },
    });

    if (success) {
      await prisma.message.updateMany({
        where: { id: messageId, status: "pending" },
        data: { status: "sent", provider: provider.name },
      });
      return;
    }

    // failed: give the provider balance back and try the next provider
    await releaseBalance(provider.id, segments);
  }

  // no provider worked
  await refundMessage(messageId);
}

export async function sendSms(userId: string, to: string[], message: string, key: string | null) {
  // 1. validate numbers: one bad number rejects the whole batch
  const { numbers, invalid } = validatePhones(to);
  if (invalid.length > 0) {
    throw appError(400, "INVALID_PHONE_NUMBERS", "Some recipients are invalid", invalid);
  }

  // 2. encoding, segments and cost (1 credit per segment per recipient)
  const info = analyzeMessage(message);
  const totalCost = info.segments * numbers.length;

  // 3. a retry with the same Idempotency-Key returns the old result and charges nothing
  if (key) {
    const old = await prisma.message.findMany({
      where: { userId, idempotencyKey: key },
      select: messageFields,
      orderBy: { to: "asc" },
    });
    if (old.length > 0) {
      const oldCost = old.reduce((sum, m) => sum + m.cost, 0);
      return { replayed: true, data: { totalCost: oldCost, messages: old } };
    }
  }

  // 4. ONE short transaction: deduct credits + create pending messages
  const created = await prisma.$transaction(async (tx) => {
    const updated = await tx.$executeRaw`
      UPDATE "User" SET credits = credits - ${totalCost}
      WHERE id = ${userId} AND credits >= ${totalCost}`;
    if (updated === 0) {
      // throwing inside the transaction rolls everything back
      throw appError(402, "INSUFFICIENT_CREDITS", "Not enough credits");
    }

    return tx.message.createManyAndReturn({
      data: numbers.map((number) => ({
        userId,
        to: number,
        body: message,
        encoding: info.encoding,
        segments: info.segments,
        cost: info.segments,
        idempotencyKey: key,
      })),
      select: { id: true },
    });
  });

  // 5. the transaction is committed, now send every message through the providers
  await Promise.all(created.map((m) => deliver(m.id, info.segments)));

  // 6. return the final status of every message
  const messages = await prisma.message.findMany({
    where: { id: { in: created.map((m) => m.id) } },
    select: messageFields,
    orderBy: { to: "asc" },
  });
  return { replayed: false, data: { totalCost, messages } };
}