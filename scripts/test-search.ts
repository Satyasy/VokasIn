import { searchUnitKompetensiVector, searchUnitKompetensiHybrid } from "../lib/data-access-db";
import { pool } from "../lib/db";

const mode = process.argv[2] === "hybrid" ? "hybrid" : "vector";
const queries = process.argv.slice(3);

async function main() {
  for (const q of queries) {
    const hits = await (mode === "hybrid" ? searchUnitKompetensiHybrid(q, 5) : searchUnitKompetensiVector(q, 5));
    console.log(`\n=== [${mode}] "${q}" ===`);
    for (const h of hits) {
      console.log(`  ${h.score.toFixed(4)}  ${h.kodeUnit}  ${h.judulUnit}`);
    }
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
