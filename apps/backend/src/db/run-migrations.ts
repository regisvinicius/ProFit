import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(pool: Pool): Promise<void> {
  const db = drizzle(pool);
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, "../../drizzle"),
  });
}

export async function tableExists(
  pool: Pool,
  tableName: string,
): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );
  return r.rowCount !== null && r.rowCount > 0;
}
