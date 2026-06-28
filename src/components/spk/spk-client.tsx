"use client";

import { useMemo, useState, type FormEvent } from "react";

import { AHP_IMPORTANCE, CRITERIA } from "@/lib/analytics/criteria";
import { buildSpkResult } from "@/lib/analytics/decision";
import { calculateProductMetrics } from "@/lib/analytics/product-metrics";
import type { ProductMetric, SuperstoreSalesRecord } from "@/lib/data/contracts";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatScore,
} from "@/lib/formatters";

interface DecisionConfig {
  category: "all" | string;
  subCategory: "all" | string;
  region: "all" | string;
  target: number;
  importance: number[];
}

const DEFAULT_CONFIG: DecisionConfig = {
  category: "all",
  subCategory: "all",
  region: "all",
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

export function SpkClient({ records }: { records: SuperstoreSalesRecord[] }) {
  const categories = useMemo(
    () => [...new Set(records.map((record) => record.category))].sort(),
    [records],
  );
  const regions = useMemo(
    () => [...new Set(records.map((record) => record.region))].sort(),
    [records],
  );

  const [draftCategory, setDraftCategory] = useState("all");
  const [draftSubCategory, setDraftSubCategory] = useState("all");
  const [draftRegion, setDraftRegion] = useState("all");
  const [draftTarget, setDraftTarget] = useState("5");
  const [draftImportance, setDraftImportance] = useState<number[]>([
    ...AHP_IMPORTANCE,
  ]);
  const [applied, setApplied] = useState<DecisionConfig>(DEFAULT_CONFIG);
  const [tableLimit, setTableLimit] = useState("20");

  const subCategories = useMemo(() => {
    const scoped =
      draftCategory === "all"
        ? records
        : records.filter((record) => record.category === draftCategory);
    return [...new Set(scoped.map((record) => record.subCategory))].sort();
  }, [draftCategory, records]);

  const calculation = useMemo(() => {
    const selectedRecords = records.filter((record) => {
      const categoryOk =
        applied.category === "all" || record.category === applied.category;
      const subCategoryOk =
        applied.subCategory === "all" || record.subCategory === applied.subCategory;
      const regionOk = applied.region === "all" || record.region === applied.region;
      return categoryOk && subCategoryOk && regionOk;
    });
    const metrics = calculateProductMetrics(selectedRecords);
    return {
      records: selectedRecords,
      metrics,
      result: metrics.length > 0 ? buildSpkResult(metrics, applied.importance) : null,
    };
  }, [applied, records]);

  const recommended = calculation.result?.rankings.slice(0, applied.target) ?? [];
  const visibleRankings = calculation.result?.rankings.slice(0, Number(tableLimit)) ?? [];
  const visibleCriteria =
    calculation.result?.criteria ??
    CRITERIA.map((criterion) => ({ ...criterion, weight: 0 }));
  const top = recommended[0];

  function changeDraftCategory(nextCategory: string) {
    setDraftCategory(nextCategory);
    setDraftSubCategory("all");
  }

  function changeImportance(index: number, value: number) {
    setDraftImportance((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function calculateRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied({
      category: draftCategory,
      subCategory: draftSubCategory,
      region: draftRegion,
      target: Number(draftTarget),
      importance: [...draftImportance],
    });
  }

  function resetDecision() {
    setDraftCategory("all");
    setDraftSubCategory("all");
    setDraftRegion("all");
    setDraftTarget("5");
    setDraftImportance([...AHP_IMPORTANCE]);
    setApplied(DEFAULT_CONFIG);
  }

  return (
    <>
      <section className="decision-purpose">
        <div className="decision-purpose__icon">SPK</div>
        <div>
          <span className="section-kicker">Keputusan yang didukung</span>
          <h2>Produk mana yang paling layak diprioritaskan untuk promosi dan stok?</h2>
          <p>
            SPK ini meranking produk Superstore memakai data transaksi aktual:
            total profit, total sales, quantity sold, profit margin, rata-rata diskon,
            dan rasio transaksi rugi.
          </p>
        </div>
        <div className="decision-purpose__output">
          <small>Output keputusan</small>
          <strong>Produk prioritas bisnis</strong>
          <span>AHP untuk bobot - TOPSIS untuk ranking produk</span>
        </div>
      </section>

      <section className="spk-workspace">
        <form className="decision-input" onSubmit={calculateRecommendation}>
          <div className="decision-panel-heading">
            <span className="step-badge">01</span>
            <div>
              <span className="section-kicker">Input keputusan</span>
              <h2>Atur ruang lingkup dan bobot</h2>
              <p>
                Pilih kategori, subkategori, region, dan tingkat kepentingan kriteria.
                Sistem menghitung bobot AHP lalu ranking TOPSIS.
              </p>
            </div>
          </div>

          <div className="decision-basic-inputs decision-basic-inputs--three">
            <label className="field">
              <span>Category</span>
              <select value={draftCategory} onChange={(event) => changeDraftCategory(event.target.value)}>
                <option value="all">Seluruh category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Sub-Category</span>
              <select value={draftSubCategory} onChange={(event) => setDraftSubCategory(event.target.value)}>
                <option value="all">Seluruh sub-category</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Region</span>
              <select value={draftRegion} onChange={(event) => setDraftRegion(event.target.value)}>
                <option value="all">Seluruh region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Jumlah produk dipilih</span>
              <select value={draftTarget} onChange={(event) => setDraftTarget(event.target.value)}>
                <option value="3">3 produk</option>
                <option value="5">5 produk</option>
                <option value="10">10 produk</option>
                <option value="15">15 produk</option>
              </select>
            </label>
          </div>

          <div className="importance-heading">
            <div>
              <h3>Tingkat kepentingan kriteria AHP</h3>
              <p>Skala 1 rendah sampai 9 mutlak penting.</p>
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
                    <small>
                      {criterion.type === "benefit"
                        ? "Semakin tinggi semakin baik"
                        : "Semakin rendah semakin baik"}
                    </small>
                  </div>
                </div>
                <p>{criterion.description}</p>
                <div className="importance-select-row">
                  <span>Nilai kepentingan</span>
                  <select
                    aria-label={`Kepentingan ${criterion.label}`}
                    value={draftImportance[index]}
                    onChange={(event) => changeImportance(index, Number(event.target.value))}
                  >
                    {Array.from({ length: 9 }, (_, valueIndex) => valueIndex + 1).map((value) => (
                      <option key={value} value={value}>
                        {value} - {importanceLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            ))}
          </div>

          <div className="decision-actions">
            <button className="button button--primary button--large" type="submit">
              Hitung ranking produk
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
              <h2>Produk prioritas</h2>
              <p>
                {scopeLabel(applied)} - {formatNumber(calculation.metrics.length)} produk terhitung
              </p>
            </div>
          </div>

          {!calculation.result && (
            <div className="recommendation-empty">
              <span>Belum ada produk</span>
              <h3>Kombinasi filter tidak menemukan alternatif.</h3>
              <p>Perluas filter agar TOPSIS memiliki produk untuk dibandingkan.</p>
            </div>
          )}

          {top && (
            <div className="recommendation-primary">
              <span>Prioritas utama</span>
              <div className="recommendation-product recommendation-product--text">
                <div>
                  <h3 title={top.metrics.productName}>{top.metrics.productName}</h3>
                  <small>
                    {top.metrics.category} - {top.metrics.subCategory} - ID {top.productId}
                  </small>
                </div>
                <strong>{formatScore(top.score)}</strong>
              </div>
              <p>
                Produk ini paling dekat dengan kondisi ideal: profit dan sales kuat,
                quantity terjual tinggi, margin sehat, diskon terkendali, dan rasio
                transaksi rugi rendah.
              </p>
            </div>
          )}

          <div className="recommendation-list">
            <span>{applied.target} produk penerima prioritas</span>
            {recommended.length > 0 ? (
              recommended.map((item) => (
                <article className="recommendation-row" key={item.productId}>
                  <b>#{item.rank}</b>
                  <div>
                    <strong title={item.metrics.productName}>
                      {shortName(item.metrics.productName, 48)}
                    </strong>
                    <small>
                      Skor {formatScore(item.score)} - Profit {formatCurrency(item.metrics.totalProfit)}
                    </small>
                  </div>
                </article>
              ))
            ) : (
              <p className="recommendation-list__empty">
                Ranking akan muncul setelah filter menghasilkan minimal satu produk.
              </p>
            )}
          </div>

          <div className="decision-conclusion">
            <span>Rekomendasi tindakan</span>
            <p>
              {recommended.length > 0
                ? `Prioritaskan produk ${recommended
                    .map((item) => item.productId)
                    .join(", ")} untuk promosi, penempatan katalog, dan perencanaan stok.`
                : "Perluas filter terlebih dahulu agar sistem dapat memberi rekomendasi produk."}
            </p>
          </div>
        </aside>
      </section>

      <section className="content-card">
        <div className="content-card__heading content-card__heading--wrap">
          <div>
            <span className="section-kicker">Hasil AHP</span>
            <h2>Bobot kriteria setelah input</h2>
            <p className="section-description">
              Bobot ini menjelaskan prioritas manajemen sebelum TOPSIS meranking produk.
            </p>
          </div>
          <div className="consistency-inline">
            <small>Consistency Ratio</small>
            <strong>
              {calculation.result ? calculation.result.ahp.consistencyRatio.toFixed(6) : "-"}
            </strong>
            <span>Konsisten &lt;= 0,10</span>
          </div>
        </div>
        <div className="criteria-grid criteria-grid--result">
          {visibleCriteria.map((criterion, index) => (
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
      </section>

      <section className="content-card">
        <div className="content-card__heading content-card__heading--wrap">
          <div>
            <span className="section-kicker">Hasil TOPSIS</span>
            <h2>Ranking produk prioritas bisnis</h2>
            <p className="section-description">
              Produk teratas adalah kandidat promosi/stok paling layak menurut bobot aktif.
            </p>
          </div>
          <label className="field field--compact">
            <span>Tampilkan ranking</span>
            <select value={tableLimit} onChange={(event) => setTableLimit(event.target.value)}>
              <option value="10">10 produk</option>
              <option value="20">20 produk</option>
              <option value="50">50 produk</option>
              <option value="100">100 produk</option>
              <option value="1862">Semua produk</option>
            </select>
          </label>
        </div>
        {calculation.result ? (
          <div className="table-wrap table-wrap--wide">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Peringkat</th>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Skor</th>
                  <th>Sales</th>
                  <th>Profit</th>
                  <th>Qty</th>
                  <th>Margin</th>
                  <th>Diskon</th>
                  <th>Rasio Rugi</th>
                  <th>Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {visibleRankings.map((item) => {
                  const selected = item.rank <= applied.target;
                  return (
                    <tr className={selected ? "is-recommended" : ""} key={item.productId}>
                      <td><span className="rank-badge">#{item.rank}</span></td>
                      <td><ProductCell product={item.metrics} /></td>
                      <td>
                        <strong>{item.metrics.category}</strong>
                        <small className="muted-block">{item.metrics.subCategory}</small>
                      </td>
                      <td><strong className="score-value">{formatScore(item.score)}</strong></td>
                      <td>{formatCurrency(item.metrics.totalSales)}</td>
                      <td>{formatCurrency(item.metrics.totalProfit)}</td>
                      <td>{formatNumber(item.metrics.totalQuantity)}</td>
                      <td>{formatPercentage(item.metrics.profitMargin)}</td>
                      <td>{formatPercentage(item.metrics.averageDiscount)}</td>
                      <td>{formatPercentage(item.metrics.lossOrderRatio)}</td>
                      <td>
                        <span className={selected ? "decision-status decision-status--selected" : "decision-status"}>
                          {selected ? "Prioritas" : riskStatus(item.metrics)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="muted-empty">
            Tidak ada produk pada kombinasi filter ini. TOPSIS membutuhkan minimal satu alternatif.
          </div>
        )}
        <p className="table-note">
          Skor TOPSIS lebih tinggi berarti produk lebih dekat dengan solusi ideal bisnis:
          profit besar, sales kuat, demand tinggi, margin sehat, diskon rendah, dan risiko rugi rendah.
        </p>
      </section>
    </>
  );
}

function scopeLabel(config: DecisionConfig): string {
  const parts = [
    config.category === "all" ? "Semua category" : config.category,
    config.subCategory === "all" ? null : config.subCategory,
    config.region === "all" ? null : `Region ${config.region}`,
  ].filter(Boolean);
  return parts.join(" - ");
}

function riskStatus(product: ProductMetric): string {
  if (product.totalProfit < 0 || product.lossOrderRatio > 0.35) return "Evaluasi Risiko";
  return "Cadangan";
}

function shortName(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function ProductCell({ product }: { product: ProductMetric }) {
  return (
    <div className="product-cell product-cell--no-image">
      <div>
        <strong title={product.productName}>{shortName(product.productName, 58)}</strong>
        <small>{product.productId}</small>
      </div>
    </div>
  );
}
