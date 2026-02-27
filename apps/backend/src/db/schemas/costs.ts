import {
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products.js";
import { sales } from "./sales.js";
import { users } from "./users.js";
import { uuidV7Default } from "./uuid.js";

export const costs = pgTable("costs", {
  id: uuid("id").primaryKey().$defaultFn(uuidV7Default),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  saleId: uuid("sale_id").references(() => sales.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
