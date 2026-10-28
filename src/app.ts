import express from "express";
import { authRouter } from "./routes/auth.routes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.get("/ping", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use(authRouter);

// these two must stay last
app.use(notFound);
app.use(errorHandler);

export default app;