import { Pool } from "pg";

// Satu pool per proses — pola standar Next.js (hindari reconnect tiap hot reload).
declare global {
  var _vokasinPool: Pool | undefined;
}

function getDatabaseConfig() {
  const rawConn =
    (process.env.POSTGRES_URL && process.env.POSTGRES_URL.trim() !== "")
      ? process.env.POSTGRES_URL
      : (process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_PRISMA_URL.trim() !== "")
      ? process.env.POSTGRES_PRISMA_URL
      : (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "")
      ? process.env.DATABASE_URL
      : (process.env.POSTGRES_URL_NON_POOLING || "");

  const isSupabase =
    rawConn.includes("supabase.co") ||
    rawConn.includes("supabase.com") ||
    rawConn.includes("pooler.supabase.com");

  let connectionString = rawConn;
  if (isSupabase && connectionString) {
    try {
      const url = new URL(connectionString);
      url.searchParams.delete("sslmode");
      connectionString = url.toString();
    } catch {
      connectionString = connectionString.replace(/[?&]sslmode=[^&]*/, "");
    }
  }

  return {
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  };
}

export const pool =
  global._vokasinPool ??
  new Pool(getDatabaseConfig());

if (process.env.NODE_ENV !== "production") {
  global._vokasinPool = pool;
}

