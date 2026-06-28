import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildSpkResult } from "../src/lib/analytics/decision";
import {
  buildDatasetSummary,
  buildProductMetrics,
  parseSuperstoreCsv,
} from "../src/lib/data/process";

const root = process.cwd();
const inputPath = path.join(root, "dataset", "Sample - Superstore.csv");
const outputDirectory = path.join(root, "data", "processed");

const csvText = await readFile(inputPath, "utf8");
const records = parseSuperstoreCsv(csvText);
const productMetrics = buildProductMetrics(records);
const spkResult = buildSpkResult(productMetrics);
const summary = buildDatasetSummary(records);

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "superstore_sales.json"),
    JSON.stringify(records),
  ),
  writeFile(
    path.join(outputDirectory, "product_metrics.json"),
    JSON.stringify(productMetrics, null, 2),
  ),
  writeFile(
    path.join(outputDirectory, "spk_result.json"),
    JSON.stringify(spkResult, null, 2),
  ),
  writeFile(
    path.join(outputDirectory, "summary.json"),
    JSON.stringify(summary, null, 2),
  ),
]);

await Promise.allSettled([
  rm(path.join(outputDirectory, "weekly_sales.json")),
  rm(path.join(outputDirectory, "store_metrics.json")),
]);

console.log(`Dataset diproses: ${records.length.toLocaleString("id-ID")} baris.`);
console.log(`Produk unik diranking: ${productMetrics.length.toLocaleString("id-ID")}.`);
console.log(
  `Peringkat pertama: ${spkResult.rankings[0].productId} (skor ${spkResult.rankings[0].score.toFixed(6)}).`,
);
console.log(`Consistency Ratio AHP: ${spkResult.ahp.consistencyRatio.toFixed(6)}.`);
