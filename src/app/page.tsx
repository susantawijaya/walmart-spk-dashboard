import type { Metadata } from "next";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDatasetSummary, getSuperstoreSales } from "@/lib/data/repository";
import { formatCurrency, formatNumber } from "@/lib/formatters";

export const metadata: Metadata = { title: "Dashboard - Superstore SPK" };

export default function DashboardPage() {
  const records = getSuperstoreSales();
  const summary = getDatasetSummary();

  return (
    <div className="container page-space">
      <section className="page-hero page-hero--dashboard">
        <div>
          <span className="eyebrow">Analitik Sales Superstore</span>
          <h1>Command Center Sales Superstore</h1>
          <p>
            Dashboard ini memvisualisasikan transaksi penjualan aktual berdasarkan
            sales, profit, quantity, discount, periode order, region, segment, dan
            kategori produk.
          </p>
        </div>
        <div className="dataset-badge">
          <span>Dataset transaksi</span>
          <strong>
            {formatCurrency(summary.overall.totalSales)} sales
          </strong>
          <small>
            {formatNumber(summary.dataset.orderCount)} order aktual -{" "}
            {formatNumber(summary.dataset.productCount)} produk
          </small>
        </div>
      </section>
      <DashboardClient records={records} />
    </div>
  );
}
