import "dotenv/config";
import { z } from "zod";

/**
 * Define and validate all environment variables here.
 * Add new variables to the schema — never read `process.env` directly elsewhere in the app.
 *
 * Defaults match docker-compose.yml so a fresh clone works with zero .env editing.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CORS_ORIGIN: z.string().default("*"),

  /* Database */
  DATABASE_URL: z.string().default("postgresql://app:app@localhost:5432/deployforgedb"),

  /* Redis */
  REDIS_URL: z.string().default("redis://localhost:6379"),

  /* SMTP (Mailpit in development) */
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  MAIL_FROM: z.string().email().default("noreply@example.com"),
  MAIL_TO: z.string().email().default("admin@example.com"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
