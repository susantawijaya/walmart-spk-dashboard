import type { Metadata } from "next";

import { buildSpkResult } from "@/lib/analytics/decision";
import { calculateStoreMetrics } from "@/lib/analytics/store-metrics";
import { getWeeklySales } from "@/lib/data/repository";
import { formatCurrency, formatPercentage, formatScore } from "@/lib/formatters";

export const metadata: Metadata = { title: "Decision Questions" };

export default function BusinessQuestionsPage() {
  const records = getWeeklySales();
  const metrics = calculateStoreMetrics(records);
  const defaultResult = buildSpkResult(metrics);
  const topFive = defaultResult.rankings.slice(0, 5);
  const years = [...new Set(records.map((record) => record.year))].sort();
  const yearly = years.map((year) => ({
    year,
    top: buildSpkResult(calculateStoreMetrics(records.filter((record) => record.year === year))).rankings.slice(0, 3),
  }));
  const consistentStores = topFive
    .filter((item) => yearly.every((period) => period.top.some((candidate) => candidate.store === item.store)))
    .map((item) => item.store);
  const highSalesRisk = [...metrics]
    .sort((left, right) => right.totalSales - left.totalSales)
    .slice(0, 10)
    .sort((left, right) => left.salesGrowthRate - right.salesGrowthRate)[0];
  const holidayOpportunity = [...metrics].sort((left, right) => right.holidayLift - left.holidayLift)[0];
  const holidayRank = defaultResult.rankings.find((item) => item.store === holidayOpportunity.store)?.rank ?? 0;
  const scenarios = [
    { name: "Fokus penjualan", importance: [9, 8, 3, 3, 2, 2] },
    { name: "Fokus pertumbuhan", importance: [4, 4, 5, 9, 2, 2] },
    { name: "Fokus stabilitas", importance: [5, 5, 3, 3, 9, 8] },
  ].map((scenario) => ({
    ...scenario,
    top: buildSpkResult(metrics, scenario.importance).rankings.slice(0, 5),
  }));
  const robustStores = scenarios[0].top
    .filter((item) => scenarios.every((scenario) => scenario.top.some((candidate) => candidate.store === item.store)))
    .map((item) => item.store);

  const questions = [
    {
      number: "01",
      tag: "Keputusan investasi",
      question: "Toko mana yang paling layak menerima anggaran pengembangan berdasarkan keseluruhan kriteria?",
      evidence: [
        `Toko ${topFive[0].store} memperoleh skor TOPSIS ${formatScore(topFive[0].score)} dan berada di peringkat pertama.`,
        `Total penjualannya ${formatCurrency(topFive[0].metrics.totalSales)}, pertumbuhan ${formatPercentage(topFive[0].metrics.salesGrowthRate)}, dan volatilitas ${formatPercentage(topFive[0].metrics.salesVolatility)}.`,
        `Lima rekomendasi default: ${topFive.map((item) => `Toko ${item.store}`).join(", ")}.`,
      ],
      conclusion: `Toko ${topFive[0].store} merupakan kandidat utama karena memberikan keseimbangan terbaik antara skala penjualan, pertumbuhan, respons hari libur, dan risiko.`,
      action: `Jadikan Toko ${topFive[0].store} prioritas pertama untuk due diligence dan alokasi anggaran; empat toko berikutnya menjadi portofolio tahap kedua.`,
    },
    {
      number: "02",
      tag: "Konsistensi periode",
      question: "Apakah toko prioritas tetap konsisten ketika keputusan dihitung per tahun?",
      evidence: yearly.map((period) => `${period.year}: ${period.top.map((item) => `Toko ${item.store}`).join(", ")}.`),
      conclusion: consistentStores.length > 0
        ? `Toko ${consistentStores.join(" dan Toko ")} konsisten muncul dalam tiga besar setiap tahun, sehingga rekomendasinya tidak hanya ditopang satu periode.`
        : "Tidak ada toko yang selalu berada di tiga besar pada seluruh tahun; pemilihan periode sangat memengaruhi rekomendasi.",
      action: "Gunakan seluruh periode untuk keputusan strategis jangka panjang dan pilih tahun tertentu hanya untuk program anggaran tahunan.",
    },
    {
      number: "03",
      tag: "Risiko tersembunyi",
      question: "Adakah toko berpenjualan tinggi yang terlihat kuat di dashboard tetapi menunjukkan pelemahan untuk keputusan investasi?",
      evidence: [
        `Di antara 10 toko dengan total penjualan tertinggi, Toko ${highSalesRisk.store} memiliki pertumbuhan terendah sebesar ${formatPercentage(highSalesRisk.salesGrowthRate)}.`,
        `Total penjualannya tetap besar, yaitu ${formatCurrency(highSalesRisk.totalSales)}, dengan volatilitas ${formatPercentage(highSalesRisk.salesVolatility)}.`,
        "Kondisi ini menunjukkan penjualan historis tinggi tidak otomatis berarti momentum pertumbuhan masih sehat.",
      ],
      conclusion: `Toko ${highSalesRisk.store} adalah kandidat yang perlu diperiksa lebih dalam sebelum menerima investasi ekspansi.`,
      action: "Pisahkan anggaran ekspansi dari anggaran pemulihan; lakukan diagnosis tren produk dan operasional sebelum menambah kapasitas toko tersebut.",
    },
    {
      number: "04",
      tag: "Peluang musiman",
      question: "Apakah respons terhadap hari libur menghasilkan peluang toko yang tidak terlihat dari total penjualan saja?",
      evidence: [
        `Toko ${holidayOpportunity.store} mencatat holiday lift tertinggi sebesar ${formatPercentage(holidayOpportunity.holidayLift)}.`,
        `Rata-rata penjualan hari liburnya ${formatCurrency(holidayOpportunity.averageHolidaySales)}, dibandingkan ${formatCurrency(holidayOpportunity.averageRegularSales)} pada minggu biasa.`,
        `Pada konfigurasi SPK default, toko tersebut berada di peringkat ${holidayRank}.`,
      ],
      conclusion: `Toko ${holidayOpportunity.store} memiliki potensi kampanye musiman kuat meskipun belum tentu menjadi prioritas investasi umum tertinggi.`,
      action: "Gunakan anggaran kampanye khusus hari libur untuk toko ini, bukan langsung menyamakan kebutuhan tersebut dengan investasi ekspansi jangka panjang.",
    },
    {
      number: "05",
      tag: "Sensitivitas bobot",
      question: "Seberapa kuat rekomendasi SPK ketika prioritas bobot manajemen diubah?",
      evidence: scenarios.map((scenario) => `${scenario.name}: ${scenario.top.slice(0, 3).map((item) => `Toko ${item.store}`).join(", ")}.`),
      conclusion: robustStores.length > 0
        ? `Toko ${robustStores.join(", Toko ")} tetap masuk lima besar pada semua skenario, sehingga dapat disebut rekomendasi yang robust.`
        : "Komposisi lima besar berubah pada setiap skenario, sehingga keputusan sangat sensitif terhadap bobot manajemen.",
      action: "Presentasikan minimal tiga skenario bobot kepada pengambil keputusan dan dahulukan toko yang tetap unggul pada seluruh skenario.",
    },
  ];

  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Decision Intelligence</span>
          <h1>Questions yang Mendukung Keputusan</h1>
          <p>Lima pertanyaan bernilai tinggi yang menghubungkan temuan dashboard dengan rekomendasi AHP–TOPSIS.</p>
        </div>
      </section>
      <section className="decision-question-intro">
        <div><strong>5</strong><span>Pertanyaan strategis</span></div>
        <p>Setiap jawaban memiliki bukti data, kesimpulan keputusan, dan tindakan yang disarankan—bukan sekadar statistik deskriptif.</p>
      </section>
      <section className="weighted-question-list">
        {questions.map((item) => (
          <article className="weighted-question" key={item.number}>
            <header><span className="weighted-question__number">{item.number}</span><div><small>{item.tag}</small><h2>{item.question}</h2></div></header>
            <div className="evidence-box"><span>Bukti data</span><ul>{item.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul></div>
            <div className="decision-answer-grid">
              <div><span>Kesimpulan</span><p>{item.conclusion}</p></div>
              <div><span>Rekomendasi tindakan</span><p>{item.action}</p></div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
