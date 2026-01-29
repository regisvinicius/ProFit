import "dotenv/config";
import argon2 from "argon2";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { type DatabaseSchema, schemaForDb, users } from "./schemas/index.js";

const TEST_EMAIL = "test@gmail.com";
const TEST_PASSWORD = "test";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: url });
const db = drizzle<DatabaseSchema>(pool, { schema: schemaForDb });

const existing = await db.query.users.findFirst({
  where: eq(users.email, TEST_EMAIL),
});
if (existing) {
  console.log(`User ${TEST_EMAIL} already exists, skip seed.`);
  await pool.end();
  process.exit(0);
}

const passwordHash = await argon2.hash(TEST_PASSWORD);
await db.insert(users).values({ email: TEST_EMAIL, passwordHash });
console.log(`Seeded user ${TEST_EMAIL}.`);
await pool.end();
process.exit(0);
