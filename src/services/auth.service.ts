import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

function makeToken(userId: string) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: "1d" });
}

export async function registerUser(email: string, password: string) {
  const cleanEmail = email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (exists) throw new AppError(409, "EMAIL_EXISTS", "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  // the wallet is the credits column, new users start with 100 credits
  const user = await prisma.user.create({ data: { email: cleanEmail, passwordHash } });

  return { user: { id: user.id, email: user.email }, token: makeToken(user.id) };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  // same message for "no such user" and "wrong password", so nobody can probe emails
  if (!user || !valid) throw new AppError(401, "INVALID_CREDENTIALS", "Wrong email or password");

  return { token: makeToken(user.id) };
}

export async function getCredits(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return user.credits;
}