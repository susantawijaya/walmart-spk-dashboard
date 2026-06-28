"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { filterRecords, summarizeRecords } from "@/lib/dashboard";
import type { DiscountRange, SuperstoreSalesRecord } from "@/lib/data/contracts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatMonthLabel,
  formatNumber,
  formatPercentage,
} from "@/lib/formatters";

interface DashboardClientProps {
  records: SuperstoreSalesRecord[];
}

interface CheckOption<T extends string | number> {
  value: T;
  label: string;
}

type FilterDropdownId = "years" | "regions" | "segments" | "categories";

const COLORS = ["#146eb4", "#ff9900", "#16a06d", "#7a5af8", "#e76820"];
const DISCOUNT_ORDER: DiscountRange[] = ["0%", "1-10%", "11-20%", "21-30%", ">30%"];

const chartContainerProps = {
  width: "100%" as const,
  height: "100%" as const,
  minWidth: 0,
  minHeight: 0,
  initialDimension: { width: 640, height: 300 },
};

export function DashboardClient({ records }: DashboardClientProps) {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [openDropdown, setOpenDropdown] = useState<FilterDropdownId | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-filter-dropdown]")) {
        return;
      }
      setOpenDropdown(null);
    }

    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpenDropdown(null);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const datasetDateRange = useMemo(
    () => ({
      min: records.reduce(
        (earliest, record) =>
          record.orderDate < earliest ? record.orderDate : earliest,
        records[0]?.orderDate ?? "",
      ),
      max: records.reduce(
        (latest, record) => (record.orderDate > latest ? record.orderDate : latest),
        records[0]?.orderDate ?? "",
      ),
    }),
    [records],
  );
  const years = useMemo(
    () => [...new Set(records.map((record) => record.orderYear))].sort(),
    [records],
  );
  const availableDateRange = useMemo(() => {
    const scopedRecords =
      selectedYears.length === 0
        ? records
        : records.filter((record) => selectedYears.includes(record.orderYear));

    if (scopedRecords.length === 0) return datasetDateRange;

    return {
      min: scopedRecords.reduce(
        (earliest, record) =>
          record.orderDate < earliest ? record.orderDate : earliest,
        scopedRecords[0].orderDate,
      ),
      max: scopedRecords.reduce(
        (latest, record) => (record.orderDate > latest ? record.orderDate : latest),
        scopedRecords[0].orderDate,
      ),
    };
  }, [datasetDateRange, records, selectedYears]);
  const regions = useMemo(
    () => [...new Set(records.map((record) => record.region))].sort(),
    [records],
  );
  const segments = useMemo(
    () => [...new Set(records.map((record) => record.segment))].sort(),
    [records],
  );
  const categories = useMemo(
    () => [...new Set(records.map((record) => record.category))].sort(),
    [records],
  );

  const filtered = useMemo(
    () =>
      filterRecords(records, {
        years: selectedYears,
        startDate: selectedStartDate || availableDateRange.min,
        endDate: selectedEndDate || availableDateRange.max,
        regions: selectedRegions,
        segments: selectedSegments,
        categories: selectedCategories,
      }),
    [
      availableDateRange.max,
      availableDateRange.min,
      records,
      selectedCategories,
      selectedEndDate,
      selectedRegions,
      selectedSegments,
      selectedStartDate,
      selectedYears,
    ],
  );

  const scorecards = useMemo(() => summarizeRecords(filtered), [filtered]);

  const monthlyTrendData = useMemo(() => {
    const grouped = new Map<string, { sales: number; profit: number }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.orderMonth) ?? { sales: 0, profit: 0 };
      current.sales += record.sales;
      current.profit += record.profit;
      grouped.set(record.orderMonth, current);
    });

    return [...grouped.entries()]
      .map(([month, value]) => ({
        month,
        label: formatMonthLabel(month),
        Sales: Math.round(value.sales),
        Profit: Math.round(value.profit),
        Margin: value.sales === 0 ? 0 : value.profit / value.sales,
        Gap: Math.round(value.sales - value.profit),
      }))
      .sort((left, right) => left.month.localeCompare(right.month));
  }, [filtered]);

  const monthlyTrendInsight = useMemo(() => {
    if (monthlyTrendData.length === 0) {
      return null;
    }

    const first = monthlyTrendData[0];
    const last = monthlyTrendData.at(-1) ?? first;
    const salesPeak = [...monthlyTrendData].sort((left, right) => right.Sales - left.Sales)[0];
    const profitPeak = [...monthlyTrendData].sort((left, right) => right.Profit - left.Profit)[0];
    const profitLow = [...monthlyTrendData].sort((left, right) => left.Profit - right.Profit)[0];
    const salesGrowth = first.Sales === 0 ? 0 : (last.Sales - first.Sales) / first.Sales;
    const profitGrowth = first.Profit === 0 ? 0 : (last.Profit - first.Profit) / Math.abs(first.Profit);

    return {
      first,
      last,
      salesPeak,
      profitPeak,
      profitLow,
      salesGrowth,
      profitGrowth,
      status:
        profitGrowth >= salesGrowth
          ? "Profit mengikuti pertumbuhan sales"
          : "Sales tumbuh lebih cepat daripada profit",
    };
  }, [monthlyTrendData]);

  const categorySalesData = useMemo(() => {
    const grouped = new Map<string, { sales: number; profit: number }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.category) ?? { sales: 0, profit: 0 };
      current.sales += record.sales;
      current.profit += record.profit;
      grouped.set(record.category, current);
    });
    const totalSales = [...grouped.values()].reduce((sum, value) => sum + value.sales, 0) || 1;
    return [...grouped.entries()]
      .map(([category, value]) => ({
        category,
        Sales: value.sales,
        Profit: value.profit,
        Margin: value.sales === 0 ? 0 : value.profit / value.sales,
        share: value.sales / totalSales,
      }))
      .sort((left, right) => right.Sales - left.Sales);
  }, [filtered]);

  const categoryInsight = useMemo(() => {
    if (categorySalesData.length === 0) return null;
    const salesLeader = categorySalesData[0];
    const profitLeader = [...categorySalesData].sort(
      (left, right) => right.Profit - left.Profit,
    )[0];
    const smallestShare = categorySalesData.at(-1) ?? salesLeader;

    return {
      salesLeader,
      profitLeader,
      smallestShare,
      categoryCount: categorySalesData.length,
    };
  }, [categorySalesData]);

  const subCategoryProfitData = useMemo(() => {
    const grouped = new Map<string, { profit: number; sales: number }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.subCategory) ?? { profit: 0, sales: 0 };
      current.profit += record.profit;
      current.sales += record.sales;
      grouped.set(record.subCategory, current);
    });
    return [...grouped.entries()]
      .map(([subCategory, value]) => ({
        subCategory,
        Profit: Math.round(value.profit),
        ProfitPositive: value.profit > 0 ? Math.round(value.profit) : 0,
        ProfitNegative: value.profit < 0 ? Math.round(value.profit) : 0,
        Sales: Math.round(value.sales),
        Margin: value.sales === 0 ? 0 : value.profit / value.sales,
      }))
      .sort((left, right) => right.Profit - left.Profit);
  }, [filtered]);

  const subCategoryProfitInsight = useMemo(() => {
    if (subCategoryProfitData.length === 0) return null;
    const bestProfit = subCategoryProfitData[0];
    const worstProfit = subCategoryProfitData.at(-1) ?? bestProfit;
    const lossCount = subCategoryProfitData.filter((item) => item.Profit < 0).length;
    const profitableCount = subCategoryProfitData.filter((item) => item.Profit > 0).length;

    return {
      bestProfit,
      worstProfit,
      lossCount,
      profitableCount,
    };
  }, [subCategoryProfitData]);

  const subCategoryProfitAxisDomain = useMemo<[number, number]>(() => {
    if (subCategoryProfitData.length === 0) return [0, 1];
    const profits = subCategoryProfitData.map((item) => item.Profit);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    const padding = Math.max((maxProfit - minProfit) * 0.12, 2500);

    return [
      minProfit < 0 ? Math.floor(minProfit - padding) : 0,
      Math.ceil(maxProfit + padding),
    ];
  }, [subCategoryProfitData]);
  const subCategoryProfitTicks = useMemo(
    () => buildCurrencyAxisTicks(subCategoryProfitAxisDomain),
    [subCategoryProfitAxisDomain],
  );

  const discountOutcomeData = useMemo(() => {
    const grouped = new Map<
      DiscountRange,
      {
        sales: number;
        profit: number;
        profitableTransactions: number;
        lossTransactions: number;
        neutralTransactions: number;
        rows: number;
      }
    >();
    DISCOUNT_ORDER.forEach((range) =>
      grouped.set(range, {
        sales: 0,
        profit: 0,
        profitableTransactions: 0,
        lossTransactions: 0,
        neutralTransactions: 0,
        rows: 0,
      }),
    );
    filtered.forEach((record) => {
      const current = grouped.get(record.discountRange);
      if (!current) return;
      current.sales += record.sales;
      current.profit += record.profit;
      if (record.profit > 0) current.profitableTransactions += 1;
      if (record.profit < 0) current.lossTransactions += 1;
      if (record.profit === 0) current.neutralTransactions += 1;
      current.rows += 1;
    });

    return DISCOUNT_ORDER.map((range) => {
      const value = grouped.get(range) ?? {
        sales: 0,
        profit: 0,
        profitableTransactions: 0,
        lossTransactions: 0,
        neutralTransactions: 0,
        rows: 0,
      };
      return {
        range,
        "Rentang Diskon": range,
        "Transaksi Untung": value.profitableTransactions,
        "Transaksi Rugi": value.lossTransactions,
        "Transaksi Impas": value.neutralTransactions,
        "Profit Bersih": Math.round(value.profit),
        "Margin Bersih": value.sales === 0 ? 0 : value.profit / value.sales,
        Transaksi: value.rows,
      };
    }).filter((item) => item.Transaksi > 0);
  }, [filtered]);

  function resetFilters() {
    setSelectedYears([]);
    setSelectedRegions([]);
    setSelectedSegments([]);
    setSelectedCategories([]);
    setSelectedStartDate("");
    setSelectedEndDate("");
  }

  function clearYears() {
    setSelectedYears([]);
    setSelectedStartDate("");
    setSelectedEndDate("");
  }

  function toggleYear(value: number) {
    toggleValue(setSelectedYears, value);
    setSelectedStartDate("");
    setSelectedEndDate("");
  }

  return (
    <>
      <section className="filter-panel filter-panel--enhanced" aria-label="Filter dashboard">
        <div className="filter-panel__heading">
          <div>
            <span className="section-kicker">Pusat kontrol sales</span>
            <h2>Filter analisis bisnis</h2>
            <p>
              Filter ini mengubah scorecard dan seluruh chart berdasarkan periode, wilayah,
              segmen customer, dan kategori produk.
            </p>
          </div>
          <button className="button button--ghost" onClick={resetFilters} type="button">
            Atur ulang filter
          </button>
        </div>
        <div className="filter-grid filter-grid--checklist">
          <DropdownChecklistFilter
            clearText="Semua tahun"
            emptyText="Semua tahun"
            id="years"
            label="Tahun order"
            onClear={clearYears}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? "years" : null)}
            onToggle={toggleYear}
            open={openDropdown === "years"}
            options={years.map((year) => ({ value: year, label: String(year) }))}
            selected={selectedYears}
          />
          <DropdownChecklistFilter
            clearText="Semua region"
            emptyText="Semua region"
            id="regions"
            label="Region"
            onClear={() => setSelectedRegions([])}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? "regions" : null)}
            onToggle={(value) => toggleValue(setSelectedRegions, value)}
            open={openDropdown === "regions"}
            options={regions.map((region) => ({ value: region, label: region }))}
            selected={selectedRegions}
          />
          <DropdownChecklistFilter
            clearText="Semua segment"
            emptyText="Semua segment"
            id="segments"
            label="Segment"
            onClear={() => setSelectedSegments([])}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? "segments" : null)}
            onToggle={(value) => toggleValue(setSelectedSegments, value)}
            open={openDropdown === "segments"}
            options={segments.map((segment) => ({ value: segment, label: segment }))}
            selected={selectedSegments}
          />
          <DropdownChecklistFilter
            clearText="Semua kategori"
            emptyText="Semua kategori"
            id="categories"
            label="Category"
            onClear={() => setSelectedCategories([])}
            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? "categories" : null)}
            onToggle={(value) => toggleValue(setSelectedCategories, value)}
            open={openDropdown === "categories"}
            options={categories.map((category) => ({ value: category, label: category }))}
            selected={selectedCategories}
          />
          <div className="filter-result filter-result--checklist">
            <span>Data terpilih</span>
            <strong>{formatNumber(filtered.length)} baris</strong>
            <small>{formatNumber(scorecards.totalOrders)} order aktual</small>
          </div>
        </div>
        <div className="date-filter-row">
          <div>
            <span className="date-filter-row__label">Rentang tanggal order</span>
            <strong>
              {selectedStartDate || availableDateRange.min} sampai{" "}
              {selectedEndDate || availableDateRange.max}
            </strong>
            <small>
              Batas tanggal mengikuti tahun yang dicentang. Kosongkan tanggal untuk
              memakai seluruh rentang pada tahun terpilih.
            </small>
          </div>
          <label className="field field--date">
            <span>Dari tanggal</span>
            <input
              max={selectedEndDate || availableDateRange.max}
              min={availableDateRange.min}
              onChange={(event) => setSelectedStartDate(event.target.value)}
              type="date"
              value={selectedStartDate}
            />
          </label>
          <label className="field field--date">
            <span>Sampai tanggal</span>
            <input
              max={availableDateRange.max}
              min={selectedStartDate || availableDateRange.min}
              onChange={(event) => setSelectedEndDate(event.target.value)}
              type="date"
              value={selectedEndDate}
            />
          </label>
          <button
            className="button button--ghost"
            onClick={() => {
              setSelectedStartDate("");
              setSelectedEndDate("");
            }}
            type="button"
          >
            Semua tanggal
          </button>
        </div>
      </section>

      <section className="scorecard-grid scorecard-grid--six" aria-label="Matriks utama sales">
        <Scorecard
          detail="Revenue aktual dari kolom Sales"
          label="Total Sales"
          tone="blue"
          value={formatCompactCurrency(scorecards.totalSales)}
        />
        <Scorecard
          detail="Laba aktual dari kolom Profit"
          label="Total Profit"
          tone="green"
          value={formatCompactCurrency(scorecards.totalProfit)}
        />
        <Scorecard
          detail="Order ID unik"
          label="Total Orders"
          tone="purple"
          value={formatNumber(scorecards.totalOrders)}
        />
        <Scorecard
          detail="Unit terjual dari Quantity"
          label="Quantity Sold"
          tone="yellow"
          value={formatNumber(scorecards.totalQuantity)}
        />
        <Scorecard
          detail="Profit / Sales"
          label="Profit Margin"
          tone="cyan"
          value={formatPercentage(scorecards.profitMargin)}
        />
        <Scorecard
          detail="Rata-rata diskon transaksi"
          label="Average Discount"
          tone="orange"
          value={formatPercentage(scorecards.averageDiscount)}
        />
      </section>

      <section className="chart-grid">
        <ChartCard
          badge="Line Chart"
          purpose="Untuk mengecek apakah kenaikan Sales benar-benar diikuti Profit, bukan hanya revenue besar."
          reason="Line chart dipakai karena data memiliki urutan bulan order, sehingga pola naik-turun Sales dan Profit bisa dibaca sebagai tren."
          title="Tren Sales dan Profit Bulanan"
          autoCanvas
          wide
        >
          {monthlyTrendInsight && (
            <div className="chart-insight-grid" aria-label="Ringkasan tren sales dan profit">
              <article>
                <span>Status tren</span>
                <strong>{monthlyTrendInsight.status}</strong>
                <small>
                  Sales {formatPercentage(monthlyTrendInsight.salesGrowth)} - Profit{" "}
                  {formatPercentage(monthlyTrendInsight.profitGrowth)}
                </small>
              </article>
              <article>
                <span>Sales tertinggi</span>
                <strong>{monthlyTrendInsight.salesPeak.label}</strong>
                <small>{formatCurrency(monthlyTrendInsight.salesPeak.Sales)}</small>
              </article>
              <article>
                <span>Profit tertinggi</span>
                <strong>{monthlyTrendInsight.profitPeak.label}</strong>
                <small>{formatCurrency(monthlyTrendInsight.profitPeak.Profit)}</small>
              </article>
              <article className="chart-insight-grid__risk">
                <span>Profit terendah</span>
                <strong>{monthlyTrendInsight.profitLow.label}</strong>
                <small>{formatCurrency(monthlyTrendInsight.profitLow.Profit)}</small>
              </article>
            </div>
          )}
          <div className="chart-plot chart-plot--line">
          <ChartAxisFrame
            xLabel="Bulan Order (Order Date)"
            yLabel="Total Sales dan Profit"
          >
          <ResponsiveContainer {...chartContainerProps}>
            <LineChart data={monthlyTrendData} margin={{ top: 42, right: 38, left: 4, bottom: 10 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                minTickGap={18}
                tick={{ fill: "#344054", fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: "#667085", fontSize: 10 }}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0]?.payload as
                    | { Sales?: number; Profit?: number; Margin?: number; Gap?: number }
                    | undefined;

                  return (
                    <div className="chart-tooltip">
                      <strong>Bulan Order: {String(label)}</strong>
                      <span>Total Sales: {formatCurrency(item?.Sales ?? 0)}</span>
                      <span className="chart-tooltip__profit">
                        Total Profit: {formatCurrency(item?.Profit ?? 0)}
                      </span>
                      <span>Profit Margin: {formatPercentage(item?.Margin ?? 0)}</span>
                      <span>Selisih Sales-Profit: {formatCurrency(item?.Gap ?? 0)}</span>
                    </div>
                  );
                }}
              />
              <Legend
                align="center"
                iconType="circle"
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: 8 }}
              />
              <Line dataKey="Sales" dot={false} stroke="#146eb4" strokeWidth={3} type="monotone" />
              <Line dataKey="Profit" dot={false} stroke="#16a06d" strokeWidth={3} type="monotone" />
              {monthlyTrendInsight && (
                <>
                  <ReferenceDot
                    fill="#146eb4"
                    ifOverflow="extendDomain"
                    label={{
                      value: "Sales tertinggi",
                      position: "top",
                      fill: "#146eb4",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                    r={5}
                    stroke="white"
                    strokeWidth={2}
                    x={monthlyTrendInsight.salesPeak.label}
                    y={monthlyTrendInsight.salesPeak.Sales}
                  />
                  <ReferenceDot
                    fill="#d92d20"
                    ifOverflow="extendDomain"
                    label={{
                      value: "Profit terendah",
                      position: "bottom",
                      fill: "#d92d20",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                    r={5}
                    stroke="white"
                    strokeWidth={2}
                    x={monthlyTrendInsight.profitLow.label}
                    y={monthlyTrendInsight.profitLow.Profit}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
          </ChartAxisFrame>
          </div>
        </ChartCard>

        <ChartCard
          badge="Pie Chart"
          purpose="Untuk melihat Category penyumbang revenue terbesar dan apakah komposisi Sales terlalu bergantung pada satu Category."
          reason="Pie chart dipakai karena yang dibaca adalah proporsi kontribusi Sales antar Category terhadap total Sales."
          title="Proporsi Sales per Category"
          autoCanvas
        >
          {categoryInsight && (
            <div className="chart-insight-grid chart-insight-grid--three" aria-label="Ringkasan proporsi sales category">
              <article>
                <span>Sales terbesar</span>
                <strong>{categoryInsight.salesLeader.category}</strong>
                <small>
                  {formatPercentage(categoryInsight.salesLeader.share)} dari total sales
                </small>
              </article>
              <article>
                <span>Profit terbesar</span>
                <strong>{categoryInsight.profitLeader.category}</strong>
                <small>{formatCurrency(categoryInsight.profitLeader.Profit)}</small>
              </article>
              <article>
                <span>Kontribusi terkecil</span>
                <strong>{categoryInsight.smallestShare.category}</strong>
                <small>{formatPercentage(categoryInsight.smallestShare.share)}</small>
              </article>
            </div>
          )}
          <div className="chart-plot chart-plot--pie">
          <div className="category-pie-layout">
            <div className="category-pie-chart">
            <ResponsiveContainer {...chartContainerProps}>
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={categorySalesData}
                  dataKey="Sales"
                  innerRadius={48}
                  isAnimationActive={false}
                  label={renderPiePercentLabel}
                  labelLine={false}
                  nameKey="category"
                  outerRadius={96}
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <text
                  className="pie-center-title"
                  textAnchor="middle"
                  x="50%"
                  y="47%"
                >
                  Category
                </text>
                <text
                  className="pie-center-subtitle"
                  textAnchor="middle"
                  x="50%"
                  y="55%"
                >
                  ukuran = Sales
                </text>
                <Tooltip
                  content={({ active, label, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0]?.payload as
                      | {
                          category?: string;
                          Sales?: number;
                          Profit?: number;
                          Margin?: number;
                          share?: number;
                        }
                      | undefined;

                    return (
                      <div className="chart-tooltip">
                        <strong>Category: {item?.category ?? String(label)}</strong>
                        <span>Total Sales: {formatCurrency(item?.Sales ?? 0)}</span>
                        <span>Total Profit: {formatCurrency(item?.Profit ?? 0)}</span>
                        <span>Proporsi Sales: {formatPercentage(item?.share ?? 0)}</span>
                        <span>Profit Margin: {formatPercentage(item?.Margin ?? 0)}</span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="category-legend" aria-label="Persentase sales category">
              {categorySalesData.map((entry, index) => (
                <div className="category-legend__item" key={entry.category}>
                  <span
                    className="category-legend__dot"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="category-legend__name">{entry.category}</span>
                  <strong>{formatPercentage(entry.share)}</strong>
                </div>
              ))}
            </div>
          </div>
          </div>
        </ChartCard>

        <ChartCard
          badge="Bar Chart"
          purpose="Untuk menilai rentang diskon mana yang masih aman dan mana yang mulai menghasilkan banyak transaksi rugi."
          reason="Bar chart dipakai karena rentang diskon adalah kategori teks dan yang dibandingkan adalah jumlah transaksi untung/rugi."
          title="Untung vs Rugi per Discount Range"
        >
          <ChartAxisFrame
            xLabel="Rentang Diskon (Discount)"
            yLabel="Jumlah Transaksi"
          >
          <ResponsiveContainer {...chartContainerProps}>
            <BarChart data={discountOutcomeData} margin={{ top: 36, right: 18, left: 4, bottom: 8 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fill: "#344054", fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: "#667085", fontSize: 10 }}
                tickFormatter={(value) => formatNumber(Number(value))}
              />
              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0]?.payload as
                    | {
                        Transaksi?: number;
                        "Transaksi Untung"?: number;
                        "Transaksi Rugi"?: number;
                        "Transaksi Impas"?: number;
                      }
                    | undefined;

                  return (
                    <div className="chart-tooltip">
                      <strong>Rentang Diskon: {String(label)}</strong>
                      <span>Total Transaksi: {formatNumber(item?.Transaksi ?? 0)}</span>
                      <span className="chart-tooltip__profit">
                        Transaksi Untung:{" "}
                        {formatNumber(item?.["Transaksi Untung"] ?? 0)}
                      </span>
                      <span className="chart-tooltip__loss">
                        Transaksi Rugi: {formatNumber(item?.["Transaksi Rugi"] ?? 0)}
                      </span>
                      <span>
                        Transaksi Impas:{" "}
                        {formatNumber(item?.["Transaksi Impas"] ?? 0)}
                      </span>
                    </div>
                  );
                }}
                formatter={(value, name) => [
                  formatNumber(Number(value)),
                  String(name),
                ]}
                labelFormatter={(value) => `Rentang Diskon: ${value}`}
              />
              <Legend
                align="center"
                iconType="circle"
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: 8 }}
              />
              <Bar
                dataKey="Transaksi Untung"
                fill="#16a06d"
                minPointSize={4}
                name="Untung (Profit > 0)"
                radius={[5, 5, 0, 0]}
              >
                <LabelList
                  dataKey="Transaksi Untung"
                  fill="#344054"
                  fontSize={9}
                  fontWeight={800}
                  formatter={formatNumberLabel}
                  position="top"
                />
              </Bar>
              <Bar
                dataKey="Transaksi Rugi"
                fill="#d92d20"
                minPointSize={4}
                name="Rugi (Profit < 0)"
                radius={[5, 5, 0, 0]}
              >
                <LabelList
                  dataKey="Transaksi Rugi"
                  fill="#344054"
                  fontSize={9}
                  fontWeight={800}
                  formatter={formatNumberLabel}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </ChartAxisFrame>
        </ChartCard>

        <ChartCard
          badge="Bar Chart"
          purpose="Untuk menentukan Sub-Category penghasil laba utama dan Sub-Category yang perlu dievaluasi."
          reason="Bar chart dipakai karena Sub-Category berupa teks dan setiap batang mewakili total Profit aktual."
          title="Profit per Sub-Category"
          autoCanvas
          wide
        >
          {subCategoryProfitInsight && (
            <div className="chart-insight-grid" aria-label="Ringkasan profit sub-category">
              <article>
                <span>Profit tertinggi</span>
                <strong>{subCategoryProfitInsight.bestProfit.subCategory}</strong>
                <small>{formatCurrency(subCategoryProfitInsight.bestProfit.Profit)}</small>
              </article>
              <article className="chart-insight-grid__risk">
                <span>Profit terendah</span>
                <strong>{subCategoryProfitInsight.worstProfit.subCategory}</strong>
                <small>{formatCurrency(subCategoryProfitInsight.worstProfit.Profit)}</small>
              </article>
              <article>
                <span>Sub-category untung</span>
                <strong>{formatNumber(subCategoryProfitInsight.profitableCount)}</strong>
                <small>punya total profit positif</small>
              </article>
              <article className="chart-insight-grid__risk">
                <span>Sub-category rugi</span>
                <strong>{formatNumber(subCategoryProfitInsight.lossCount)}</strong>
                <small>perlu evaluasi harga/diskon</small>
              </article>
            </div>
          )}
          <div className="chart-plot chart-plot--profit">
          <ChartAxisFrame
            xLabel="Sub-Category"
            yLabel="Total Profit Aktual"
          >
          <ResponsiveContainer {...chartContainerProps}>
            <BarChart data={subCategoryProfitData} margin={{ top: 28, right: 24, left: 4, bottom: 82 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="subCategory"
                interval={0}
                tick={{ fill: "#344054", fontSize: 10 }}
                angle={-28}
                textAnchor="end"
                tickMargin={16}
              />
              <YAxis
                domain={subCategoryProfitAxisDomain}
                tick={{ fill: "#667085", fontSize: 10 }}
                tickFormatter={formatCompactCurrency}
                ticks={subCategoryProfitTicks}
              />
              <ReferenceLine stroke="#98a2b3" strokeWidth={1.2} y={0} />
              <Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0]?.payload as
                    | {
                        subCategory?: string;
                        Sales?: number;
                        Profit?: number;
                        Margin?: number;
                      }
                    | undefined;

                  return (
                    <div className="chart-tooltip">
                      <strong>Sub-Category: {item?.subCategory ?? String(label)}</strong>
                      <span>Total Sales: {formatCurrency(item?.Sales ?? 0)}</span>
                      <span className={item && item.Profit && item.Profit < 0 ? "chart-tooltip__loss" : "chart-tooltip__profit"}>
                        Total Profit: {formatCurrency(item?.Profit ?? 0)}
                      </span>
                      <span>Profit Margin: {formatPercentage(item?.Margin ?? 0)}</span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="Profit" minPointSize={4} shape={renderDirectionalProfitBar}>
                {subCategoryProfitData.map((entry) => (
                  <Cell
                    fill={entry.Profit < 0 ? "#d92d20" : "#146eb4"}
                    key={entry.subCategory}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </ChartAxisFrame>
          </div>
        </ChartCard>
      </section>
    </>
  );
}

function toggleValue<T extends string | number>(
  setter: Dispatch<SetStateAction<T[]>>,
  value: T,
) {
  setter((current) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  );
}

function formatNumberLabel(value: unknown): string {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? formatNumber(numericValue)
    : "";
}

function renderPiePercentLabel(props: unknown) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
    cx?: number | string;
    cy?: number | string;
    midAngle?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    percent?: number;
  };
  const numericCx = Number(cx);
  const numericCy = Number(cy);
  const numericMidAngle = Number(midAngle);
  const numericInnerRadius = Number(innerRadius);
  const numericOuterRadius = Number(outerRadius);

  if (
    !percent ||
    percent < 0.05 ||
    !Number.isFinite(numericCx) ||
    !Number.isFinite(numericCy) ||
    !Number.isFinite(numericMidAngle) ||
    !Number.isFinite(numericInnerRadius) ||
    !Number.isFinite(numericOuterRadius)
  ) {
    return null;
  }

  const radius = numericInnerRadius + (numericOuterRadius - numericInnerRadius) * 0.62;
  const x = numericCx + radius * Math.cos((-numericMidAngle * Math.PI) / 180);
  const y = numericCy + radius * Math.sin((-numericMidAngle * Math.PI) / 180);

  return (
    <text
      dominantBaseline="central"
      fill="white"
      fontSize={11}
      fontWeight={900}
      paintOrder="stroke"
      stroke="rgba(16, 24, 40, 0.34)"
      strokeWidth={3}
      textAnchor="middle"
      x={x}
      y={y}
    >
      {formatPercentage(percent, 0)}
    </text>
  );
}

function renderDirectionalProfitBar(props: unknown) {
  const barProps = props as {
    fill?: string;
    value?: number | string;
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
  };

  const numericValue = Number(barProps.value);
  const numericX = Number(barProps.x);
  const numericY = Number(barProps.y);
  const numericWidth = Number(barProps.width);
  const numericHeight = Number(barProps.height);

  if (
    !Number.isFinite(numericValue) ||
    !Number.isFinite(numericX) ||
    !Number.isFinite(numericY) ||
    !Number.isFinite(numericWidth) ||
    !Number.isFinite(numericHeight)
  ) {
    return null;
  }

  const isNegative = numericValue < 0;
  const rectY = numericHeight < 0 ? numericY + numericHeight : numericY;
  const rectHeight = Math.abs(numericHeight);
  const x = numericX + numericWidth / 2;
  const y = isNegative ? numericY + 15 : numericY - 7;

  return (
    <g>
      <rect
        fill={barProps.fill ?? "#146eb4"}
        height={rectHeight}
        rx={5}
        ry={5}
        width={numericWidth}
        x={numericX}
        y={rectY}
      />
      {numericValue !== 0 && (
        <text
          dominantBaseline={isNegative ? "hanging" : "auto"}
          fill="#344054"
          fontSize={10}
          fontWeight={800}
          textAnchor="middle"
          x={x}
          y={y}
        >
          {formatCompactCurrency(numericValue)}
        </text>
      )}
    </g>
  );
}

function buildCurrencyAxisTicks([min, max]: [number, number]) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [0];
  }

  const range = Math.max(Math.abs(max - min), 1);
  const step = getNiceStep(range / 5);
  const firstTick = Math.ceil(min / step) * step;
  const lastTick = Math.floor(max / step) * step;
  const ticks: number[] = [];

  for (let tick = firstTick; tick <= lastTick + step * 0.1; tick += step) {
    ticks.push(Math.abs(tick) < Number.EPSILON ? 0 : tick);
  }

  if (min < 0 && max > 0 && !ticks.includes(0)) {
    ticks.push(0);
  }

  return ticks.sort((left, right) => left - right);
}

function getNiceStep(rawStep: number) {
  const exponent = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / exponent;

  if (normalized <= 1) return exponent;
  if (normalized <= 2) return 2 * exponent;
  if (normalized <= 5) return 5 * exponent;
  return 10 * exponent;
}

function DropdownChecklistFilter<T extends string | number>({
  id,
  label,
  emptyText,
  clearText,
  open,
  options,
  selected,
  onClear,
  onOpenChange,
  onToggle,
}: {
  id: FilterDropdownId;
  label: string;
  emptyText: string;
  clearText: string;
  open: boolean;
  options: CheckOption<T>[];
  selected: T[];
  onClear: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onToggle: (value: T) => void;
}) {
  const triggerId = `filter-${id}-trigger`;
  const panelId = `filter-${id}-panel`;
  const selectedLabel =
    selected.length === 0
      ? emptyText
      : selected.length === 1
        ? (options.find((option) => option.value === selected[0])?.label ?? "1 dipilih")
        : `${selected.length} dipilih`;

  return (
    <div className={open ? "dropdown-check is-open" : "dropdown-check"} data-filter-dropdown>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="dropdown-check__trigger"
        id={triggerId}
        onClick={() => onOpenChange(!open)}
        type="button"
      >
        <span className="dropdown-check__label">{label}</span>
        <strong className="dropdown-check__value">
          {selectedLabel}
        </strong>
        <span className="dropdown-check__chevron">v</span>
      </button>
      {open && (
      <div
        aria-labelledby={triggerId}
        className="dropdown-check__panel"
        id={panelId}
        role="dialog"
      >
        <button
          className="dropdown-check__clear"
          onClick={() => {
            onClear();
            onOpenChange(false);
          }}
          type="button"
        >
          {clearText}
        </button>
        <div className="checklist" role="group" aria-label={label}>
          {options.map((option) => (
            <label className="check-option" key={option.value} title={option.label}>
              <input
                checked={selected.includes(option.value)}
                onChange={() => onToggle(option.value)}
                type="checkbox"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

function Scorecard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "yellow" | "green" | "purple" | "orange" | "cyan";
}) {
  return (
    <article className={`scorecard scorecard--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ChartCard({
  title,
  badge,
  purpose,
  reason,
  autoCanvas = false,
  wide = false,
  children,
}: {
  title: string;
  badge: string;
  purpose: string;
  reason: string;
  autoCanvas?: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={wide ? "chart-card chart-card--wide" : "chart-card"}>
      <div className="chart-card__heading chart-card__heading--split">
        <div>
          <h2>{title}</h2>
        </div>
        <span className="chart-badge">{badge}</span>
      </div>
      <div className={autoCanvas ? "chart-card__canvas chart-card__canvas--auto" : "chart-card__canvas"}>
        {children}
      </div>
      <div className="chart-context">
        <div>
          <span>Kenapa diagram ini?</span>
          <p>{reason}</p>
        </div>
        <div>
          <span>Untuk apa?</span>
          <p>{purpose}</p>
        </div>
      </div>
    </article>
  );
}

function ChartAxisFrame({
  children,
  xLabel,
  yLabel,
}: {
  children: ReactNode;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <div className="chart-axis-frame">
      <div className="chart-axis-frame__plot">{children}</div>
      <div className="chart-axis-frame__x">{xLabel}</div>
      <div className="chart-axis-frame__y">{yLabel}</div>
    </div>
  );
}
