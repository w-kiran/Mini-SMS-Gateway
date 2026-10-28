import { prisma } from "../db/prisma";

// Mark a pending message as failed and give the credits back.
// Safe to call many times: only the first call changes anything.
export async function refundMessage(messageId: string) {
  await prisma.$transaction(async (tx) => {
    // Only a "pending" message can become "failed", so only one caller wins
    const result = await tx.message.updateMany({
      where: { id: messageId, status: "pending" },
      data: { status: "failed" },
    });
    if (result.count === 0) return; // already sent or already refunded

    const msg = await tx.message.findUniqueOrThrow({ where: { id: messageId } });
    await tx.user.update({
      where: { id: msg.userId },
      data: { credits: { increment: msg.cost } },
    });
  });
}

// Refund messages stuck in "pending", for example after the server crashed
export async function recoverPending(olderThanMs = 2 * 60 * 1000) {
  const stuck = await prisma.message.findMany({
    where: { status: "pending", createdAt: { lt: new Date(Date.now() - olderThanMs) } },
    select: { id: true },
  });
  for (const m of stuck) {
    await refundMessage(m.id);
  }
}