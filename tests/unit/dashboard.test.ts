import { describe, expect, it } from "vitest";

import { filterRecords, summarizeRecords } from "@/lib/dashboard";
import type { SuperstoreSalesRecord } from "@/lib/data/contracts";

const records: SuperstoreSalesRecord[] = [
  {
    rowId: 1,
    orderId: "O1",
    orderDate: "2017-01-01",
    shipDate: "2017-01-04",
    orderMonth: "2017-01",
    orderYear: 2017,
    shipMode: "Second Class",
    customerId: "C1",
    customerName: "Customer 1",
    segment: "Consumer",
    country: "United States",
    city: "Seattle",
    state: "Washington",
    postalCode: "98101",
    region: "West",
    productId: "P1",
    category: "Technology",
    subCategory: "Phones",
    productName: "Phone A",
    sales: 1000,
    quantity: 2,
    discount: 0.1,
    profit: 200,
    profitMargin: 0.2,
    shippingDays: 3,
    discountRange: "1-10%",
    isLoss: false,
  },
  {
    rowId: 2,
    orderId: "O2",
    orderDate: "2016-01-01",
    shipDate: "2016-01-06",
    orderMonth: "2016-01",
    orderYear: 2016,
    shipMode: "Standard Class",
    customerId: "C2",
    customerName: "Customer 2",
    segment: "Corporate",
    country: "United States",
    city: "Dallas",
    state: "Texas",
    postalCode: "75001",
    region: "Central",
    productId: "P2",
    category: "Furniture",
    subCategory: "Tables",
    productName: "Table B",
    sales: 400,
    quantity: 1,
    discount: 0.5,
    profit: -120,
    profitMargin: -0.3,
    shippingDays: 5,
    discountRange: ">30%",
    isLoss: true,
  },
];

describe("filter dan scorecard dashboard Superstore", () => {
  it("menghubungkan filter tahun, region, segment, dan category", () => {
    const filtered = filterRecords(records, {
      years: [2017],
      startDate: "2017-01-01",
      endDate: "2017-12-31",
      regions: ["West"],
      segments: ["Consumer"],
      categories: ["Technology"],
    });

    expect(filtered).toHaveLength(1);
    expect(summarizeRecords(filtered)).toMatchObject({
      totalSales: 1000,
      totalProfit: 200,
      totalOrders: 1,
      totalQuantity: 2,
      profitMargin: 0.2,
      averageDiscount: 0.1,
      averageShippingDays: 3,
      lossOrderRatio: 0,
    });
  });
});
