import { z } from "zod";

export const sendSchema = z.object({
  to: z.array(z.string()).min(1).max(50),
  message: z.string().min(1).max(1000),
});