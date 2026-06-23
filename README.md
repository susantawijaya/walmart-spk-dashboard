# SPK Prioritas Toko Walmart

Sistem dashboard retail berbahasa Indonesia untuk menganalisis penjualan Walmart dan
menentukan prioritas 45 toko menggunakan metode **AHP–TOPSIS**.

## Isi sistem

- **Dashboard** — filter toko, tahun, dan status hari libur; insight dinamis, enam scorecard, dan lima chart.
- **SPK** — input periode, jumlah toko, tingkat kepentingan kriteria, bobot AHP, ranking TOPSIS, dan rekomendasi keputusan.
- **Questions** — lima pertanyaan keputusan yang dilengkapi bukti, kesimpulan, dan rekomendasi tindakan.
- **Dataset** — sumber, data dictionary, statistik kualitas, preview, dan penjelasan dukungan clustering.
- **Dokumentasi** — sitemap dan UML Use Case Diagram.
- **Kredit** — atribusi pengunggah dataset Kaggle dan aset diagram draw.io.

## Dataset

Sistem hanya menggunakan satu file:

- `dataset/Walmart_Sales.csv`
- 6.435 baris, 8 kolom, 45 toko
- Periode 5 Februari 2010–26 Oktober 2012
- Sumber: https://www.kaggle.com/datasets/mikhail1681/walmart-sales
- Pengunggah/pemilik halaman Kaggle: `mikhail1681`

Kolom yang tersedia: `Store`, `Date`, `Weekly_Sales`, `Holiday_Flag`,
`Temperature`, `Fuel_Price`, `CPI`, dan `Unemployment`.

Seluruh 6.435 baris dan 8 kolom digunakan. `Store`, `Date`, `Weekly_Sales`, dan
`Holiday_Flag` menjadi analisis kinerja; `Temperature`, `Fuel_Price`, `CPI`, serta
`Unemployment` ditampilkan dalam analisis konteks operasional dan ekonomi.

Dataset mendukung clustering karena memiliki 45 objek toko dan beberapa atribut
numerik. Clustering tidak diimplementasikan karena fokus sistem ini adalah keputusan
prioritas anggaran pengembangan toko.

## Kriteria SPK

| Kode | Kriteria | Jenis | Bobot |
|---|---|---|---:|
| C1 | Total Penjualan | Benefit | 30% |
| C2 | Rata-rata Penjualan Mingguan | Benefit | 20% |
| C3 | Kenaikan Penjualan Hari Libur | Benefit | 15% |
| C4 | Pertumbuhan Penjualan | Benefit | 15% |
| C5 | Volatilitas Penjualan | Cost | 10% |
| C6 | Rasio Minggu Penjualan Rendah | Cost | 10% |

Bobot tersebut adalah konfigurasi awal. Pada halaman SPK, pengguna dapat mengubah
tingkat kepentingan setiap kriteria pada skala 1–9. Sistem membentuk matriks
perbandingan AHP, menghitung bobot dan Consistency Ratio, lalu TOPSIS menghitung ulang
ranking toko. Outputnya membantu memilih toko penerima anggaran pengembangan.

## Menjalankan di lokal

Persyaratan: Node.js 20.9 atau lebih baru.

```bash
npm install
npm run data:process
npm run dev
```

Buka http://localhost:3000.

## Pemeriksaan kualitas

```bash
npm run data:validate
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Atau jalankan seluruh pemeriksaan sekaligus:

```bash
npm run qa:check
```

## Teknologi

- Next.js 16
- React 19
- TypeScript
- Recharts
- Tailwind CSS
- Vitest

Tidak ada API AI, backend Express, database, atau environment variable yang diperlukan.

UML Use Case pada halaman Dokumentasi menggunakan langsung aset
`walmart usecase.drawio.png` yang diberikan di folder proyek.
