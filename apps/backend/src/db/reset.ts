import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Pool } from "pg";
import { runMigrations } from "./run-migrations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try local package .env first, then root .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

console.warn(
	`[DB RESET] Database reset script started by PID ${process.pid} at ${new Date().toISOString()}`,
);
console.warn(`[DB RESET] Target: ${url.split("@").pop()}`);
const pool = new Pool({ connectionString: url });
await pool.query("DROP SCHEMA public CASCADE");
await pool.query("CREATE SCHEMA public");
console.log("Schema reset");
await runMigrations(pool);
console.log("Migrations done");
await pool.end();
process.exit(0);
