import { parse } from "csv-parse/sync";
import { z } from "zod";

import type {
  CategorySummary,
  DatasetSummary,
  DiscountRange,
  ProductMetric,
  SuperstoreSalesRecord,
} from "@/lib/data/contracts";

const rawRowSchema = z.object({
  "Row ID": z.string().min(1),
  "Order ID": z.string().min(1),
  "Order Date": z.string().min(1),
  "Ship Date": z.string().min(1),
  "Ship Mode": z.string().min(1),
  "Customer ID": z.string().min(1),
  "Customer Name": z.string().min(1),
  Segment: z.string().min(1),
  Country: z.string().min(1),
  City: z.string().min(1),
  State: z.string().min(1),
  "Postal Code": z.string().optional().default(""),
  Region: z.string().min(1),
  "Product ID": z.string().min(1),
  Category: z.string().min(1),
  "Sub-Category": z.string().min(1),
  "Product Name": z.string().min(1),
  Sales: z.string().min(1),
  Quantity: z.string().min(1),
  Discount: z.string().min(1),
  Profit: z.string().min(1),
});

export const EXPECTED_COLUMNS = [
  "Row ID",
  "Order ID",
  "Order Date",
  "Ship Date",
  "Ship Mode",
  "Customer ID",
  "Customer Name",
  "Segment",
  "Country",
  "City",
  "State",
  "Postal Code",
  "Region",
  "Product ID",
  "Category",
  "Sub-Category",
  "Product Name",
  "Sales",
  "Quantity",
  "Discount",
  "Profit",
] as const;

function cleanNumber(value: string): number {
  const result = Number(value.replace(/[$,]/g, "").trim());
  return Number.isFinite(result) ? result : 0;
}

