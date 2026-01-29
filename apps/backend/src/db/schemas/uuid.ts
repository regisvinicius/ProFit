import { v7 as uuidv7 } from "uuid";

/** UUID v7 default for domain tables (channels, products, sales, etc.). */
export const uuidV7Default = (): string => uuidv7();
