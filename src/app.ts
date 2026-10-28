import express, { NextFunction, Request, Response } from "express";
import { AppError } from "./utils";

const app = express();

app.use(express.json());

app.get("/ping", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// Unknown route -> JSON 404
app.use((_req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
});

// Central error handler (it must have exactly 4 parameters)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // errors we threw on purpose
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // body that is not valid JSON
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
  }

  // unique constraint broken (for example the same Idempotency-Key used twice at once)
  if (err?.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: { code: "DUPLICATE", message: "Duplicate request" },
    });
  }

  // anything else: log it on the server, send a safe message to the client
  console.error(err);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
});

export default app;