import { Response } from "express";
import { z } from "zod";

// An error we throw on purpose, with an HTTP status and a short code
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

// Send a success response in our standard format
export function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ success: true, data });
}

// Check data against a zod schema.
// Returns the clean data, or throws a 400 error listing what is wrong.
export function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request", details);
  }
  return result.data;
}