import type { Metadata } from "next";

import { getDatasetSummary } from "@/lib/data/repository";
import { formatNumber } from "@/lib/formatters";

export const metadata: Metadata = { title: "Kredit - Superstore SPK" };

export default function CreditPage() {
  const summary = getDatasetSummary();

  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Credit & Attribution</span>
          <h1>Kredit Dataset</h1>
          <p>
            Halaman ini menjelaskan asal dataset agar proyek akademik transparan dan
            mudah dipertanggungjawabkan saat presentasi.
          </p>
        </div>
      </section>

      <section className="credit-primary">
        <div className="credit-avatar">K</div>
        <div>
          <span className="section-kicker">Pengunggah dataset di Kaggle</span>
          <h2>{summary.dataset.uploader}</h2>
          <p>
            Dataset <strong>{summary.dataset.title}</strong> digunakan sebagai sumber
            data proyek ini. Kredit diberikan kepada akun Kaggle{" "}
            <strong>{summary.dataset.uploader}</strong> sebagai pengunggah halaman dataset.
            Dataset dipakai untuk kebutuhan akademik dan tidak diklaim sebagai data internal
            perusahaan tertentu.
          </p>
          <div className="dataset-actions">
            <a className="button button--primary" href={summary.dataset.sourceUrl} target="_blank" rel="noreferrer">
              Halaman dataset
            </a>
            <a className="button button--ghost" href="https://www.kaggle.com/vivek468" target="_blank" rel="noreferrer">
              Profil Kaggle
            </a>
          </div>
        </div>
      </section>

      <section className="credit-grid credit-grid--two">
        <article>
          <span className="credit-number">01</span>
          <h2>Dataset</h2>
          <dl>
            <div><dt>Judul</dt><dd>{summary.dataset.title}</dd></div>
            <div><dt>Platform</dt><dd>Kaggle</dd></div>
            <div><dt>Pengunggah</dt><dd>{summary.dataset.uploader}</dd></div>
            <div><dt>File utama</dt><dd>{summary.dataset.fileName}</dd></div>
          </dl>
        </article>
        <article>
          <span className="credit-number">02</span>
          <h2>Subjek Data</h2>
          <dl>
            <div><dt>Domain</dt><dd>Retail / Sales</dd></div>
            <div><dt>Objek analisis</dt><dd>Transaksi Superstore</dd></div>
            <div><dt>Baris data</dt><dd>{formatNumber(summary.dataset.rowCount)}</dd></div>
            <div><dt>Order aktual</dt><dd>{formatNumber(summary.dataset.orderCount)}</dd></div>
          </dl>
        </article>
      </section>

      <aside className="attribution-note">
        <strong>Catatan atribusi akademik</strong>
        <p>
          Sistem pendukung keputusan ini dibuat untuk kebutuhan tugas akademik. Lisensi
          dan ketentuan penggunaan mengikuti halaman dataset Kaggle terkait.
        </p>
      </aside>
    </div>
  );
}
