import { describe, expect, it } from "vitest";

import { buildSpkResult } from "@/lib/analytics/decision";
import { calculateProductMetrics } from "@/lib/analytics/product-metrics";
import type { SuperstoreSalesRecord } from "@/lib/data/contracts";

function record(
  productId: string,
  sales: number,
  quantity: number,
  discount: number,
  profit: number,
): SuperstoreSalesRecord {
  return {
    rowId: Number(productId.replace(/\D/g, "")) || 1,
    orderId: `O-${productId}`,
    orderDate: "2017-01-01",
    shipDate: "2017-01-04",
    orderMonth: "2017-01",
    orderYear: 2017,
    shipMode: "Second Class",
    customerId: `C-${productId}`,
    customerName: "Customer",
    segment: "Consumer",
    country: "United States",
    city: "Seattle",
    state: "Washington",
    postalCode: "98101",
    region: "West",
    productId,
    category: "Technology",
    subCategory: "Phones",
    productName: `Product ${productId}`,
    sales,
    quantity,
    discount,
    profit,
    profitMargin: sales === 0 ? 0 : profit / sales,
    shippingDays: 3,
    discountRange: discount === 0 ? "0%" : discount > 0.3 ? ">30%" : "11-20%",
    isLoss: profit < 0,
  };
}

describe("SPK produk Superstore", () => {
  const records = [
    record("P1", 1000, 4, 0.1, 250),
    record("P2", 1200, 5, 0.5, -100),
  ];

  it("mengubah input kepentingan menjadi bobot AHP yang konsisten", () => {
    const result = buildSpkResult(calculateProductMetrics(records), [9, 1, 1, 1, 1, 1]);

    expect(result.criteria[0].weight).toBeGreaterThan(0.55);
    expect(result.ahp.consistencyRatio).toBeCloseTo(0, 10);
    expect(result.rankings).toHaveLength(2);
  });

  it("menolak input kepentingan di luar skala 1 sampai 9", () => {
    expect(() =>
      buildSpkResult(calculateProductMetrics(records), [10, 1, 1, 1, 1, 1]),
    ).toThrow(/skala 1-9/i);
  });
});
