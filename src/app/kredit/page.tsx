import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kredit dan Atribusi" };

export default function CreditPage() {
  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Credit & Attribution</span>
          <h1>Kredit Dataset dan Aset</h1>
          <p>
            Atribusi sumber yang digunakan sistem agar asal data dan diagram dapat
            dijelaskan secara terbuka saat presentasi.
          </p>
        </div>
      </section>

      <section className="credit-primary">
        <div className="credit-avatar">M</div>
        <div>
          <span className="section-kicker">Pengunggah dataset di Kaggle</span>
          <h2>mikhail1681</h2>
          <p>
            Dataset <strong>Walmart Sales</strong> yang digunakan proyek ini dibagikan
            melalui akun Kaggle <strong>mikhail1681</strong>. Kredit ini merujuk kepada
            pemilik halaman/pengunggah dataset di Kaggle dan tidak menyatakan bahwa akun
            tersebut adalah pemilik resmi merek Walmart.
          </p>
          <div className="dataset-actions">
            <a className="button button--primary" href="https://www.kaggle.com/datasets/mikhail1681/walmart-sales" target="_blank" rel="noreferrer">Halaman dataset</a>
            <a className="button button--ghost" href="https://www.kaggle.com/mikhail1681" target="_blank" rel="noreferrer">Profil Kaggle</a>
          </div>
        </div>
      </section>

      <section className="credit-grid">
        <article>
          <span className="credit-number">01</span><h2>Dataset</h2>
          <dl><div><dt>Judul</dt><dd>Walmart Sales</dd></div><div><dt>Platform</dt><dd>Kaggle</dd></div><div><dt>Penyedia halaman</dt><dd>mikhail1681</dd></div><div><dt>File</dt><dd>Walmart_Sales.csv</dd></div></dl>
        </article>
        <article>
          <span className="credit-number">02</span><h2>Subjek data</h2>
          <dl><div><dt>Perusahaan</dt><dd>Walmart</dd></div><div><dt>Domain</dt><dd>Retail / supermarket</dd></div><div><dt>Objek analisis</dt><dd>45 toko</dd></div><div><dt>Periode</dt><dd>2010–2012</dd></div></dl>
        </article>
        <article>
          <span className="credit-number">03</span><h2>Diagram UML</h2>
          <dl><div><dt>Sumber aset</dt><dd>File proyek pengguna</dd></div><div><dt>Nama file</dt><dd>walmart usecase.drawio.png</dd></div><div><dt>Penggunaan</dt><dd>Dokumentasi teknis</dd></div><div><dt>Modifikasi</dt><dd>Tidak digambar ulang</dd></div></dl>
        </article>
      </section>

      <aside className="attribution-note">
        <strong>Catatan atribusi</strong>
        <p>
          Sistem ini dibuat untuk kebutuhan akademik. Nama Walmart digunakan sebagai
          subjek dataset. Proyek ini tidak berafiliasi dengan atau mewakili Walmart maupun Kaggle.
          Ketentuan penggunaan dan lisensi mengikuti informasi pada halaman dataset Kaggle.
        </p>
      </aside>
    </div>
  );
}
