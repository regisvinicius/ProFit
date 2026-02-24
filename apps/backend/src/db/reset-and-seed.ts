import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Pool } from "pg";
import { runMigrations } from "./run-migrations.js";
import { runSeed } from "./seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: url });
await pool.query("DROP SCHEMA public CASCADE");
await pool.query("CREATE SCHEMA public");
console.log("Schema reset");
await runMigrations(pool);
console.log("Migrations done");
await runSeed(pool);
await pool.end();
process.exit(0);
