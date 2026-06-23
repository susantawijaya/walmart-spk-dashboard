import { describe, expect, it } from "vitest";

import { filterRecords, summarizeRecords } from "@/lib/dashboard";
import type { WeeklySalesRecord } from "@/lib/data/contracts";

const records: WeeklySalesRecord[] = [
  { store: 1, date: "2010-01-01", year: 2010, weeklySales: 100, isHoliday: false, temperature: 1, fuelPrice: 1, cpi: 1, unemployment: 1 },
  { store: 1, date: "2011-01-01", year: 2011, weeklySales: 200, isHoliday: true, temperature: 1, fuelPrice: 1, cpi: 1, unemployment: 1 },
  { store: 2, date: "2011-01-01", year: 2011, weeklySales: 300, isHoliday: false, temperature: 1, fuelPrice: 1, cpi: 1, unemployment: 1 },
];

describe("filter dan scorecard dashboard", () => {
  it("menghubungkan filter toko, tahun, dan hari libur", () => {
    const filtered = filterRecords(records, {
      store: 1,
      year: 2011,
      holiday: "holiday",
    });

    expect(filtered).toHaveLength(1);
    expect(summarizeRecords(filtered)).toMatchObject({
      totalSales: 200,
      averageWeeklySales: 200,
      recordCount: 1,
      bestWeeklySales: 200,
      holidaySales: 200,
    });
  });
});
