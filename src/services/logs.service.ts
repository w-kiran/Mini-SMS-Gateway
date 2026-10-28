import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { normalizePhone } from "../utils/phone";
import { messageFields } from "./sms.service";

type LogQuery = {
  page: number;
  limit: number;
  status?: "pending" | "sent" | "failed";
  recipient?: string;
  from?: Date;
  to?: Date;
};

export async function getLogs(userId: string, q: LogQuery) {
  // userId is always in the filter, so users only see their own messages
  const where: Prisma.MessageWhereInput = {
    userId,
    status: q.status,
    to: q.recipient ? (normalizePhone(q.recipient) ?? q.recipient) : undefined,
    createdAt: { gte: q.from, lte: q.to },
  };

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where,
      select: messageFields,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.message.count({ where }),
  ]);

  return { items, page: q.page, limit: q.limit, total };
}