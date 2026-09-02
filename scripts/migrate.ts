import { pool } from "../lib/db";
import fs from "fs";
import path from "path";

async function main() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "scripts/add_anchor_table.sql"), "utf8");
    await pool.query(sql);
    console.log("Migration successful");
  } catch (error) {
    console.error("Migration failed", error);
  } finally {
    await pool.end();
  }
}
main();
