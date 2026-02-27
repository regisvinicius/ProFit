import { decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { channels } from "./channels.js";
import { feeTypeEnum } from "./enums.js";
import { uuidV7Default } from "./uuid.js";

export const feeRules = pgTable("fee_rules", {
  id: uuid("id").primaryKey().$defaultFn(uuidV7Default),
  channelId: uuid("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  feeType: feeTypeEnum("fee_type").notNull(),
  value: decimal("value", { precision: 12, scale: 4 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
