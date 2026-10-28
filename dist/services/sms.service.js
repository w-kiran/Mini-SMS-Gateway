"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageFields = void 0;
exports.sendSms = sendSms;
const prisma_1 = require("../db/prisma");
const refund_service_1 = require("./refund.service");
const phone_1 = require("../utils/phone");
const sms_1 = require("../utils/sms");
const errors_1 = require("../utils/errors");
const mock_provider_1 = require("../providers/mock.provider");
// the fields we return to the client
exports.messageFields = {
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
async function deliver(messageId, segments) {
    const providers = await prisma_1.prisma.provider.findMany({ orderBy: { priority: "asc" } });
    for (const provider of providers) {
        // skip providers that do not have enough balance
        if (!(await (0, mock_provider_1.reserveBalance)(provider.id, segments)))
            continue;
        const success = await (0, mock_provider_1.sendThroughProvider)(provider);
        await prisma_1.prisma.providerAttempt.create({
            data: { messageId, providerId: provider.id, success },
        });
        if (success) {
            await prisma_1.prisma.message.updateMany({
                where: { id: messageId, status: "pending" },
                data: { status: "sent", provider: provider.name },
            });
            return;
        }
        // failed: give the provider balance back and try the next provider
        await (0, mock_provider_1.releaseBalance)(provider.id, segments);
    }
    // no provider worked
    await (0, refund_service_1.refundMessage)(messageId);
}
async function sendSms(userId, to, message, key) {
    // 1. validate numbers: one bad number rejects the whole batch
    const { numbers, invalid } = (0, phone_1.validatePhones)(to);
    if (invalid.length > 0) {
        throw (0, errors_1.appError)(400, "INVALID_PHONE_NUMBERS", "Some recipients are invalid", invalid);
    }
    // 2. encoding, segments and cost (1 credit per segment per recipient)
    const info = (0, sms_1.analyzeMessage)(message);
    const totalCost = info.segments * numbers.length;
    // 3. a retry with the same Idempotency-Key returns the old result and charges nothing
    if (key) {
        const old = await prisma_1.prisma.message.findMany({
            where: { userId, idempotencyKey: key },
            select: exports.messageFields,
            orderBy: { to: "asc" },
        });
        if (old.length > 0) {
            const oldCost = old.reduce((sum, m) => sum + m.cost, 0);
            return { replayed: true, data: { totalCost: oldCost, messages: old } };
        }
    }
    // 4. ONE short transaction: deduct credits + create pending messages
    const created = await prisma_1.prisma.$transaction(async (tx) => {
        const updated = await tx.$executeRaw `
      UPDATE "User" SET credits = credits - ${totalCost}
      WHERE id = ${userId} AND credits >= ${totalCost}`;
        if (updated === 0) {
            // throwing inside the transaction rolls everything back
            throw (0, errors_1.appError)(402, "INSUFFICIENT_CREDITS", "Not enough credits");
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
    const messages = await prisma_1.prisma.message.findMany({
        where: { id: { in: created.map((m) => m.id) } },
        select: exports.messageFields,
        orderBy: { to: "asc" },
    });
    return { replayed: false, data: { totalCost, messages } };
}
