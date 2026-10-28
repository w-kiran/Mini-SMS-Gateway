import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { credentialsSchema } from "../validators/auth.schema";
import { registerUser, loginUser, getCredits } from "../services/auth.service";
import { ok } from "../utils/response";
import { parse } from "../utils/validate";

export const authRouter = Router();

authRouter.post("/auth/register", async (req, res) => {
  const { email, password } = parse(credentialsSchema, req.body);
  ok(res, await registerUser(email, password), 201);
});

authRouter.post("/auth/login", async (req, res) => {
  const { email, password } = parse(credentialsSchema, req.body);
  ok(res, await loginUser(email, password));
});

authRouter.get("/wallet", requireAuth, async (_req, res) => {
  // the user id comes from the token, never from the request
  ok(res, { credits: await getCredits(res.locals.userId) });
});