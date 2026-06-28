import { describe, expect, it } from "vitest";

import {
  buildDatasetSummary,
  buildProductMetrics,
  parseSuperstoreCsv,
} from "@/lib/data/process";

const miniCsv = `Row ID,Order ID,Order Date,Ship Date,Ship Mode,Customer ID,Customer Name,Segment,Country,City,State,Postal Code,Region,Product ID,Category,Sub-Category,Product Name,Sales,Quantity,Discount,Profit
1,CA-2017-1,1/3/2017,1/6/2017,Second Class,C1,Customer One,Consumer,United States,Seattle,Washington,98101,West,P1,Technology,Phones,Phone A,1000,2,0.1,200
2,CA-2017-2,1/4/2017,1/8/2017,Standard Class,C2,Customer Two,Corporate,United States,Portland,Oregon,97035,West,P1,Technology,Phones,Phone A,500,1,0.2,50
3,CA-2017-3,2/1/2017,2/4/2017,First Class,C3,Customer Three,Consumer,United States,Dallas,Texas,75001,Central,P2,Furniture,Tables,Table B,400,1,0.5,-120`;

describe("preprocessing Superstore", () => {
  it("mengubah transaksi CSV menjadi record sales aktual", () => {
    const records = parseSuperstoreCsv(miniCsv);

    expect(records).toHaveLength(3);
    expect(records[0]).toMatchObject({
      orderId: "CA-2017-1",
      orderDate: "2017-01-03",
      shipDate: "2017-01-06",
      orderMonth: "2017-01",
      region: "West",
      category: "Technology",
      sales: 1000,
      quantity: 2,
      discount: 0.1,
      profit: 200,
      shippingDays: 3,
      discountRange: "1-10%",
      isLoss: false,
    });
    expect(records[2].isLoss).toBe(true);
  });

  it("menghitung metrik produk unik dengan benar", () => {
    const metrics = buildProductMetrics(parseSuperstoreCsv(miniCsv));
    const phone = metrics.find((metric) => metric.productId === "P1");

    expect(metrics).toHaveLength(2);
    expect(phone).toMatchObject({
      productName: "Phone A",
      totalSales: 1500,
      totalProfit: 250,
      totalQuantity: 3,
      orderCount: 2,
      customerCount: 2,
    });
    expect(phone?.profitMargin).toBeCloseTo(250 / 1500, 6);
  });

  it("membuat ringkasan dataset sales", () => {
    const summary = buildDatasetSummary(parseSuperstoreCsv(miniCsv));

    expect(summary.dataset.rowCount).toBe(3);
    expect(summary.dataset.orderCount).toBe(3);
    expect(summary.dataset.productCount).toBe(2);
    expect(summary.overall.totalSales).toBe(1900);
    expect(summary.overall.totalProfit).toBe(130);
  });
});
