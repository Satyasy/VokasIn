// Migrasi sekali jalan: embed semua unit_kompetensi yang ada di Postgres
// (HANYA yang sudah diverifikasi manual — lihat scripts/seed.sql). Jalankan:
//   node scripts/embed-unit-kompetensi.ts
import { embedAllUnits } from "../lib/data-access-db";
import { pool } from "../lib/db";

async function main() {
  const ids = await embedAllUnits();
  console.log(`Embedded ${ids.length} unit:`, ids);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
