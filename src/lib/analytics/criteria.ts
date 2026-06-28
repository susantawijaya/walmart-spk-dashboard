import type { CriterionDefinition } from "@/lib/data/contracts";

export const CRITERIA: CriterionDefinition[] = [
  {
    id: "totalProfit",
    code: "C1",
    label: "Total Profit",
    description: "Total laba aktual produk. Semakin tinggi, semakin layak diprioritaskan.",
    type: "benefit",
    weight: 0.3,
    metricKey: "totalProfit",
    format: "currency",
  },
  {
    id: "totalSales",
    code: "C2",
    label: "Total Sales",
    description: "Total penjualan aktual produk dari transaksi Superstore.",
    type: "benefit",
    weight: 0.25,
    metricKey: "totalSales",
    format: "currency",
  },
  {
    id: "totalQuantity",
    code: "C3",
    label: "Quantity Sold",
    description: "Jumlah unit terjual sebagai bukti permintaan pasar.",
    type: "benefit",
    weight: 0.15,
    metricKey: "totalQuantity",
    format: "number",
  },
  {
    id: "profitMargin",
    code: "C4",
    label: "Profit Margin",
    description: "Rasio profit terhadap sales. Semakin tinggi, semakin sehat secara bisnis.",
    type: "benefit",
    weight: 0.15,
    metricKey: "profitMargin",
    format: "percentage",
  },
  {
    id: "averageDiscount",
    code: "C5",
    label: "Rata-rata Diskon",
    description: "Ketergantungan pada diskon. Semakin rendah, semakin aman untuk margin.",
    type: "cost",
    weight: 0.1,
    metricKey: "averageDiscount",
    format: "percentage",
  },
  {
    id: "lossOrderRatio",
    code: "C6",
    label: "Rasio Transaksi Rugi",
    description: "Persentase transaksi produk yang profitnya negatif. Semakin rendah, semakin baik.",
    type: "cost",
    weight: 0.05,
    metricKey: "lossOrderRatio",
    format: "percentage",
  },
];

export const AHP_IMPORTANCE = [7, 6, 4, 5, 3, 2] as const;

export function buildPairwiseMatrix(
  importance: readonly number[] = AHP_IMPORTANCE,
): number[][] {
  return importance.map((rowValue) =>
    importance.map((columnValue) => rowValue / columnValue),
  );
}
