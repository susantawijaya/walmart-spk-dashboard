import type { StoreMetric, WeeklySalesRecord } from "@/lib/data/contracts";

function mean(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateStoreMetrics(
  records: WeeklySalesRecord[],
): StoreMetric[] {
  const grouped = new Map<number, WeeklySalesRecord[]>();
  records.forEach((record) => {
    const current = grouped.get(record.store) ?? [];
    current.push(record);
    grouped.set(record.store, current);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([store, unsortedRecords]) => {
      const storeRecords = [...unsortedRecords].sort((left, right) =>
        left.date.localeCompare(right.date),
      );
      const sales = storeRecords.map((record) => record.weeklySales);
      const averageWeeklySales = mean(sales);
      const holidaySales = storeRecords
        .filter((record) => record.isHoliday)
        .map((record) => record.weeklySales);
      const regularSales = storeRecords
        .filter((record) => !record.isHoliday)
        .map((record) => record.weeklySales);
      const averageHolidaySales = mean(holidaySales);
      const averageRegularSales = mean(regularSales);
      const variance = mean(
        sales.map((value) => (value - averageWeeklySales) ** 2),
      );
      const segmentSize = Math.max(1, Math.floor(storeRecords.length * 0.25));
      const firstPeriodAverage = mean(sales.slice(0, segmentSize));
      const lastPeriodAverage = mean(sales.slice(-segmentSize));

      return {
        store,
        recordCount: storeRecords.length,
        totalSales: sales.reduce((sum, value) => sum + value, 0),
        averageWeeklySales,
        averageHolidaySales,
        averageRegularSales,
        holidayLift:
          averageRegularSales === 0
            ? 0
            : (averageHolidaySales - averageRegularSales) / averageRegularSales,
        salesGrowthRate:
          firstPeriodAverage === 0
            ? 0
            : (lastPeriodAverage - firstPeriodAverage) /
              Math.abs(firstPeriodAverage),
        highSalesWeekRate:
          sales.filter((value) => value >= averageWeeklySales).length / sales.length,
        salesVolatility:
          averageWeeklySales === 0 ? 0 : Math.sqrt(variance) / averageWeeklySales,
        lowSalesWeekRate:
          sales.filter((value) => value < averageWeeklySales * 0.75).length /
          sales.length,
        bestWeeklySales: Math.max(...sales),
        averageTemperature: mean(
          storeRecords.map((record) => record.temperature),
        ),
        averageFuelPrice: mean(storeRecords.map((record) => record.fuelPrice)),
        averageCpi: mean(storeRecords.map((record) => record.cpi)),
        averageUnemployment: mean(
          storeRecords.map((record) => record.unemployment),
        ),
      };
    });
}
