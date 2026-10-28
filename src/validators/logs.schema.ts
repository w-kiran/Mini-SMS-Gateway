import { z } from "zod";

export const logsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "sent", "failed"]).optional(),
  recipient: z.string().optional(),
  from: z.coerce.date().optional(), // start of the date range
  to: z.coerce.date().optional(), // end of the date range
});