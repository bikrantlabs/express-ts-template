import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

/**
 * Shared Redis client. Import this wherever you need caching / pub-sub /
 * rate-limit storage. Closed during graceful shutdown in server.ts.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  lazyConnect: false,
  connectTimeout: 5_000,
  // Reconnect forever with capped backoff — a Redis restart should never
  // permanently take the client down, and never hammer the server either.
  retryStrategy: (times) => Math.min(times * 200, 5_000),
});

/**
 * ioredis is an EventEmitter: an unhandled `error` event throws, and that throw
 * lands in `uncaughtException` — which calls `process.exit(1)` in server.ts.
 * So any Redis blip (container restart, dropped socket, idle timeout) would kill
 * the whole API. Log it and swallow it; reconnect is handled by `retryStrategy`,
 * and commands issued while the socket is down fail fast via
 * `maxRetriesPerRequest` so callers (see lib/cache.ts) can degrade to a miss.
 */
redis.on("error", (err: Error) => {
  logger.warn({ err: err.message }, "Redis connection error — retrying");
});

redis.on("reconnecting", (delay: number) => {
  logger.warn({ delay }, "Redis reconnecting");
});

redis.on("ready", () => {
  logger.info("Redis connected");
});
