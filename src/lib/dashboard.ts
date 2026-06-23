import type { WeeklySalesRecord } from "@/lib/data/contracts";

export interface DashboardFilters {
  store: "all" | number;
  year: "all" | number;
  holiday: "all" | "holiday" | "regular";
}

export function filterRecords(
  records: WeeklySalesRecord[],
  filters: DashboardFilters,
): WeeklySalesRecord[] {
  return records.filter((record) => {
    const storeMatches = filters.store === "all" || record.store === filters.store;
    const yearMatches = filters.year === "all" || record.year === filters.year;
    const holidayMatches =
      filters.holiday === "all" ||
      (filters.holiday === "holiday" ? record.isHoliday : !record.isHoliday);
    return storeMatches && yearMatches && holidayMatches;
  });
}

export function summarizeRecords(records: WeeklySalesRecord[]) {
  const totalSales = records.reduce(
    (sum, record) => sum + record.weeklySales,
    0,
  );
  const holidayRecords = records.filter((record) => record.isHoliday);
  const holidaySales = holidayRecords.reduce(
    (sum, record) => sum + record.weeklySales,
    0,
  );
  const average = (values: number[]) =>
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    totalSales,
    averageWeeklySales: records.length === 0 ? 0 : totalSales / records.length,
    recordCount: records.length,
    bestWeeklySales:
      records.length === 0
        ? 0
        : Math.max(...records.map((record) => record.weeklySales)),
    holidaySales,
    holidayShare: totalSales === 0 ? 0 : holidaySales / totalSales,
    averageTemperature: average(records.map((record) => record.temperature)),
    averageFuelPrice: average(records.map((record) => record.fuelPrice)),
    averageCpi: average(records.map((record) => record.cpi)),
    averageUnemployment: average(
      records.map((record) => record.unemployment),
    ),
  };
}
