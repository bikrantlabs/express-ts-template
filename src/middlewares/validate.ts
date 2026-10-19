import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

/**
 * Validate and replace req.body / req.params / req.query with Zod-parsed
 * values. Throws flow into the error handler as a 400.
 *
 * Usage: router.post("/", validate({ body: createItemSchema }), handler)
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body) as unknown;
      if (schemas.params) {
        const parsedParams: unknown = schemas.params.parse(req.params);
        req.params = parsedParams as Request["params"];
      }
      if (schemas.query) {
        const parsedQuery: unknown = schemas.query.parse(req.query);
        req.query = parsedQuery as Request["query"];
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
