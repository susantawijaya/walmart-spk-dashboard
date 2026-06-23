"use client";

import { useMemo, useState } from "react";

import { AHP_IMPORTANCE, CRITERIA } from "@/lib/analytics/criteria";
import { buildSpkResult } from "@/lib/analytics/decision";
import { calculateStoreMetrics } from "@/lib/analytics/store-metrics";
import type { WeeklySalesRecord } from "@/lib/data/contracts";
import {
  formatCurrency,
  formatPercentage,
  formatScore,
} from "@/lib/formatters";

interface DecisionConfig {
  year: "all" | number;
  target: number;
  importance: number[];
}

const DEFAULT_CONFIG: DecisionConfig = {
  year: "all",
  target: 5,
  importance: [...AHP_IMPORTANCE],
};

function importanceLabel(value: number): string {
  if (value <= 2) return "Rendah";
  if (value <= 4) return "Cukup penting";
  if (value <= 6) return "Penting";
  if (value <= 8) return "Sangat penting";
  return "Mutlak penting";
}

export function SpkClient({ records }: { records: WeeklySalesRecord[] }) {
  const years = useMemo(
    () => [...new Set(records.map((record) => record.year))].sort(),
    [records],
  );
  const [draftYear, setDraftYear] = useState("all");
  const [draftTarget, setDraftTarget] = useState("5");
  const [draftImportance, setDraftImportance] = useState<number[]>([
    ...AHP_IMPORTANCE,
  ]);
  const [applied, setApplied] = useState<DecisionConfig>(DEFAULT_CONFIG);
  const [tableLimit, setTableLimit] = useState("10");

  const calculation = useMemo(() => {
    const selectedRecords =
      applied.year === "all"
        ? records
        : records.filter((record) => record.year === applied.year);
    const metrics = calculateStoreMetrics(selectedRecords);
    return {
      records: selectedRecords,
      result: buildSpkResult(metrics, applied.importance),
    };
  }, [applied, records]);

  const recommended = calculation.result.rankings.slice(0, applied.target);
  const visibleRankings = calculation.result.rankings.slice(0, Number(tableLimit));
  const top = recommended[0];

  function changeImportance(index: number, value: number) {
    setDraftImportance((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function calculateRecommendation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied({
      year: draftYear === "all" ? "all" : Number(draftYear),
      target: Number(draftTarget),
      importance: [...draftImportance],
    });
  }

  function resetDecision() {
    setDraftYear("all");
    setDraftTarget("5");
    setDraftImportance([...AHP_IMPORTANCE]);
    setApplied(DEFAULT_CONFIG);
  }

  return (
    <>
      <section className="decision-purpose">
        <div className="decision-purpose__icon">?</div>
        <div>
          <span className="section-kicker">Keputusan yang didukung</span>
          <h2>Toko mana yang diprioritaskan menerima anggaran pengembangan?</h2>
          <p>
            Sistem membantu manajemen memilih toko yang paling layak untuk program
            pengembangan atau ekspansi berdasarkan performa, pertumbuhan, potensi hari
            libur, dan kestabilan penjualan. Hasilnya merupakan rekomendasi, bukan
            keputusan final yang menggantikan manajer.
          </p>
        </div>
        <div className="decision-purpose__output">
          <small>Jenis output</small>
          <strong>Daftar prioritas toko</strong>
          <span>AHP → bobot · TOPSIS → ranking</span>
        </div>
      </section>

      <section className="spk-workspace">
        <form className="decision-input" onSubmit={calculateRecommendation}>
          <div className="decision-panel-heading">
            <span className="step-badge">01</span>
            <div>
              <span className="section-kicker">Input keputusan</span>
              <h2>Atur parameter penilaian</h2>
              <p>Masukkan kebutuhan keputusan, lalu tekan Hitung Rekomendasi.</p>
            </div>
          </div>

          <div className="decision-basic-inputs">
            <label className="field">
              <span>Periode data</span>
              <select value={draftYear} onChange={(event) => setDraftYear(event.target.value)}>
                <option value="all">Seluruh periode 2010–2012</option>
                {years.map((year) => <option key={year} value={year}>Tahun {year}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Jumlah toko yang akan dipilih</span>
              <select value={draftTarget} onChange={(event) => setDraftTarget(event.target.value)}>
                <option value="3">3 toko</option>
                <option value="5">5 toko</option>
                <option value="10">10 toko</option>
                <option value="15">15 toko</option>
              </select>
            </label>
          </div>

          <div className="importance-heading">
            <div>
              <h3>Tingkat kepentingan kriteria</h3>
              <p>Skala 1 (rendah) sampai 9 (mutlak penting).</p>
            </div>
            <span>Input AHP</span>
          </div>
          <div className="importance-list">
            {CRITERIA.map((criterion, index) => (
              <label className="importance-control" key={criterion.id}>
                <div className="importance-control__title">
                  <span>{criterion.code}</span>
                  <div>
                    <strong>{criterion.label}</strong>
                    <small>{criterion.type === "benefit" ? "Semakin tinggi semakin baik" : "Semakin rendah semakin baik"}</small>
                  </div>
                </div>
                <div className="importance-select-row">
                  <span>Nilai kepentingan</span>
                  <select
                  aria-label={`Kepentingan ${criterion.label}`}
                  value={draftImportance[index]}
                  onChange={(event) => changeImportance(index, Number(event.target.value))}
                  >
                    {Array.from({ length: 9 }, (_, valueIndex) => valueIndex + 1).map((value) => (
                      <option key={value} value={value}>{value} — {importanceLabel(value)}</option>
                    ))}
                  </select>
                </div>
              </label>
            ))}
          </div>

          <div className="decision-actions">
            <button className="button button--primary button--large" type="submit">
              Hitung Rekomendasi
            </button>
            <button className="button button--ghost button--large" onClick={resetDecision} type="button">
              Kembalikan default
            </button>
          </div>
        </form>

        <aside className="decision-result">
          <div className="decision-panel-heading decision-panel-heading--light">
            <span className="step-badge step-badge--yellow">02</span>
            <div>
              <span className="section-kicker">Output keputusan</span>
              <h2>Rekomendasi prioritas</h2>
              <p>{applied.year === "all" ? "Periode 2010–2012" : `Tahun ${applied.year}`} · {formatCurrency(calculation.records.reduce((sum, row) => sum + row.weeklySales, 0))}</p>
            </div>
          </div>

          <div className="recommendation-primary">
            <span>Prioritas utama</span>
            <div>
              <h3>Toko {top.store}</h3>
              <strong>{formatScore(top.score)}</strong>
            </div>
            <p>
              Direkomendasikan karena paling dekat dengan profil toko ideal berdasarkan
              bobot yang Anda masukkan.
            </p>
          </div>

          <div className="recommendation-list">
            <span>{applied.target} toko penerima prioritas</span>
            {recommended.map((item) => (
              <article key={item.store}>
                <b>#{item.rank}</b>
                <div><strong>Toko {item.store}</strong><small>Skor {formatScore(item.score)}</small></div>
                <span>{formatPercentage(item.metrics.salesGrowthRate)}</span>
              </article>
            ))}
          </div>

          <div className="decision-conclusion">
            <span>Rekomendasi tindakan</span>
            <p>
              Prioritaskan anggaran pengembangan kepada {recommended.map((item) => `Toko ${item.store}`).join(", ")}.
              Lakukan validasi lapangan sebelum keputusan final.
            </p>
          </div>
        </aside>
      </section>

      <section className="content-card">
        <div className="content-card__heading content-card__heading--wrap">
          <div>
            <span className="section-kicker">Hasil AHP</span>
            <h2>Bobot kriteria setelah input</h2>
            <p className="section-description">Nilai kepentingan diubah menjadi matriks perbandingan berpasangan dan bobot ternormalisasi.</p>
          </div>
          <div className="consistency-inline">
            <small>Consistency Ratio</small>
            <strong>{calculation.result.ahp.consistencyRatio.toFixed(6)}</strong>
            <span>Konsisten ≤ 0,10</span>
          </div>
        </div>
        <div className="criteria-grid criteria-grid--result">
          {calculation.result.criteria.map((criterion, index) => (
            <article className="criterion-card" key={criterion.id}>
              <div>
                <span className="criterion-card__code">{criterion.code}</span>
                <span className={`criterion-type criterion-type--${criterion.type}`}>
                  {criterion.type === "benefit" ? "Benefit" : "Cost"}
                </span>
              </div>
              <h3>{criterion.label}</h3>
              <p>Input kepentingan: {applied.importance[index]} dari 9</p>
              <strong>{formatPercentage(criterion.weight, 1)}</strong>
            </article>
          ))}
        </div>
        <details className="matrix-details">
          <summary>Lihat matriks perbandingan berpasangan AHP</summary>
          <div className="table-wrap">
            <table className="data-table data-table--matrix">
              <thead><tr><th>Kriteria</th>{CRITERIA.map((criterion) => <th key={criterion.code}>{criterion.code}</th>)}</tr></thead>
              <tbody>
                {calculation.result.pairwiseMatrix.map((row, rowIndex) => (
                  <tr key={CRITERIA[rowIndex].code}>
                    <th>{CRITERIA[rowIndex].code}</th>
                    {row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`}>{value.toFixed(2)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="content-card">
        <div className="content-card__heading content-card__heading--wrap">
          <div>
            <span className="section-kicker">Hasil TOPSIS</span>
            <h2>Ranking kelayakan pengembangan</h2>
            <p className="section-description">Baris berwarna menandai toko yang masuk rekomendasi sesuai jumlah target.</p>
          </div>
          <label className="field field--compact">
            <span>Tampilkan ranking</span>
            <select value={tableLimit} onChange={(event) => setTableLimit(event.target.value)}>
              <option value="10">10 toko</option>
              <option value="20">20 toko</option>
              <option value="45">Semua 45 toko</option>
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Peringkat</th><th>Toko</th><th>Skor TOPSIS</th><th>Total Penjualan</th>
                <th>Holiday Lift</th><th>Pertumbuhan</th><th>Volatilitas</th><th>Keputusan</th>
              </tr>
            </thead>
            <tbody>
              {visibleRankings.map((item) => {
                const selected = item.rank <= applied.target;
                return (
                  <tr className={selected ? "is-recommended" : ""} key={item.store}>
                    <td><span className="rank-badge">#{item.rank}</span></td>
                    <td><strong>Toko {item.store}</strong></td>
                    <td><strong className="score-value">{formatScore(item.score)}</strong></td>
                    <td>{formatCurrency(item.metrics.totalSales)}</td>
                    <td>{formatPercentage(item.metrics.holidayLift)}</td>
                    <td>{formatPercentage(item.metrics.salesGrowthRate)}</td>
                    <td>{formatPercentage(item.metrics.salesVolatility)}</td>
                    <td><span className={selected ? "decision-status decision-status--selected" : "decision-status"}>{selected ? "Diprioritaskan" : "Cadangan"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Skor TOPSIS yang lebih tinggi menunjukkan toko lebih sesuai dengan tujuan
          investasi pengembangan berdasarkan konfigurasi AHP aktif.
        </p>
      </section>
    </>
  );
}
