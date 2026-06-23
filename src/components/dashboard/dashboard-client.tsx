"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { filterRecords, summarizeRecords } from "@/lib/dashboard";
import type { WeeklySalesRecord } from "@/lib/data/contracts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatNumber,
  formatPercentage,
} from "@/lib/formatters";

interface DashboardClientProps {
  records: WeeklySalesRecord[];
}

const COLORS = ["#0071ce", "#ffc220"];
const chartContainerProps = {
  width: "100%" as const,
  height: "100%" as const,
  minWidth: 0,
  minHeight: 0,
  initialDimension: { width: 640, height: 300 },
};

export function DashboardClient({ records }: DashboardClientProps) {
  const [store, setStore] = useState("all");
  const [year, setYear] = useState("all");
  const [holiday, setHoliday] = useState<"all" | "holiday" | "regular">("all");
  const stores = useMemo(
    () => [...new Set(records.map((record) => record.store))].sort((a, b) => a - b),
    [records],
  );
  const years = useMemo(
    () => [...new Set(records.map((record) => record.year))].sort(),
    [records],
  );
  const filtered = useMemo(
    () =>
      filterRecords(records, {
        store: store === "all" ? "all" : Number(store),
        year: year === "all" ? "all" : Number(year),
        holiday,
      }),
    [holiday, records, store, year],
  );
  const scorecards = useMemo(() => summarizeRecords(filtered), [filtered]);

  const trendData = useMemo(() => {
    const grouped = new Map<string, number>();
    filtered.forEach((record) => {
      grouped.set(record.date, (grouped.get(record.date) ?? 0) + record.weeklySales);
    });
    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, sales]) => ({ date, label: formatDate(date), sales }));
  }, [filtered]);

  const storeData = useMemo(() => {
    const grouped = new Map<number, number>();
    filtered.forEach((record) => {
      grouped.set(record.store, (grouped.get(record.store) ?? 0) + record.weeklySales);
    });
    return [...grouped.entries()]
      .map(([storeNumber, sales]) => ({ store: storeNumber, name: `Toko ${storeNumber}`, sales }))
      .sort((left, right) => right.sales - left.sales)
      .slice(0, 10);
  }, [filtered]);

  const holidayData = useMemo(() => {
    let holidaySales = 0;
    let regularSales = 0;
    filtered.forEach((record) => {
      if (record.isHoliday) holidaySales += record.weeklySales;
      else regularSales += record.weeklySales;
    });
    return [
      { name: "Hari libur", value: holidaySales },
      { name: "Hari biasa", value: regularSales },
    ].filter((item) => item.value > 0);
  }, [filtered]);

  const yearData = useMemo(() => {
    const grouped = new Map<number, { total: number; count: number }>();
    filtered.forEach((record) => {
      const current = grouped.get(record.year) ?? { total: 0, count: 0 };
      current.total += record.weeklySales;
      current.count += 1;
      grouped.set(record.year, current);
    });
    return [...grouped.entries()].map(([yearNumber, values]) => ({
      year: yearNumber,
      average: values.total / values.count,
    }));
  }, [filtered]);

  const contextData = useMemo(() => {
    const grouped = new Map<
      string,
      { temperature: number; fuel: number; cpi: number; unemployment: number; count: number }
    >();
    filtered.forEach((record) => {
      const current = grouped.get(record.date) ?? {
        temperature: 0,
        fuel: 0,
        cpi: 0,
        unemployment: 0,
        count: 0,
      };
      current.temperature += record.temperature;
      current.fuel += record.fuelPrice;
      current.cpi += record.cpi;
      current.unemployment += record.unemployment;
      current.count += 1;
      grouped.set(record.date, current);
    });
    const averages = [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, value]) => ({
        date,
        label: formatDate(date),
        temperature: value.temperature / value.count,
        fuel: value.fuel / value.count,
        cpi: value.cpi / value.count,
        unemployment: value.unemployment / value.count,
      }));
    const base = averages[0];
    if (!base) return [];
    const toIndex = (value: number, baseValue: number) =>
      baseValue === 0 ? 100 : (value / baseValue) * 100;
    return averages.map((value) => ({
      ...value,
      temperatureIndex: toIndex(value.temperature, base.temperature),
      fuelIndex: toIndex(value.fuel, base.fuel),
      cpiIndex: toIndex(value.cpi, base.cpi),
      unemploymentIndex: toIndex(value.unemployment, base.unemployment),
    }));
  }, [filtered]);

  const insights = useMemo(() => {
    const peak = [...trendData].sort((a, b) => b.sales - a.sales)[0];
    const holidayRows = filtered.filter((record) => record.isHoliday);
    const regularRows = filtered.filter((record) => !record.isHoliday);
    const average = (rows: WeeklySalesRecord[]) =>
      rows.length === 0
        ? 0
        : rows.reduce((sum, row) => sum + row.weeklySales, 0) / rows.length;
    const regularAverage = average(regularRows);
    const holidayAverage = average(holidayRows);
    return {
      leader: storeData[0],
      peak,
      holidayLift:
        regularAverage === 0 ? 0 : (holidayAverage - regularAverage) / regularAverage,
    };
  }, [filtered, storeData, trendData]);

  function resetFilters() {
    setStore("all");
    setYear("all");
    setHoliday("all");
  }

  return (
    <>
      <section className="dashboard-overview" aria-label="Ringkasan analisis">
        <article>
          <span className="overview-icon overview-icon--blue">01</span>
          <div><small>Toko teratas pada filter</small><strong>{insights.leader ? `Toko ${insights.leader.store}` : "–"}</strong></div>
        </article>
        <article>
          <span className="overview-icon overview-icon--yellow">02</span>
          <div><small>Minggu penjualan puncak</small><strong>{insights.peak ? insights.peak.label : "–"}</strong></div>
        </article>
        <article>
          <span className="overview-icon overview-icon--green">03</span>
          <div><small>Dampak rata-rata hari libur</small><strong>{formatPercentage(insights.holidayLift)}</strong></div>
        </article>
        <article>
          <span className="overview-icon overview-icon--purple">08</span>
          <div><small>Cakupan kolom dataset</small><strong>8 dari 8 digunakan</strong></div>
        </article>
      </section>

      <section className="filter-panel filter-panel--enhanced" aria-label="Filter dashboard">
        <div className="filter-panel__heading">
          <div>
            <span className="section-kicker">Pusat kontrol data</span>
            <h2>Filter analisis dashboard</h2>
            <p>Semua scorecard, insight, dan visualisasi mengikuti pilihan ini.</p>
          </div>
          <button className="button button--ghost" onClick={resetFilters} type="button">
            Atur ulang filter
          </button>
        </div>
        <div className="filter-grid">
          <label className="field">
            <span>Toko Walmart</span>
            <select value={store} onChange={(event) => setStore(event.target.value)}>
              <option value="all">Semua toko</option>
              {stores.map((storeNumber) => (
                <option key={storeNumber} value={storeNumber}>Toko {storeNumber}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Periode tahun</span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="all">Semua tahun</option>
              {years.map((yearNumber) => (
                <option key={yearNumber} value={yearNumber}>{yearNumber}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status minggu</span>
            <select value={holiday} onChange={(event) => setHoliday(event.target.value as "all" | "holiday" | "regular")}>
              <option value="all">Semua status</option>
              <option value="holiday">Hari libur</option>
              <option value="regular">Hari biasa</option>
            </select>
          </label>
          <div className="filter-result">
            <span>Data terpilih</span>
            <strong>{formatNumber(filtered.length)} baris</strong>
            <small>dari {formatNumber(records.length)} baris</small>
          </div>
        </div>
      </section>

      <section className="scorecard-grid scorecard-grid--six" aria-label="Ringkasan penjualan terfilter">
        <Scorecard label="Total penjualan" value={formatCurrency(scorecards.totalSales)} detail="Akumulasi Weekly_Sales" tone="blue" />
        <Scorecard label="Rata-rata mingguan" value={formatCurrency(scorecards.averageWeeklySales)} detail="Rata-rata per baris data" tone="yellow" />
        <Scorecard label="Penjualan tertinggi" value={formatCurrency(scorecards.bestWeeklySales)} detail="Nilai minggu terbaik" tone="green" />
        <Scorecard label="Kontribusi hari libur" value={formatPercentage(scorecards.holidayShare)} detail="Dari total penjualan" tone="purple" />
        <Scorecard label="Rata-rata harga BBM" value={`US$${formatDecimal(scorecards.averageFuelPrice, 3)}`} detail="Fuel_Price terfilter" tone="orange" />
        <Scorecard label="Rata-rata pengangguran" value={`${formatDecimal(scorecards.averageUnemployment)}%`} detail="Unemployment terfilter" tone="cyan" />
      </section>

      <section className="chart-grid">
        <ChartCard title="Tren Penjualan Mingguan" subtitle={store === "all" ? "Total 45 toko per minggu" : `Performa Toko ${store} per minggu`} wide badge="Weekly_Sales">
          <ResponsiveContainer {...chartContainerProps}>
            <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" minTickGap={48} tick={{ fill: "#667085", fontSize: 11 }} />
              <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: "#667085", fontSize: 11 }} width={72} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} labelStyle={{ color: "#101828" }} />
              <Line type="monotone" dataKey="sales" name="Penjualan" stroke="#0071ce" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peringkat Penjualan Toko" subtitle="10 toko dengan total penjualan tertinggi" badge="Store">
          <ResponsiveContainer {...chartContainerProps}>
            <BarChart data={storeData} layout="vertical" margin={{ top: 4, right: 10, left: 8, bottom: 4 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" tickFormatter={formatCompactCurrency} tick={{ fill: "#667085", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={58} tick={{ fill: "#344054", fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="sales" name="Penjualan" fill="#0071ce" radius={[0, 7, 7, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hari Libur vs Hari Biasa" subtitle="Proporsi total penjualan berdasarkan Holiday_Flag" badge="Holiday_Flag">
          <ResponsiveContainer {...chartContainerProps}>
            <PieChart>
              <Pie data={holidayData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={3}>
                {holidayData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rata-rata Penjualan per Tahun" subtitle="Perbandingan performa tahunan pada filter" badge="Date">
          <ResponsiveContainer {...chartContainerProps}>
            <BarChart data={yearData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "#344054", fontSize: 12 }} />
              <YAxis tickFormatter={formatCompactCurrency} width={72} tick={{ fill: "#667085", fontSize: 10 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="average" name="Rata-rata" fill="#0e9f6e" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Konteks Operasional dan Ekonomi" subtitle="Indeks 100 = kondisi pada minggu pertama hasil filter" wide badge="Temperature · Fuel · CPI · Unemployment">
          <ResponsiveContainer {...chartContainerProps}>
            <LineChart data={contextData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" minTickGap={48} tick={{ fill: "#667085", fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#667085", fontSize: 10 }} width={48} />
              <Tooltip formatter={(value, name) => [`${formatDecimal(Number(value), 1)}`, name]} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="temperatureIndex" name="Suhu" stroke="#e76820" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fuelIndex" name="Harga BBM" stroke="#7a5af8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cpiIndex" name="CPI" stroke="#0071ce" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unemploymentIndex" name="Pengangguran" stroke="#0e9f6e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </>
  );
}

function Scorecard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "blue" | "yellow" | "green" | "purple" | "orange" | "cyan" }) {
  return (
    <article className={`scorecard scorecard--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ChartCard({ title, subtitle, badge, wide = false, children }: { title: string; subtitle: string; badge: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <article className={wide ? "chart-card chart-card--wide" : "chart-card"}>
      <div className="chart-card__heading chart-card__heading--split">
        <div><h2>{title}</h2><p>{subtitle}</p></div>
        <span className="chart-badge">{badge}</span>
      </div>
      <div className="chart-card__canvas">{children}</div>
    </article>
  );
}
