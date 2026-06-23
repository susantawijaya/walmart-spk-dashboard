import { parse } from "csv-parse/sync";
import { z } from "zod";

import type {
  DatasetSummary,
  WeeklySalesRecord,
} from "@/lib/data/contracts";

const rawRowSchema = z.object({
  Store: z.string().min(1),
  Date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
  Weekly_Sales: z.string().min(1),
  Holiday_Flag: z.enum(["0", "1"]),
  Temperature: z.string().min(1),
  Fuel_Price: z.string().min(1),
  CPI: z.string().min(1),
  Unemployment: z.string().min(1),
});

export const EXPECTED_COLUMNS = [
  "Store",
  "Date",
  "Weekly_Sales",
  "Holiday_Flag",
  "Temperature",
  "Fuel_Price",
  "CPI",
  "Unemployment",
] as const;

function toFiniteNumber(value: string, field: string, row: number): number {
  const result = Number(value);
  if (!Number.isFinite(result)) {
    throw new Error(`Nilai ${field} pada baris ${row} bukan angka yang valid.`);
  }
  return result;
}

function toIsoDate(value: string, row: number): string {
  const [day, month, year] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Tanggal pada baris ${row} tidak valid: ${value}.`);
  }
  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export function parseWalmartCsv(csvText: string): WeeklySalesRecord[] {
  const header = csvText.split(/\r?\n/, 1)[0]?.split(",") ?? [];
  if (header.join("|") !== EXPECTED_COLUMNS.join("|")) {
    throw new Error(
      `Kolom CSV tidak sesuai. Diharapkan: ${EXPECTED_COLUMNS.join(", ")}.`,
    );
  }
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return rows.map((unvalidatedRow, index) => {
    const rowNumber = index + 2;
    const row = rawRowSchema.parse(unvalidatedRow);
    const date = toIsoDate(row.Date, rowNumber);
    const store = toFiniteNumber(row.Store, "Store", rowNumber);
    if (!Number.isInteger(store) || store <= 0) {
      throw new Error(`Store pada baris ${rowNumber} harus bilangan bulat positif.`);
    }
    return {
      store,
      date,
      year: Number(date.slice(0, 4)),
      weeklySales: toFiniteNumber(row.Weekly_Sales, "Weekly_Sales", rowNumber),
      isHoliday: row.Holiday_Flag === "1",
      temperature: toFiniteNumber(row.Temperature, "Temperature", rowNumber),
      fuelPrice: toFiniteNumber(row.Fuel_Price, "Fuel_Price", rowNumber),
      cpi: toFiniteNumber(row.CPI, "CPI", rowNumber),
      unemployment: toFiniteNumber(row.Unemployment, "Unemployment", rowNumber),
    };
  });
}

export function buildDatasetSummary(
  records: WeeklySalesRecord[],
): DatasetSummary {
  if (records.length === 0) {
    throw new Error("Dataset Walmart tidak boleh kosong.");
  }
  const years = [...new Set(records.map((record) => record.year))].sort();
  const yearSummaries = years.map((year) => {
    const yearRecords = records.filter((record) => record.year === year);
    const totalSales = yearRecords.reduce(
      (sum, record) => sum + record.weeklySales,
      0,
    );
    return {
      year,
      totalSales,
      averageWeeklySales: totalSales / yearRecords.length,
      recordCount: yearRecords.length,
    };
  });
  const bestYear = [...yearSummaries].sort(
    (left, right) => right.totalSales - left.totalSales,
  )[0];
  const sortedDates = records.map((record) => record.date).sort();
  const totalSales = records.reduce(
    (sum, record) => sum + record.weeklySales,
    0,
  );
  const holidaySales = records
    .filter((record) => record.isHoliday)
    .reduce((sum, record) => sum + record.weeklySales, 0);

  return {
    dataset: {
      title: "Walmart Sales",
      sourceUrl: "https://www.kaggle.com/datasets/mikhail1681/walmart-sales",
      fileName: "Walmart_Sales.csv",
      rowCount: records.length,
      columnCount: EXPECTED_COLUMNS.length,
      storeCount: new Set(records.map((record) => record.store)).size,
      years,
      startDate: sortedDates[0],
      endDate: sortedDates.at(-1) ?? sortedDates[0],
      missingCellCount: 0,
    },
    overall: {
      totalSales,
      averageWeeklySales: totalSales / records.length,
      bestWeeklySales: Math.max(...records.map((record) => record.weeklySales)),
      holidaySales,
      nonHolidaySales: totalSales - holidaySales,
      bestYear: bestYear.year,
      bestYearSales: bestYear.totalSales,
    },
    years: yearSummaries,
  };
}
