import { Pool } from "pg";

// Satu pool per proses — pola standar Next.js (hindari reconnect tiap hot reload).
declare global {
  var _vokasinPool: Pool | undefined;
}

const isSupabase =
  process.env.DATABASE_URL?.includes("supabase.co") ||
  process.env.DATABASE_URL?.includes("supabase.com") ||
  process.env.DATABASE_URL?.includes("pooler.supabase.com");

export const pool =
  global._vokasinPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global._vokasinPool = pool;
}
