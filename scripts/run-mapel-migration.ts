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
    // 1. Eksekusi skema inti
    const schemaSql = fs.readFileSync(path.join(process.cwd(), "scripts/schema.sql"), "utf8");
    console.log("Menjalankan migrasi skema inti...");
    await pool.query(schemaSql);

    // 2. Eksekusi tabel anchor & kolom AI
    const anchorSql = fs.readFileSync(path.join(process.cwd(), "scripts/add_anchor_table.sql"), "utf8");
    console.log("Menjalankan migrasi anchor & AI...");
    await pool.query(anchorSql);

    // 3. Eksekusi data seed utama (guru, skkni, jadwal)
    const seedSql = fs.readFileSync(path.join(process.cwd(), "scripts/seed.sql"), "utf8");
    console.log("Menjalankan data seed...");
    await pool.query(seedSql);

    // 4. Eksekusi mata pelajaran & kktp engine
    const sqlPath = path.join(process.cwd(), "scripts/add_mapel_and_kktp_engine.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log("Menjalankan migrasi database Mata Pelajaran & KKTP Engine...");
    await pool.query(sql);

    // 5. Pastikan dimensi embedding 768 untuk Gemini Embedding
    console.log("Memastikan tipe kolom embedding vector(768)...");
    await pool.query("ALTER TABLE unit_kompetensi ALTER COLUMN embedding TYPE vector(768);");

    // 6. Jalankan pembaruan embedding untuk unit kompetensi
    console.log("Menjalankan embedding unit kompetensi dengan Gemini...");
    const { embedAllUnits } = await import("../lib/data-access-db");
    const embeddedIds = await embedAllUnits();
    console.log(`Berhasil embed ${embeddedIds.length} unit kompetensi ke PostgreSQL!`);

    console.log("Seluruh migrasi BERHASIL dieksekusi!");

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
