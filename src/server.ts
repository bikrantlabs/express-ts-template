import { createApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { pool } from "@/db/pool";
import { redis } from "@/lib/redis";

/** Wait briefly for Postgres — covers the gap right after `npm run db:up`. */
async function waitForDatabase(retries = 10, delayMs = 500): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      logger.warn(`Database not ready (attempt ${attempt}/${retries}), retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function main(): Promise<void> {
  try {
    await waitForDatabase();
    await redis.ping();
  } catch (err) {
    logger.error(
      { err },
      "Could not reach PostgreSQL/Redis. Is Docker running? Try: npm run db:up && npm run db:migrate",
    );
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📄 API docs at http://localhost:${env.PORT}/api/docs`);
  });

  async function shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received. Shutting down gracefully...`);

    // Armed *inside* shutdown, not at startup. Previously this was set up
    // eagerly, so it fired 10s after boot on every run and killed the server
    // (exit 1, no error logged) — taking down any in-flight page load.
    setTimeout(() => process.exit(1), 10_000).unref();

    server.close((err) => {
      if (err) {
        logger.error(err, "Error closing HTTP server");
        process.exit(1);
      }
    });

    try {
      await Promise.allSettled([pool.end(), redis.quit()]);
    } catch (err) {
      logger.error(err, "Error closing DB/Redis connections");
    }

    logger.info("Server closed. Bye 👋");
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error(reason, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (err) => {
    logger.error(err, "Uncaught exception");
    process.exit(1);
  });
}

void main();
