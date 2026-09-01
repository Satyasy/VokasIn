import { Pool } from "pg";

// Satu pool per proses — pola standar Next.js (hindari reconnect tiap hot reload).
declare global {
  var _vokasinPool: Pool | undefined;
}

export const pool =
  global._vokasinPool ??
  new Pool({
    // sslmode=require di connection string dipaksa jadi verify-full oleh pg
    // dan menimpa opsi `ssl` di bawah — makanya di-strip di sini, bukan di .env.
    connectionString: process.env.DATABASE_URL?.replace(/[?&]sslmode=require\b/, ""),
    // ponytail: self-signed chain di dev (Supabase pooler lokal / proxy korporat).
    // Kalau prod juga kena, itu bukan self-signed — cek CA sungguhan, jangan lebarkan ini ke prod.
    ssl: process.env.NODE_ENV !== "production" ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global._vokasinPool = pool;
}
