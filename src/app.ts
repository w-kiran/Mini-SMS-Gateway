import express from "express";
import { notFound, errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.route";
import { smsRouter } from "./routes/sms.route";
import { healthRouter } from "./routes/health.route";

const app = express();

app.use(express.json());

app.get("/ping", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use(authRouter);
app.use(smsRouter);
app.use(healthRouter);

// these two must stay last
app.use(notFound);
app.use(errorHandler);

export default app;