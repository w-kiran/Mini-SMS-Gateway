"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const prisma_1 = require("./prisma");
async function main() {
    const result = await prisma_1.prisma.$queryRaw `SELECT 1 AS ok`;
    console.log("Database connected:", result);
    await prisma_1.prisma.$disconnect();
}
main().catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
});
