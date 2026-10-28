import { z } from "zod";

export const toggleRouteSchema = z.object({
  active: z.boolean(),
});
