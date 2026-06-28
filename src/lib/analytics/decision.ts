import { calculateAhp } from "@/lib/analytics/ahp";
import {
  AHP_IMPORTANCE,
  buildPairwiseMatrix,
  CRITERIA,
} from "@/lib/analytics/criteria";
import { calculateTopsis } from "@/lib/analytics/topsis";
import type { ProductMetric, SpkResult } from "@/lib/data/contracts";

function criterionValue(metric: ProductMetric, key: keyof ProductMetric): number {
  const value = Number(metric[key]);
  return Number.isFinite(value) ? value : 0;
}

export function buildSpkResult(
  metrics: ProductMetric[],
  importance: readonly number[] = AHP_IMPORTANCE,
): SpkResult {
  if (metrics.length === 0) {
    throw new Error("Perhitungan SPK memerlukan minimal satu produk.");
  }
  if (
    importance.length !== CRITERIA.length ||
    importance.some((value) => !Number.isFinite(value) || value < 1 || value > 9)
  ) {
    throw new Error("Nilai kepentingan AHP harus berjumlah enam dan berada pada skala 1-9.");
  }

  const pairwiseMatrix = buildPairwiseMatrix(importance);
  const ahp = calculateAhp(pairwiseMatrix);
  const alternatives = metrics.map((metric) => ({
    id: metric.productId,
    data: metric,
    values: CRITERIA.map((criterion) =>
      criterionValue(metric, criterion.metricKey),
    ),
  }));
  const ranked = calculateTopsis(
    alternatives,
    ahp.weights,
    CRITERIA.map((criterion) => criterion.type),
  );

  return {
    generatedAt: new Date().toISOString(),
    method: "AHP-TOPSIS",
    criteria: CRITERIA.map((criterion, index) => ({
      ...criterion,
      weight: ahp.weights[index],
    })),
    pairwiseMatrix,
    ahp,
    rankings: ranked.map((result, index) => ({
      rank: index + 1,
      productId: result.id,
      score: result.score,
      distancePositive: result.distancePositive,
      distanceNegative: result.distanceNegative,
      metrics: result.data,
    })),
  };
}
