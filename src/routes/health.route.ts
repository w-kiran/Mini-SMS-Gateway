import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { ok } from "../utils/response";
import { getRouteHealth } from "../services/health.service";

export const healthRouter = Router();

// any logged-in user can see route health
healthRouter.get("/routes/health", requireAuth, async (_req, res) => {
  ok(res, await getRouteHealth());
});