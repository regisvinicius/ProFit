/**
 * Domain types for profit intelligence.
 * Plain types and numbers — no Fastify, no DB. Used by domain/profit.ts.
 */

export type FeeType = "percent" | "fixed";

export interface SaleInput {
  quantity: number;
  unitPrice: number;
  feeAmount?: number;
}

export interface ProductInput {
  unitCost: number | null;
}

export interface FeeRuleInput {
  feeType: FeeType;
  value: number;
}

export interface ExtraCostInput {
  amount: number;
}
