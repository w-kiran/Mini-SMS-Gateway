import { Response } from "express";

// Send a success response in our standard format
export function ok(res: Response, data: unknown, status = 200) {
  res.status(status).json({ success: true, data });
}