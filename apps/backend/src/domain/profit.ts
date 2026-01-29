/**
 * Profit intelligence: revenue, fee, cost of goods, profit, margin.
 * Pure functions — no Fastify, no DB. All amounts in same currency (number).
 */

import type {
  ExtraCostInput,
  FeeRuleInput,
  ProductInput,
  SaleInput,
} from "./entities.js";

/** Revenue = quantity × unitPrice */
export function computeRevenue(sale: SaleInput): number {
  return sale.quantity * sale.unitPrice;
}

/** Fee from rule: percent = (value/100) × revenue; fixed = value (per sale). */
export function computeFeeFromRule(
  revenue: number,
  rule: FeeRuleInput,
): number {
  if (rule.feeType === "percent") return (rule.value / 100) * revenue;
  return rule.value;
}

/** Cost of goods = quantity × unitCost (0 if no unitCost). */
export function computeCostOfGoods(
  sale: SaleInput,
  product: ProductInput,
): number {
  const unitCost = product.unitCost ?? 0;
  return sale.quantity * unitCost;
}

/** Sum of extra costs (e.g. shipping) attached to the sale. */
export function totalExtraCosts(costs: ExtraCostInput[]): number {
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

/**
 * Net profit = revenue − fee − costOfGoods − extraCosts.
 * Fee can be precomputed (sale.feeAmount) or from rule; here we use provided feeAmount.
 */
export function computeProfit(
  revenue: number,
  feeAmount: number,
  costOfGoods: number,
  extraCosts: number,
): number {
  return revenue - feeAmount - costOfGoods - extraCosts;
}

/** Margin = (profit / revenue) × 100; 0 if revenue is 0. */
export function computeMarginPercent(profit: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

/**
 * All-in-one: from sale + product + fee amount + extra costs → revenue, profit, margin.
 */
export function analyzeSale(
  sale: SaleInput,
  product: ProductInput,
  feeAmount: number,
  extraCostsList: ExtraCostInput[],
): {
  revenue: number;
  feeAmount: number;
  costOfGoods: number;
  extraCosts: number;
  profit: number;
  marginPercent: number;
} {
  const revenue = computeRevenue(sale);
  const costOfGoods = computeCostOfGoods(sale, product);
  const extraCosts = totalExtraCosts(extraCostsList);
  const profit = computeProfit(revenue, feeAmount, costOfGoods, extraCosts);
  const marginPercent = computeMarginPercent(profit, revenue);
  return {
    revenue,
    feeAmount,
    costOfGoods,
    extraCosts,
    profit,
    marginPercent,
  };
}
