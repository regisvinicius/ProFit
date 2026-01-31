import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: url });
const db = drizzle(pool);
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations done");
await pool.end();
process.exit(0);
