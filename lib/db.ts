import { Pool } from "pg";

// Satu pool per proses — pola standar Next.js (hindari reconnect tiap hot reload).
declare global {
  var _vokasinPool: Pool | undefined;
}

export const pool =
  global._vokasinPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  global._vokasinPool = pool;
}
