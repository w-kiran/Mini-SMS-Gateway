import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { ok } from "../utils/response";
import { parse } from "../utils/validate";
import { toggleRouteSchema } from "../validators/route.schema";
import { getRouteHealth, setRouteActive } from "../services/health.service";

export const healthRouter = Router();

// any logged-in user can see route health
healthRouter.get("/routes/health", requireAuth, async (_req, res) => {
  ok(res, await getRouteHealth());
});

// toggle a route active/inactive (forces failover for demos)
healthRouter.patch("/routes/:id", requireAuth, async (req, res) => {
  const { active } = parse(toggleRouteSchema, req.body);
  ok(res, await setRouteActive(req.params.id as string, active));
});