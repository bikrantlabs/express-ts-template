import type { NextFunction, Request, Response } from "express";
import { logger } from "@/config/logger";

/**
 * One line per request: `GET /api/items 200 3.1ms`.
 * Level tracks severity so 5xx stand out in a noisy log without a stack dump.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level](line);
  });

  next();
}
