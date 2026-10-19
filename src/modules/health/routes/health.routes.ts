import { Router } from "express";
import { asyncHandler } from "@/lib/async-handler";
import { pool } from "@/db/pool";
import { redis } from "@/lib/redis";

export const healthRouter = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [health]
 *     summary: Liveness probe
 *     responses:
 *       "200":
 *         description: Process is alive
 */
healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }),
);

/**
 * @openapi
 * /api/health/ready:
 *   get:
 *     tags: [health]
 *     summary: Readiness probe (checks PostgreSQL and Redis)
 *     responses:
 *       "200":
 *         description: All dependencies reachable
 *       "503":
 *         description: At least one dependency is down
 */
healthRouter.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    const checks: Record<string, "up" | "down"> = { database: "down", redis: "down" };

    try {
      await pool.query("SELECT 1");
      checks.database = "up";
    } catch {
      /* stays down */
    }

    try {
      const pong = await redis.ping();
      if (pong === "PONG") checks.redis = "up";
    } catch {
      /* stays down */
    }

    const ready = Object.values(checks).every((s) => s === "up");
    res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable", checks });
  }),
);
