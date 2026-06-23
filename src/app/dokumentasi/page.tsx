import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Dokumentasi Teknis" };

export default function DocumentationPage() {
  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Technical Documentation</span>
          <h1>Sitemap dan UML Use Case</h1>
          <p>
            Dokumentasi teknis dibuat ringkas sesuai kebutuhan tugas: struktur halaman
            dan interaksi pengguna dengan sistem.
          </p>
        </div>
      </section>

      <section className="documentation-card">
        <div className="documentation-card__heading">
          <span>Dokumen 01</span>
          <h2>Sitemap Sistem</h2>
          <p>Enam halaman utama yang dapat diakses pengguna.</p>
        </div>
        <div className="sitemap" role="img" aria-label="Sitemap sistem SPK Walmart">
          <div className="sitemap__root">SPK Prioritas Toko Walmart</div>
          <div className="sitemap__line" />
          <div className="sitemap__children">
            <SitemapNode title="Dashboard" items={["Filter data", "Insight & scorecard", "5 visualisasi"]} />
            <SitemapNode title="SPK" items={["Input keputusan", "Bobot AHP", "Ranking TOPSIS", "Rekomendasi"]} />
            <SitemapNode title="Questions" items={["5 pertanyaan strategis", "Bukti & rekomendasi"]} />
            <SitemapNode title="Dataset" items={["Data dictionary", "Preview data", "Kualitas & clustering"]} />
            <SitemapNode title="Dokumentasi" items={["Sitemap", "UML Use Case"]} />
            <SitemapNode title="Kredit" items={["Pembuat dataset", "Atribusi aset"]} />
          </div>
        </div>
      </section>

      <section className="documentation-card">
        <div className="documentation-card__heading">
          <span>Dokumen 02</span>
          <h2>UML Use Case Diagram</h2>
          <p>Aktor utama adalah pengguna yang menganalisis data dan menjalankan proses keputusan.</p>
        </div>
        <div className="drawio-diagram" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "30px" }}>
          <Image src="/walmart-usecase-diagram-v2.png" width={501} height={562} alt="UML Use Case Diagram SPK Walmart" priority />
        </div>
        <div className="usecase-description">
          <h3>Deskripsi aktor</h3>
          <p>
            Pengguna dapat berupa dosen, mahasiswa, atau pengambil keputusan yang ingin
            melihat performa penjualan, mengatur parameter AHP, dan memperoleh rekomendasi
            prioritas toko tanpa perlu mengubah data mentah.
          </p>
        </div>

        <div className="usecase-description" style={{ borderLeftColor: "var(--blue)", background: "#f0f5fa" }}>
          <h3>Daftar Use Case Sistem (Total 10 Use Case)</h3>
          <p style={{ marginBottom: "10px" }}>
            Dengan ditambahkannya halaman baru, berikut adalah cakupan fungsi lengkap yang dapat dilakukan Pengguna di sistem ini:
          </p>
          <ul style={{ paddingLeft: "20px", listStyleType: "disc", fontSize: "11px", color: "var(--muted)" }}>
            <li style={{ marginBottom: "4px" }}><strong>Melihat dashboard penjualan:</strong> Menampilkan ringkasan data, scorecard, dan grafik tren di halaman utama.</li>
            <li style={{ marginBottom: "4px" }}><strong>Mengatur filter data:</strong> Menyaring data berdasarkan toko, tahun, dan hari libur pada dashboard.</li>
            <li style={{ marginBottom: "4px" }}><strong>Memasukkan parameter keputusan:</strong> Menyesuaikan bobot kriteria AHP-TOPSIS melalui slider/select box.</li>
            <li style={{ marginBottom: "4px" }}><strong>Menghitung bobot AHP:</strong> Melakukan kalkulasi bobot kepentingan kriteria dan rasio konsistensi (CR).</li>
            <li style={{ marginBottom: "4px" }}><strong>Menghasilkan ranking TOPSIS:</strong> Memproses toko prioritas berdasarkan kesamaan terhadap solusi ideal.</li>
            <li style={{ marginBottom: "4px" }}><strong>Menerima rekomendasi prioritas:</strong> Memperoleh output toko utama dan toko cadangan penerima dana.</li>
            <li style={{ marginBottom: "4px" }}><strong>Membaca business questions:</strong> Melihat 5 pertanyaan bisnis analitis dengan jawaban berbasis data riil.</li>
            <li style={{ marginBottom: "4px" }}><strong>Membaca dokumentasi teknis:</strong> Mengakses sitemap dan memvalidasi UML diagram.</li>
            <li style={{ marginBottom: "4px" }}><strong>Melihat dataset:</strong> Menampilkan informasi detail kolom, preview data, dan analisis clustering.</li>
            <li style={{ marginBottom: "4px" }}><strong>Melihat kredit dataset:</strong> Menampilkan atribusi penyedia data Kaggle dan informasi proyek.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function SitemapNode({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="sitemap-node">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
