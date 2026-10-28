import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

// Unknown route -> JSON 404
export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
}

// Central error handler (it must have exactly 4 parameters)
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
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
}