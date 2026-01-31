import { pgEnum } from "drizzle-orm/pg-core";

export const feeTypeEnum = pgEnum("fee_type", ["percent", "fixed"]);
