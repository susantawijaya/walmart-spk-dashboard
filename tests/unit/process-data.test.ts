import { describe, expect, it } from "vitest";

import {
  buildDatasetSummary,
  parseWalmartCsv,
} from "@/lib/data/process";
import { calculateStoreMetrics } from "@/lib/analytics/store-metrics";

const miniCsv = `Store,Date,Weekly_Sales,Holiday_Flag,Temperature,Fuel_Price,CPI,Unemployment
1,05-02-2010,100,0,42.31,2.572,211.09,8.106
1,12-02-2010,200,1,38.51,2.548,211.24,8.106
2,05-02-2010,50,0,45.00,2.600,210.00,7.000
2,12-02-2010,150,1,44.00,2.610,210.10,7.000`;

describe("preprocessing Walmart", () => {
  it("mengubah tanggal dan tipe data CSV dengan benar", () => {
    const records = parseWalmartCsv(miniCsv);

    expect(records).toHaveLength(4);
    expect(records[0]).toMatchObject({
      store: 1,
      date: "2010-02-05",
      year: 2010,
      weeklySales: 100,
      isHoliday: false,
    });
  });

  it("menghitung metrik toko tanpa menggandakan penjualan", () => {
    const metrics = calculateStoreMetrics(parseWalmartCsv(miniCsv));

    expect(metrics).toHaveLength(2);
    expect(metrics[0]).toMatchObject({
      store: 1,
      recordCount: 2,
      totalSales: 300,
      averageWeeklySales: 150,
      averageHolidaySales: 200,
      highSalesWeekRate: 0.5,
    });
  });

  it("membuat ringkasan dataset", () => {
    const summary = buildDatasetSummary(parseWalmartCsv(miniCsv));

    expect(summary.dataset.rowCount).toBe(4);
    expect(summary.dataset.storeCount).toBe(2);
    expect(summary.overall.totalSales).toBe(500);
    expect(summary.overall.holidaySales).toBe(350);
  });
});
