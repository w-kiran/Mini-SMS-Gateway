import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { appError } from "../utils/errors";

// Checks the Bearer token and stores the user id in res.locals.userId
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  let id: string;
  try {
    id = (jwt.verify(token, env.JWT_SECRET) as { id: string }).id;
  } catch {
    throw appError(401, "UNAUTHORIZED", "Missing or invalid token");
  }
  res.locals.userId = id;
  next();
}