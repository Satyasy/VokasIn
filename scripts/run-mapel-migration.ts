import fs from "fs";
import path from "path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"?([^"\r\n]+)"?\s*$/);
    if (m) {
      process.env[m[1]] = m[2];
    }
  }
}

async function run() {
  const { pool } = await import("../lib/db");
  try {
    const sqlPath = path.join(process.cwd(), "scripts/add_mapel_and_kktp_engine.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log("Menjalankan migrasi database Mata Pelajaran & KKTP Engine...");
    await pool.query(sql);
    console.log("Migrasi BERHASIL dieksekusi!");

    // Verifikasi data yang baru dimasukkan
    const res = await pool.query("SELECT id, nama_mapel, tingkat_kelas, alokasi_jp_mingguan, rujukan_wsos FROM mata_pelajaran ORDER BY tingkat_kelas, nama_mapel");
    console.log(`Ditemukan ${res.rows.length} mata pelajaran aktif di database:`);
    console.table(res.rows);
  } catch (err) {
    console.error("Migrasi Gagal:", err);
  } finally {
    await pool.end();
  }
}

run();
