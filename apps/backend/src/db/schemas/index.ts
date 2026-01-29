export { uuidV7Default } from "./uuid.js";
export { users } from "./users.js";
export { refreshTokens } from "./refreshTokens.js";
export { feeTypeEnum } from "./enums.js";
export { channels } from "./channels.js";
export { products } from "./products.js";
export { feeRules } from "./feeRules.js";
export { sales } from "./sales.js";
export { costs } from "./costs.js";

import { channels } from "./channels.js";
import { costs } from "./costs.js";
import { feeRules } from "./feeRules.js";
import { products } from "./products.js";
import { refreshTokens } from "./refreshTokens.js";
import { sales } from "./sales.js";
import { users } from "./users.js";

/** Schema object passed to drizzle(); export type for Fastify augmentation. */
export const schemaForDb = {
  users,
  refreshTokens,
  channels,
  products,
  feeRules,
  sales,
  costs,
};
export type DatabaseSchema = typeof schemaForDb;
