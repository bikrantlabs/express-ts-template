import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { AppError } from "@/lib/errors";

interface ErrorResponseBody {
  status: "error";
  message: string;
  details?: unknown;
  stack?: string;
}

// Express identifies error-handling middleware by arity (4 params) — keep all four.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = err.flatten();
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const logPayload = { err, path: req.originalUrl, method: req.method };

  if (statusCode >= 500) {
    logger.error(logPayload, "Unhandled error");
  } else {
    logger.warn(logPayload, "Request error");
  }

  const body: ErrorResponseBody = { status: "error", message };
  if (details !== undefined) body.details = details;
  if (env.NODE_ENV === "development" && err instanceof Error) body.stack = err.stack;

  res.status(statusCode).json(body);
}
