import type { Metadata } from "next";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDatasetSummary, getWeeklySales } from "@/lib/data/repository";
import { formatDate, formatNumber } from "@/lib/formatters";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const records = getWeeklySales();
  const summary = getDatasetSummary();

  return (
    <div className="container page-space">
      <section className="page-hero page-hero--dashboard">
        <div>
          <span className="eyebrow">Analitik Retail Walmart</span>
          <h1>Command Center Penjualan Walmart</h1>
          <p>
            Pantau performa 45 toko, pola hari libur, dan konteks ekonomi dalam satu
            dashboard yang seluruh komponennya mengikuti filter aktif.
          </p>
        </div>
        <div className="dataset-badge">
          <span>Dataset tervalidasi</span>
          <strong>{formatNumber(summary.dataset.rowCount)} baris · {summary.dataset.columnCount} kolom</strong>
          <small>{formatDate(summary.dataset.startDate)} – {formatDate(summary.dataset.endDate)}</small>
        </div>
      </section>
      <DashboardClient records={records} />
    </div>
  );
}
