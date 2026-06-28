# SPK Prioritas Produk Superstore

Sistem dashboard retail berbahasa Indonesia untuk menganalisis transaksi sales
aktual Sample Superstore dan menentukan produk yang paling layak diprioritaskan
untuk promosi, stok, dan evaluasi bisnis menggunakan metode **AHP-TOPSIS**.

## Isi Sistem

- **Dashboard** - scorecard sales, profit, order, quantity, margin, dan diskon; 4 chart bisnis berbasis transaksi aktual.
- **SPK** - input bobot kriteria, ranking TOPSIS, dan output produk prioritas promosi/stok.
- **Questions** - lima pertanyaan bisnis tentang pertumbuhan, revenue category, profit sub-category, dampak diskon, dan prioritas produk.
- **Kredit** - atribusi pengunggah dataset Kaggle.

## Dataset

Sistem menggunakan satu file:

- `dataset/Sample - Superstore.csv`
- 9.994 baris transaksi/order item
- 21 kolom
- 5.009 order aktual
- 1.862 produk unik
- Periode order: 2014-01-03 sampai 2017-12-30
- Sumber: https://www.kaggle.com/datasets/vivek468/superstore-dataset-final
- Pengunggah halaman Kaggle: `vivek468`

Kolom dataset:

`Row ID`, `Order ID`, `Order Date`, `Ship Date`, `Ship Mode`, `Customer ID`,
`Customer Name`, `Segment`, `Country`, `City`, `State`, `Postal Code`, `Region`,
`Product ID`, `Category`, `Sub-Category`, `Product Name`, `Sales`, `Quantity`,
`Discount`, dan `Profit`.

Dataset ini memiliki transaksi penjualan aktual. Karena itu dashboard memakai
`Sales`, `Profit`, `Quantity`, `Discount`, `Order Date`, dan `Ship Date` secara
langsung, bukan proxy.

## Dashboard

Empat visualisasi utama:

| Chart | Yang dibandingkan | Nilai angka | Tujuan bisnis |
|---|---|---|---|
| Line Chart | Bulan order | Sales dan Profit | Melihat apakah revenue naik bersama profit |
| Pie Chart | Category | Total Sales | Melihat kontribusi revenue per category |
| Bar Chart | Sub-Category | Total Profit | Menemukan subkategori menguntungkan dan merugikan |
| Bar Chart | Discount Range | Jumlah transaksi untung dan rugi | Melihat rentang diskon yang masih sehat dan yang didominasi rugi |

## Keputusan SPK

Keputusan yang didukung:

> Produk mana yang paling layak diprioritaskan untuk promosi dan stok?

Alternatif:

- Produk Superstore, menggunakan `Product ID` dan `Product Name`.

Kriteria:

| Kode | Kriteria | Jenis | Sumber/hasil agregasi |
|---|---|---|---|
| C1 | Total Profit | Benefit | Sum `Profit` per produk |
| C2 | Total Sales | Benefit | Sum `Sales` per produk |
| C3 | Quantity Sold | Benefit | Sum `Quantity` per produk |
| C4 | Profit Margin | Benefit | Total Profit / Total Sales |
| C5 | Rata-rata Diskon | Cost | Average `Discount` per produk |
| C6 | Rasio Transaksi Rugi | Cost | Proporsi transaksi produk dengan Profit negatif |

Pengguna dapat mengubah tingkat kepentingan setiap kriteria pada skala 1-9. Sistem
mengubah input tersebut menjadi bobot AHP, memeriksa Consistency Ratio, lalu TOPSIS
menghasilkan ranking produk.

## Menjalankan di Lokal

Persyaratan: Node.js 20.9 atau lebih baru.

```bash
npm.cmd install
npm.cmd run data:process
npm.cmd run dev
```

Buka http://localhost:3000.

## Pemeriksaan Kualitas

```bash
npm.cmd run data:validate
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run build
```

Atau jalankan seluruh pemeriksaan sekaligus:

```bash
npm.cmd run qa:check
```

## Teknologi

- Next.js 16
- React 19
- TypeScript
- Recharts
- Tailwind CSS
- Vitest

Tidak ada API AI, backend Express, database, atau environment variable yang diperlukan.
