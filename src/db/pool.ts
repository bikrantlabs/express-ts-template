import { Pool } from "pg";
import { env } from "@/config/env";

/**
 * Shared pg connection pool. Import this from repositories — never create
 * a new Pool per query. Closed during graceful shutdown in server.ts.
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
