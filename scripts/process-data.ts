import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildDatasetSummary,
  parseWalmartCsv,
} from "../src/lib/data/process";
import { buildSpkResult } from "../src/lib/analytics/decision";
import { calculateStoreMetrics } from "../src/lib/analytics/store-metrics";

const root = process.cwd();
const inputPath = path.join(root, "dataset", "Walmart_Sales.csv");
const outputDirectory = path.join(root, "data", "processed");

const csvText = await readFile(inputPath, "utf8");
const records = parseWalmartCsv(csvText);
const storeMetrics = calculateStoreMetrics(records);
const spkResult = buildSpkResult(storeMetrics);
const summary = buildDatasetSummary(records);

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "weekly_sales.json"),
    JSON.stringify(records),
  ),
  writeFile(
    path.join(outputDirectory, "store_metrics.json"),
    JSON.stringify(storeMetrics, null, 2),
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

console.log(`Dataset diproses: ${records.length.toLocaleString("id-ID")} baris.`);
console.log(`Toko diranking: ${storeMetrics.length}.`);
console.log(
  `Peringkat pertama: Toko ${spkResult.rankings[0].store} (skor ${spkResult.rankings[0].score.toFixed(6)}).`,
);
console.log(`Consistency Ratio AHP: ${spkResult.ahp.consistencyRatio.toFixed(6)}.`);
