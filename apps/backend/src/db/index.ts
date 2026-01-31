import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { type DatabaseSchema, schemaForDb } from "./schemas/index.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: url });
export const db = drizzle<DatabaseSchema>(pool, { schema: schemaForDb });

export async function ping(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
