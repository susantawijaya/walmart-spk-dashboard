import type { Metadata } from "next";

import { getDatasetSummary, getWeeklySales } from "@/lib/data/repository";
import {
  formatCurrency,
  formatDate,
  formatDecimal,
  formatNumber,
} from "@/lib/formatters";

export const metadata: Metadata = { title: "Dataset Walmart" };

const columns = [
  { name: "Store", type: "Integer", role: "Identitas", description: "Nomor unik toko Walmart, 1 sampai 45.", usage: "Alternatif SPK dan filter dashboard." },
  { name: "Date", type: "Date", role: "Waktu", description: "Tanggal pencatatan penjualan mingguan.", usage: "Filter tahun, tren, dan pertumbuhan." },
  { name: "Weekly_Sales", type: "Decimal", role: "Ukuran utama", description: "Nilai penjualan toko pada minggu tersebut dalam USD.", usage: "Scorecard, chart, dan seluruh metrik kinerja SPK." },
  { name: "Holiday_Flag", type: "Binary", role: "Kategori", description: "Penanda minggu hari libur: 1 untuk libur dan 0 untuk hari biasa.", usage: "Holiday lift, filter, dan diagram proporsi." },
  { name: "Temperature", type: "Decimal", role: "Konteks", description: "Suhu rata-rata pada wilayah toko dalam Fahrenheit.", usage: "Analisis konteks operasional dashboard." },
  { name: "Fuel_Price", type: "Decimal", role: "Konteks", description: "Harga bahan bakar pada periode pengamatan.", usage: "Scorecard dan indeks konteks ekonomi." },
  { name: "CPI", type: "Decimal", role: "Konteks", description: "Consumer Price Index pada wilayah dan periode toko.", usage: "Indeks konteks ekonomi dashboard." },
  { name: "Unemployment", type: "Decimal", role: "Konteks", description: "Tingkat pengangguran pada wilayah toko.", usage: "Scorecard dan indeks konteks ekonomi." },
];

export default function DatasetPage() {
  const summary = getDatasetSummary();
  const records = getWeeklySales();
  const preview = records.slice(0, 10);

  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Sumber Data Sistem</span>
          <h1>Dataset Walmart Sales</h1>
          <p>
            Halaman ini menjelaskan sumber, struktur, kualitas, dan cara seluruh kolom
            dataset digunakan oleh dashboard serta SPK.
          </p>
        </div>
        <div className="dataset-badge">
          <span>Satu file CSV</span>
          <strong>{formatNumber(summary.dataset.rowCount)} baris · {summary.dataset.columnCount} kolom</strong>
          <small>Tanpa missing value</small>
        </div>
      </section>

      <section className="dataset-profile">
        <div className="dataset-profile__main">
          <span className="section-kicker">Profil dataset</span>
          <h2>Penjualan mingguan 45 toko Walmart</h2>
          <p>
            Dataset berisi observasi penjualan mingguan dari {formatDate(summary.dataset.startDate)}{" "}
            sampai {formatDate(summary.dataset.endDate)}. Seluruh baris digunakan secara default;
            filter hanya mengubah subset yang sedang dianalisis di layar.
          </p>
          <div className="dataset-actions">
            <a className="button button--primary" href={summary.dataset.sourceUrl} target="_blank" rel="noreferrer">Buka sumber Kaggle</a>
            <a className="button button--ghost" href="/kredit">Lihat kredit dataset</a>
          </div>
        </div>
        <div className="dataset-coverage">
          <span>Cakupan penggunaan</span>
          <strong>8 / 8 kolom</strong>
          <p>Empat kolom inti untuk kinerja dan empat kolom untuk konteks ekonomi.</p>
        </div>
      </section>

      <section className="dataset-stat-grid" aria-label="Statistik dataset">
        <DatasetStat value={formatNumber(summary.dataset.rowCount)} label="Baris data" />
        <DatasetStat value={String(summary.dataset.columnCount)} label="Kolom" />
        <DatasetStat value={String(summary.dataset.storeCount)} label="Toko" />
        <DatasetStat value="2010–2012" label="Periode tahun" />
        <DatasetStat value={String(summary.dataset.missingCellCount)} label="Missing cell" />
        <DatasetStat value="1 CSV" label="Jumlah file" />
      </section>

      <section className="content-card">
        <div className="content-card__heading">
          <div><span className="section-kicker">Data dictionary</span><h2>Arti dan penggunaan setiap kolom</h2></div>
          <span className="pill">Seluruh kolom digunakan</span>
        </div>
        <div className="table-wrap">
          <table className="data-table dataset-table">
            <thead><tr><th>Kolom</th><th>Tipe</th><th>Peran</th><th>Penjelasan</th><th>Digunakan untuk</th></tr></thead>
            <tbody>
              {columns.map((column) => (
                <tr key={column.name}>
                  <td><code>{column.name}</code></td><td>{column.type}</td><td><span className="data-role">{column.role}</span></td>
                  <td>{column.description}</td><td>{column.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-card">
        <div className="content-card__heading content-card__heading--wrap">
          <div><span className="section-kicker">Preview data</span><h2>10 baris pertama dari CSV</h2><p className="section-description">Tanggal ditampilkan dalam format Indonesia; nilai sumber tetap numerik saat diproses.</p></div>
          <span className="pill">{summary.dataset.fileName}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table data-preview-table">
            <thead><tr>{columns.map((column) => <th key={column.name}>{column.name}</th>)}</tr></thead>
            <tbody>
              {preview.map((row) => (
                <tr key={`${row.store}-${row.date}`}>
                  <td>{row.store}</td><td>{formatDate(row.date)}</td><td>{formatCurrency(row.weeklySales)}</td>
                  <td>{row.isHoliday ? "1 · Libur" : "0 · Biasa"}</td><td>{formatDecimal(row.temperature)}</td>
                  <td>{formatDecimal(row.fuelPrice, 3)}</td><td>{formatDecimal(row.cpi, 3)}</td><td>{formatDecimal(row.unemployment, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dataset-notes-grid">
        <article className="dataset-note dataset-note--quality">
          <span>Kualitas data</span><h2>Siap untuk analisis</h2>
          <p>6.435 baris tervalidasi, delapan kolom lengkap, 45 toko, dan tidak ditemukan sel kosong pada file sumber.</p>
        </article>
        <article className="dataset-note dataset-note--cluster">
          <span>Dukungan clustering</span><h2>Ya, mendukung</h2>
          <p>Toko dapat dikelompokkan menggunakan penjualan, pertumbuhan, volatilitas, respons hari libur, BBM, CPI, dan pengangguran.</p>
        </article>
      </section>
    </div>
  );
}

function DatasetStat({ value, label }: { value: string; label: string }) {
  return <article><strong>{value}</strong><span>{label}</span></article>;
}
