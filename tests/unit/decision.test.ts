import { describe, expect, it } from "vitest";

import { buildSpkResult } from "@/lib/analytics/decision";
import { calculateStoreMetrics } from "@/lib/analytics/store-metrics";
import type { WeeklySalesRecord } from "@/lib/data/contracts";

function record(store: number, date: string, sales: number, holiday = false): WeeklySalesRecord {
  return {
    store,
    date,
    year: 2010,
    weeklySales: sales,
    isHoliday: holiday,
    temperature: 70,
    fuelPrice: 3,
    cpi: 210,
    unemployment: 8,
  };
}

describe("SPK interaktif", () => {
  const records = [
    record(1, "2010-01-01", 100),
    record(1, "2010-02-01", 120),
    record(1, "2010-03-01", 150, true),
    record(1, "2010-04-01", 180),
    record(2, "2010-01-01", 200),
    record(2, "2010-02-01", 205),
    record(2, "2010-03-01", 210, true),
    record(2, "2010-04-01", 205),
  ];

  it("mengubah input kepentingan menjadi bobot AHP yang konsisten", () => {
    const result = buildSpkResult(calculateStoreMetrics(records), [9, 1, 1, 1, 1, 1]);

    expect(result.criteria[0].weight).toBeGreaterThan(0.6);
    expect(result.ahp.consistencyRatio).toBeCloseTo(0, 10);
    expect(result.rankings).toHaveLength(2);
  });

  it("menolak input kepentingan di luar skala 1 sampai 9", () => {
    expect(() =>
      buildSpkResult(calculateStoreMetrics(records), [10, 1, 1, 1, 1, 1]),
    ).toThrow(/skala 1–9/i);
  });
});
