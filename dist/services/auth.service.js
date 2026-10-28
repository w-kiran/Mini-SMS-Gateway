"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCredits = getCredits;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function makeToken(userId) {
    return jsonwebtoken_1.default.sign({ id: userId }, env_1.env.JWT_SECRET, { expiresIn: "1d" });
}
async function registerUser(email, password) {
    const cleanEmail = email.toLowerCase();
    const exists = await prisma_1.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (exists)
        throw (0, errors_1.appError)(409, "EMAIL_EXISTS", "Email already registered");
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    // the wallet is the credits column, new users start with 100 credits
    const user = await prisma_1.prisma.user.create({ data: { email: cleanEmail, passwordHash } });
    return { user: { id: user.id, email: user.email }, token: makeToken(user.id) };
}
async function loginUser(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const valid = user ? await bcryptjs_1.default.compare(password, user.passwordHash) : false;
    // same message for "no such user" and "wrong password", so nobody can probe emails
    if (!user || !valid)
        throw (0, errors_1.appError)(401, "INVALID_CREDENTIALS", "Wrong email or password");
    return { token: makeToken(user.id) };
}
async function getCredits(userId) {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return user.credits;
}
