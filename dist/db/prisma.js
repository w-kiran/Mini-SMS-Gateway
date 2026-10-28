"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// one shared Prisma client for the whole app
exports.prisma = new client_1.PrismaClient({
    transactionOptions: { maxWait: 15000, timeout: 15000 },
});
