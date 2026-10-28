import { z } from "zod";
import { AppError } from "./errors";

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