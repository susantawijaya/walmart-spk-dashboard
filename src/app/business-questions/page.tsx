import type { Metadata } from "next";

import { buildSpkResult } from "@/lib/analytics/decision";
import { getProductMetrics, getSuperstoreSales } from "@/lib/data/repository";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatScore,
} from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Business Questions - Superstore SPK",
};

export default function BusinessQuestionsPage() {
  const records = getSuperstoreSales();
  const metrics = getProductMetrics();
  const spkResult = buildSpkResult(metrics);
  const topSpk = spkResult.rankings[0];
  const growth = compareSalesAndProfit(records);
  const category = strongestSalesCategory(records);
  const subCategoryRisk = mostLossMakingSubCategory(records);
  const discount = compareDiscountImpact(records);

  const questions = [
    {
      number: "01",
      title: "Sales naik, profit ikut sehat?",
      question:
        "Apakah pertumbuhan sales dari waktu ke waktu benar-benar diikuti pertumbuhan profit?",
      visualization:
        "Line Chart - bulan order sebagai sumbu X, total Sales dan Profit sebagai sumbu Y.",
      evidence: `Tahun awal mencatat sales ${formatCurrency(
        growth.first.sales,
      )} dan profit ${formatCurrency(growth.first.profit)}, sedangkan tahun akhir mencatat sales ${formatCurrency(
        growth.last.sales,
      )} dan profit ${formatCurrency(growth.last.profit)}.`,
      recommendation:
        "Gunakan untuk menilai kualitas pertumbuhan: sales tinggi belum cukup jika profit tidak ikut membaik.",
    },
    {
      number: "02",
      title: "Kategori penyumbang revenue utama",
      question:
        "Category mana yang memberi kontribusi sales terbesar terhadap bisnis Superstore?",
      visualization:
        "Pie Chart - category sebagai potongan visual, total Sales sebagai ukuran proporsi.",
      evidence: `${category.category} menjadi penyumbang sales terbesar dengan ${formatCompactCurrency(
        category.sales,
      )}, yaitu ${formatPercentage(category.share)} dari total sales.`,
      recommendation:
        "Fokuskan kampanye dan alokasi stok pada category dengan kontribusi revenue terbesar, sambil tetap melihat profitnya.",
    },
    {
      number: "03",
      title: "Sub-category yang merusak profit",
      question:
        "Sub-category mana yang perlu diawasi karena profitnya paling rendah atau negatif?",
      visualization:
        "Bar Chart - sub-category sebagai sumbu X, total Profit sebagai sumbu Y.",
      evidence: `${subCategoryRisk.subCategory} adalah sub-category dengan profit terendah, yaitu ${formatCurrency(
        subCategoryRisk.profit,
      )}.`,
      recommendation:
        "Audit harga, diskon, biaya operasional, atau strategi promosi pada sub-category yang profitnya negatif.",
    },
    {
      number: "04",
      title: "Diskon besar didominasi transaksi rugi?",
      question:
        "Pada rentang diskon tinggi, apakah transaksi rugi lebih banyak dibanding transaksi untung?",
      visualization:
        "Bar Chart - rentang discount sebagai sumbu X, jumlah transaksi untung dan rugi sebagai sumbu Y.",
      evidence: `Diskon >30% memiliki ${formatNumber(
        discount.highDiscount.lossCount,
      )} transaksi rugi dan ${formatNumber(
        discount.highDiscount.profitCount,
      )} transaksi untung. Margin bersihnya ${formatPercentage(discount.highDiscount.margin)}.`,
      recommendation:
        "Gunakan hasil ini untuk mengontrol diskon besar. Tidak semua produk diskon besar rugi, tetapi rentang ini perlu seleksi produk yang lebih ketat.",
    },
    {
      number: "05",
      title: "Produk prioritas promosi dan stok",
      question:
        "Produk mana yang paling layak diprioritaskan karena sales, profit, demand, margin, dan risikonya paling sehat?",
      visualization:
        "Ranking SPK AHP-TOPSIS - product name sebagai alternatif, skor TOPSIS sebagai angka keputusan.",
      evidence: `${topSpk.metrics.productName} menjadi ranking pertama dengan skor ${formatScore(
        topSpk.score,
      )}, sales ${formatCurrency(topSpk.metrics.totalSales)}, dan profit ${formatCurrency(
        topSpk.metrics.totalProfit,
      )}.`,
      recommendation:
        "Gunakan ranking SPK untuk menentukan produk prioritas promosi, penempatan katalog, dan perencanaan stok.",
    },
  ];

  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Business Questions</span>
          <h1>Questions yang Menjawab Sales Superstore</h1>
          <p>
            Pertanyaan ini dibangun dari transaksi sales aktual: order date, sales,
            profit, quantity, discount, category, sub-category, customer segment, dan region.
          </p>
        </div>
        <div className="dataset-badge">
          <span>Output SPK</span>
          <strong>{topSpk.productId}</strong>
          <small>
            Skor {formatScore(topSpk.score)} - Profit{" "}
            {formatCurrency(topSpk.metrics.totalProfit)}
          </small>
        </div>
      </section>

      <section className="decision-question-intro">
        <div>
          <strong>5</strong>
          <span>Pertanyaan bisnis</span>
        </div>
        <p>
          Semua pertanyaan diarahkan ke keputusan bisnis: pertumbuhan, revenue,
          profitabilitas, kebijakan diskon, dan prioritas produk.
        </p>
      </section>

      <section className="weighted-question-list">
        {questions.map((item) => (
          <article className="weighted-question" key={item.number}>
            <header>
              <span className="weighted-question__number">{item.number}</span>
              <div>
                <small>Business question</small>
                <h2>{item.title}</h2>
              </div>
            </header>
            <div className="evidence-box">
              <span>Pertanyaan dan visualisasi</span>
              <ul>
                <li>{item.question}</li>
                <li>{item.visualization}</li>
              </ul>
            </div>
            <div className="decision-answer-grid">
              <div>
                <span>Bukti data</span>
                <p>{item.evidence}</p>
              </div>
              <div>
                <span>Value keputusan</span>
                <p>{item.recommendation}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function compareSalesAndProfit(records: ReturnType<typeof getSuperstoreSales>) {
  const grouped = new Map<number, { sales: number; profit: number }>();
  records.forEach((record) => {
    const current = grouped.get(record.orderYear) ?? { sales: 0, profit: 0 };
    current.sales += record.sales;
    current.profit += record.profit;
    grouped.set(record.orderYear, current);
  });
  const yearly = [...grouped.entries()]
    .map(([year, value]) => ({ year, ...value }))
    .sort((left, right) => left.year - right.year);
  return {
    first: yearly[0],
    last: yearly.at(-1) ?? yearly[0],
  };
}

function strongestSalesCategory(records: ReturnType<typeof getSuperstoreSales>) {
  const totalSales = records.reduce((sum, record) => sum + record.sales, 0) || 1;
  const grouped = new Map<string, number>();
  records.forEach((record) => {
    grouped.set(record.category, (grouped.get(record.category) ?? 0) + record.sales);
  });
  const [category, sales] = [...grouped.entries()].sort((left, right) => right[1] - left[1])[0];
  return { category, sales, share: sales / totalSales };
}

function mostLossMakingSubCategory(records: ReturnType<typeof getSuperstoreSales>) {
  const grouped = new Map<string, number>();
  records.forEach((record) => {
    grouped.set(record.subCategory, (grouped.get(record.subCategory) ?? 0) + record.profit);
  });
  const [subCategory, profit] = [...grouped.entries()].sort((left, right) => left[1] - right[1])[0];
  return { subCategory, profit };
}

function compareDiscountImpact(records: ReturnType<typeof getSuperstoreSales>) {
  const noDiscount = records.filter((record) => record.discount === 0);
  const highDiscount = records.filter((record) => record.discount > 0.3);
  return {
    noDiscount: summarizeMargin(noDiscount),
    highDiscount: summarizeMargin(highDiscount),
  };
}

function summarizeMargin(records: ReturnType<typeof getSuperstoreSales>) {
  const sales = records.reduce((sum, record) => sum + record.sales, 0);
  const profit = records.reduce((sum, record) => sum + record.profit, 0);
  return {
    sales,
    profit,
    margin: sales === 0 ? 0 : profit / sales,
    count: records.length,
    profitCount: records.filter((record) => record.profit > 0).length,
    lossCount: records.filter((record) => record.profit < 0).length,
  };
}
