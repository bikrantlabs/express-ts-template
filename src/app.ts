import compression from "compression";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "@/config/env";
import { errorHandler } from "@/middlewares/error-handler";
import { notFoundHandler } from "@/middlewares/not-found";
import { requestLogger } from "@/middlewares/request-logger";
import { healthRouter } from "@/modules/health/routes/health.routes";
import { itemsRouter } from "@/modules/items/routes/items.routes";
import { contactRouter } from "@/modules/contact/routes/contact.routes";
import { openApiSpec } from "@/docs/openapi";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          /**
           * Helmet ships `upgrade-insecure-requests` by default. Over plain
           * http on localhost it is actively harmful: browsers rewrite every
           * subresource to https, and since the dev server is plaintext the TLS
           * handshake fails, so Swagger UI's css/js never load and /api/docs
           * renders blank. Firefox exempts localhost, Safari does not — which
           * is why this only reproduced in Safari. Keep it for real https
           * deployments, drop it everywhere else.
           */
          upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
        },
      },
    }),
  );
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(compression());
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "test") {
    app.use(requestLogger);
    app.use(
      "/api",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { status: "error", message: "Too many requests, please try again later." },
      }),
    );
  }

  /* API docs (Swagger UI + raw spec) */
  if (env.NODE_ENV !== "test") {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
    app.get("/api/docs.json", (_req, res) => res.json(openApiSpec));
  }

  /* Root → API docs */
  app.get("/", (_req, res) => res.redirect("/api/docs"));

  /* Feature slices — mount a new one here when you add it */
  app.use("/api/health", healthRouter);
  app.use("/api/items", itemsRouter);
  app.use("/api/contact", contactRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
