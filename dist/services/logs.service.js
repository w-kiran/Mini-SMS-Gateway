"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = getLogs;
const prisma_1 = require("../db/prisma");
const phone_1 = require("../utils/phone");
const sms_service_1 = require("./sms.service");
async function getLogs(userId, q) {
    // userId is always in the filter, so users only see their own messages
    const where = {
        userId,
        status: q.status,
        to: q.recipient ? ((0, phone_1.normalizePhone)(q.recipient) ?? q.recipient) : undefined,
        createdAt: { gte: q.from, lte: q.to },
    };
    const [items, total] = await Promise.all([
        prisma_1.prisma.message.findMany({
            where,
            select: sms_service_1.messageFields,
            orderBy: { createdAt: "desc" },
            skip: (q.page - 1) * q.limit,
            take: q.limit,
        }),
        prisma_1.prisma.message.count({ where }),
    ]);
    return { items, page: q.page, limit: q.limit, total };
}
