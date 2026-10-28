"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = getBalance;
exports.reserveBalance = reserveBalance;
exports.releaseBalance = releaseBalance;
exports.sendThroughProvider = sendThroughProvider;
const prisma_1 = require("../db/prisma");
// current balance of a provider, read from the database
async function getBalance(providerId) {
    const p = await prisma_1.prisma.provider.findUniqueOrThrow({ where: { id: providerId } });
    return p.balance;
}
// Take balance atomically. Returns false if the provider does not have enough.
async function reserveBalance(providerId, amount) {
    const rows = await prisma_1.prisma.$executeRaw `
    UPDATE "Provider" SET balance = balance - ${amount}
    WHERE id = ${providerId} AND balance >= ${amount}`;
    return rows === 1;
}
// Give balance back (used when a send fails)
async function releaseBalance(providerId, amount) {
    await prisma_1.prisma.$executeRaw `
    UPDATE "Provider" SET balance = balance + ${amount} WHERE id = ${providerId}`;
}
// Simulated network call. failureRate 0 = always succeeds, 1 = always fails.
async function sendThroughProvider(provider) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return Math.random() >= provider.failureRate;
}
