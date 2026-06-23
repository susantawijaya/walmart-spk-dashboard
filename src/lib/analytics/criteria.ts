import type { CriterionDefinition } from "@/lib/data/contracts";

export const CRITERIA: CriterionDefinition[] = [
  {
    id: "totalSales",
    code: "C1",
    label: "Total Penjualan",
    description: "Akumulasi penjualan mingguan toko selama periode dataset.",
    type: "benefit",
    weight: 0.3,
    metricKey: "totalSales",
    format: "currency",
  },
  {
    id: "averageWeeklySales",
    code: "C2",
    label: "Rata-rata Penjualan Mingguan",
    description: "Kemampuan toko menghasilkan penjualan pada minggu biasa.",
    type: "benefit",
    weight: 0.2,
    metricKey: "averageWeeklySales",
    format: "currency",
  },
  {
    id: "holidayLift",
    code: "C3",
    label: "Kenaikan Penjualan Hari Libur",
    description: "Perubahan rata-rata penjualan minggu hari libur dibandingkan minggu biasa.",
    type: "benefit",
    weight: 0.15,
    metricKey: "holidayLift",
    format: "percentage",
  },
  {
    id: "salesGrowthRate",
    code: "C4",
    label: "Pertumbuhan Penjualan",
    description: "Perubahan rata-rata penjualan 25% periode terakhir terhadap 25% periode awal.",
    type: "benefit",
    weight: 0.15,
    metricKey: "salesGrowthRate",
    format: "percentage",
  },
  {
    id: "salesVolatility",
    code: "C5",
    label: "Volatilitas Penjualan",
    description: "Koefisien variasi penjualan; nilai lebih rendah berarti lebih stabil.",
    type: "cost",
    weight: 0.1,
    metricKey: "salesVolatility",
    format: "percentage",
  },
  {
    id: "lowSalesWeekRate",
    code: "C6",
    label: "Rasio Minggu Penjualan Rendah",
    description: "Proporsi minggu dengan penjualan di bawah 75% rata-rata toko.",
    type: "cost",
    weight: 0.1,
    metricKey: "lowSalesWeekRate",
    format: "percentage",
  },
];

export const AHP_IMPORTANCE = [6, 4, 3, 3, 2, 2] as const;

export function buildPairwiseMatrix(
  importance: readonly number[] = AHP_IMPORTANCE,
): number[][] {
  return importance.map((rowValue) =>
    importance.map((columnValue) => rowValue / columnValue),
  );
}
