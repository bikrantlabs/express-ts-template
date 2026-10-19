import { redis } from "@/lib/redis";
import { logger } from "@/config/logger";

/**
 * Minimal cache-aside helpers over Redis. Keys store JSON with a TTL.
 * Cache failures never break a request — they degrade to a miss.
 */

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn({ err, key }, "Redis cacheGet failed — treating as miss");
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, "Redis cacheSet failed — skipping");
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    logger.warn({ err, keys }, "Redis cacheDel failed — skipping");
  }
}