function parseDate(value: string): Date {
  const [month, day, year] = value.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatMonth(value: Date): string {
  return value.toISOString().slice(0, 7);
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function discountRange(discount: number): DiscountRange {
  if (discount === 0) return "0%";
  if (discount <= 0.1) return "1-10%";
  if (discount <= 0.2) return "11-20%";
  if (discount <= 0.3) return "21-30%";
  return ">30%";
}

function profitMargin(profit: number, sales: number): number {
  return sales === 0 ? 0 : profit / sales;
}

export function parseSuperstoreCsv(csvText: string): SuperstoreSalesRecord[] {
  const header = csvText.split(/\r?\n/, 1)[0]?.split(",") ?? [];
  const cleanHeader = header.map((item) => item.trim().replace(/^"|"$/g, ""));

  if (cleanHeader.join("|") !== EXPECTED_COLUMNS.join("|")) {
    throw new Error(
      `Kolom CSV Superstore tidak sesuai. Diharapkan: ${EXPECTED_COLUMNS.join(", ")}. Ditemukan: ${cleanHeader.join(", ")}`,
    );
  }

  const rows = parse(csvText, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return rows.map((unvalidatedRow) => {
    const row = rawRowSchema.parse(unvalidatedRow);
    const orderDate = parseDate(row["Order Date"]);
    const shipDate = parseDate(row["Ship Date"]);
    const sales = cleanNumber(row.Sales);
    const quantity = cleanNumber(row.Quantity);
    const discount = cleanNumber(row.Discount);
    const profit = cleanNumber(row.Profit);

    return {
      rowId: cleanNumber(row["Row ID"]),
      orderId: row["Order ID"],
      orderDate: formatDate(orderDate),
      shipDate: formatDate(shipDate),
      orderMonth: formatMonth(orderDate),
      orderYear: orderDate.getUTCFullYear(),
      shipMode: row["Ship Mode"],
      customerId: row["Customer ID"],
      customerName: row["Customer Name"],
      segment: row.Segment,
      country: row.Country,
      city: row.City,
      state: row.State,
      postalCode: row["Postal Code"],
      region: row.Region,
      productId: row["Product ID"],
      category: row.Category,
      subCategory: row["Sub-Category"],
      productName: row["Product Name"],
      sales,
      quantity,
      discount,
      profit,
      profitMargin: profitMargin(profit, sales),
      shippingDays: daysBetween(orderDate, shipDate),
      discountRange: discountRange(discount),
      isLoss: profit < 0,
    };
  });
}

export function buildProductMetrics(records: SuperstoreSalesRecord[]): ProductMetric[] {
  const grouped = new Map<string, SuperstoreSalesRecord[]>();
  records.forEach((record) => {
    grouped.set(record.productId, [...(grouped.get(record.productId) ?? []), record]);
  });

  return [...grouped.entries()].map(([productId, productRecords]) => {
    const first = productRecords[0];
    const totalSales = productRecords.reduce((sum, record) => sum + record.sales, 0);
    const totalProfit = productRecords.reduce((sum, record) => sum + record.profit, 0);
    const orderIds = new Set(productRecords.map((record) => record.orderId));
    const customerIds = new Set(productRecords.map((record) => record.customerId));
    const average = (values: number[]) =>
      values.length === 0
        ? 0
        : values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
      productId,
      productName: first.productName,
      category: first.category,
      subCategory: first.subCategory,
      totalSales,
      totalProfit,
      totalQuantity: productRecords.reduce((sum, record) => sum + record.quantity, 0),
      orderCount: orderIds.size,
      customerCount: customerIds.size,
      averageDiscount: average(productRecords.map((record) => record.discount)),
      profitMargin: profitMargin(totalProfit, totalSales),
      lossOrderRatio:
        productRecords.filter((record) => record.isLoss).length / productRecords.length,
      averageShippingDays: average(productRecords.map((record) => record.shippingDays)),
    };
  });
}

export function buildDatasetSummary(
  records: SuperstoreSalesRecord[],
): DatasetSummary {
  if (records.length === 0) {
    throw new Error("Dataset Superstore tidak boleh kosong.");
  }

  const metrics = buildProductMetrics(records);
  const orderIds = new Set(records.map((record) => record.orderId));
  const customerIds = new Set(records.map((record) => record.customerId));
  const categories = [...new Set(records.map((record) => record.category))].sort();
  const subCategories = new Set(records.map((record) => record.subCategory));
  const totalSales = records.reduce((sum, record) => sum + record.sales, 0);
  const totalProfit = records.reduce((sum, record) => sum + record.profit, 0);
  const average = (values: number[]) =>
    values.length === 0
      ? 0
      : values.reduce((sum, value) => sum + value, 0) / values.length;

  const categorySummaries: CategorySummary[] = categories
    .map((category) => {
      const categoryRecords = records.filter((record) => record.category === category);
      const categorySales = categoryRecords.reduce((sum, record) => sum + record.sales, 0);
      const categoryProfit = categoryRecords.reduce((sum, record) => sum + record.profit, 0);
      return {
        category,
        totalSales: categorySales,
        totalProfit: categoryProfit,
        totalQuantity: categoryRecords.reduce((sum, record) => sum + record.quantity, 0),
        orderCount: new Set(categoryRecords.map((record) => record.orderId)).size,
        profitMargin: profitMargin(categoryProfit, categorySales),
        averageDiscount: average(categoryRecords.map((record) => record.discount)),
      };
    })
    .sort((left, right) => right.totalSales - left.totalSales);

  const subCategoryProfit = [...new Set(records.map((record) => record.subCategory))]
    .map((subCategory) => {
      const subCategoryRecords = records.filter(
        (record) => record.subCategory === subCategory,
      );
      return {
        subCategory,
        totalProfit: subCategoryRecords.reduce((sum, record) => sum + record.profit, 0),
      };
    })
    .sort((left, right) => right.totalProfit - left.totalProfit);
  const sortedDates = records.map((record) => record.orderDate).sort();

  return {
    dataset: {
      title: "Sample Superstore Sales Dataset",
      sourceUrl: "https://www.kaggle.com/datasets/vivek468/superstore-dataset-final",
      uploader: "vivek468",
      fileName: "Sample - Superstore.csv",
      rowCount: records.length,
      columnCount: EXPECTED_COLUMNS.length,
      orderCount: orderIds.size,
      customerCount: customerIds.size,
      productCount: metrics.length,
      categories,
      subCategoryCount: subCategories.size,
      dateRange: {
        start: sortedDates[0],
        end: sortedDates.at(-1) ?? sortedDates[0],
      },
      missingCellCount: records.reduce((sum, record) => {
        const missingPostalCode = record.postalCode.trim().length === 0 ? 1 : 0;
        return sum + missingPostalCode;
      }, 0),
    },
    overall: {
      totalSales,
      totalProfit,
      totalQuantity: records.reduce((sum, record) => sum + record.quantity, 0),
      orderCount: orderIds.size,
      profitMargin: profitMargin(totalProfit, totalSales),
      averageDiscount: average(records.map((record) => record.discount)),
      averageShippingDays: average(records.map((record) => record.shippingDays)),
      lossOrderRatio: records.filter((record) => record.isLoss).length / records.length,
      bestSalesCategory: categorySummaries[0].category,
      bestProfitSubCategory: subCategoryProfit[0].subCategory,
      worstProfitSubCategory: subCategoryProfit.at(-1)?.subCategory ?? "",
    },
    categories: categorySummaries,
  };
}
