import {
  decimal,
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { channels } from "./channels.js";
import { products } from "./products.js";
import { users } from "./users.js";
import { uuidV7Default } from "./uuid.js";

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().$defaultFn(uuidV7Default),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  channelId: uuid("channel_id").references(() => channels.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  feeAmount: decimal("fee_amount", { precision: 12, scale: 2 }),
  soldAt: timestamp("sold_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
