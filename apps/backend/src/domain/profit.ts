import type {
  ExtraCostInput,
  FeeRuleInput,
  ProductInput,
  SaleInput,
} from "./entities.js";

export function computeRevenue(sale: SaleInput): number {
  return sale.quantity * sale.unitPrice;
}

export function computeFeeFromRule(
  revenue: number,
  rule: FeeRuleInput,
): number {
  if (rule.feeType === "percent") return (rule.value / 100) * revenue;
  return rule.value;
}

export function computeCostOfGoods(
  sale: SaleInput,
  product: ProductInput,
): number {
  const unitCost = product.unitCost ?? 0;
  return sale.quantity * unitCost;
}

export function totalExtraCosts(costs: ExtraCostInput[]): number {
  return costs.reduce((sum, c) => sum + c.amount, 0);
}

export function computeProfit(
  revenue: number,
  feeAmount: number,
  costOfGoods: number,
  extraCosts: number,
): number {
  return revenue - feeAmount - costOfGoods - extraCosts;
}

export function computeMarginPercent(profit: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

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
