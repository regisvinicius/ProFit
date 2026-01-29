import { describe, expect, it } from "vitest";
import {
  analyzeSale,
  computeCostOfGoods,
  computeFeeFromRule,
  computeMarginPercent,
  computeProfit,
  computeRevenue,
  totalExtraCosts,
} from "./profit.js";

describe("computeRevenue", () => {
  it("returns quantity × unitPrice", () => {
    expect(computeRevenue({ quantity: 2, unitPrice: 100 })).toBe(200);
    expect(computeRevenue({ quantity: 1, unitPrice: 49.99 })).toBe(49.99);
  });
});

describe("computeFeeFromRule", () => {
  it("percent: (value/100) × revenue", () => {
    expect(computeFeeFromRule(200, { feeType: "percent", value: 15 })).toBe(30);
    expect(computeFeeFromRule(100, { feeType: "percent", value: 10 })).toBe(10);
  });
  it("fixed: returns value", () => {
    expect(computeFeeFromRule(200, { feeType: "fixed", value: 5 })).toBe(5);
  });
});

describe("computeCostOfGoods", () => {
  it("quantity × unitCost when unitCost set", () => {
    expect(
      computeCostOfGoods({ quantity: 3, unitPrice: 50 }, { unitCost: 20 }),
    ).toBe(60);
  });
  it("0 when unitCost null", () => {
    expect(
      computeCostOfGoods({ quantity: 3, unitPrice: 50 }, { unitCost: null }),
    ).toBe(0);
  });
});

describe("totalExtraCosts", () => {
  it("sums amounts", () => {
    expect(
      totalExtraCosts([{ amount: 10 }, { amount: 5 }, { amount: 2.5 }]),
    ).toBe(17.5);
  });
  it("0 for empty list", () => {
    expect(totalExtraCosts([])).toBe(0);
  });
});

describe("computeProfit", () => {
  it("revenue − fee − costOfGoods − extraCosts", () => {
    expect(computeProfit(200, 30, 60, 10)).toBe(100);
    expect(computeProfit(100, 0, 50, 0)).toBe(50);
  });
});

describe("computeMarginPercent", () => {
  it("(profit / revenue) × 100", () => {
    expect(computeMarginPercent(50, 100)).toBe(50);
    expect(computeMarginPercent(25, 100)).toBe(25);
  });
  it("0 when revenue is 0", () => {
    expect(computeMarginPercent(0, 0)).toBe(0);
  });
});

describe("analyzeSale", () => {
  it("returns revenue, fee, costOfGoods, extraCosts, profit, marginPercent", () => {
    const sale = { quantity: 2, unitPrice: 100, feeAmount: 30 };
    const product = { unitCost: 25 };
    const extraCostsList = [{ amount: 5 }];
    const result = analyzeSale(sale, product, 30, extraCostsList);
    expect(result.revenue).toBe(200);
    expect(result.feeAmount).toBe(30);
    expect(result.costOfGoods).toBe(50);
    expect(result.extraCosts).toBe(5);
    expect(result.profit).toBe(115);
    expect(result.marginPercent).toBeCloseTo(57.5, 2);
  });
  it("negative profit when costs exceed revenue", () => {
    const sale = { quantity: 1, unitPrice: 10 };
    const product = { unitCost: 20 };
    const result = analyzeSale(sale, product, 2, []);
    expect(result.profit).toBe(-12);
    expect(result.marginPercent).toBe(-120);
  });
});
