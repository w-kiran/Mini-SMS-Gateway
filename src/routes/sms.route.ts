import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { sendSchema } from "../validators/sms.schema";
import { ok } from "../utils/response";
import { parse } from "../utils/validate";
import { sendSms } from "../services/sms.service";

export const smsRouter = Router();

smsRouter.post("/sms/send", requireAuth, async (req, res) => {
  const { to, message } = parse(sendSchema, req.body);
  const key = req.header("Idempotency-Key") || null;

  const result = await sendSms(res.locals.userId, to, message, key);
  // 201 for a new send, 200 when an old result is returned for a repeated key
  ok(res, result.data, result.replayed ? 200 : 201);
});