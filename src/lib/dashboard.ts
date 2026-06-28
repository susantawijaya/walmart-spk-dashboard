import type { SuperstoreSalesRecord } from "@/lib/data/contracts";

export interface DashboardFilters {
  years: number[];
  startDate?: string;
  endDate?: string;
  regions: string[];
  segments: string[];
  categories: string[];
}

export function filterRecords(
  records: SuperstoreSalesRecord[],
  filters: DashboardFilters,
): SuperstoreSalesRecord[] {
  return records.filter((record) => {
    const yearMatches =
      filters.years.length === 0 || filters.years.includes(record.orderYear);
    const startDateMatches =
      !filters.startDate || record.orderDate >= filters.startDate;
    const endDateMatches = !filters.endDate || record.orderDate <= filters.endDate;
    const regionMatches =
      filters.regions.length === 0 || filters.regions.includes(record.region);
    const segmentMatches =
      filters.segments.length === 0 || filters.segments.includes(record.segment);
    const categoryMatches =
      filters.categories.length === 0 || filters.categories.includes(record.category);
    return (
      yearMatches &&
      startDateMatches &&
      endDateMatches &&
      regionMatches &&
      segmentMatches &&
      categoryMatches
    );
  });
}

export function summarizeRecords(records: SuperstoreSalesRecord[]) {
  const totalSales = records.reduce((sum, record) => sum + record.sales, 0);
  const totalProfit = records.reduce((sum, record) => sum + record.profit, 0);
  const average = (values: number[]) =>
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    totalSales,
    totalProfit,
    totalOrders: new Set(records.map((record) => record.orderId)).size,
    totalQuantity: records.reduce((sum, record) => sum + record.quantity, 0),
    profitMargin: totalSales === 0 ? 0 : totalProfit / totalSales,
    averageDiscount: average(records.map((record) => record.discount)),
    averageShippingDays: average(records.map((record) => record.shippingDays)),
    lossOrderRatio:
      records.length === 0
        ? 0
        : records.filter((record) => record.isLoss).length / records.length,
  };
}
