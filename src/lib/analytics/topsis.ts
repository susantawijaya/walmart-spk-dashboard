export interface TopsisAlternative<T> {
  id: number;
  values: number[];
  data: T;
}

export interface TopsisResult<T> {
  id: number;
  score: number;
  distancePositive: number;
  distanceNegative: number;
  data: T;
}

export function calculateTopsis<T>(
  alternatives: TopsisAlternative<T>[],
  weights: number[],
  types: Array<"benefit" | "cost">,
): TopsisResult<T>[] {
  if (alternatives.length === 0) {
    throw new Error("TOPSIS memerlukan minimal satu alternatif.");
  }
  if (weights.length === 0 || weights.length !== types.length) {
    throw new Error("Jumlah bobot dan jenis kriteria TOPSIS harus sama.");
  }
  if (Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) > 1e-8) {
    throw new Error("Total bobot TOPSIS harus bernilai 1.");
  }
  alternatives.forEach((alternative) => {
    if (
      alternative.values.length !== weights.length ||
      alternative.values.some((value) => !Number.isFinite(value))
    ) {
      throw new Error("Setiap alternatif harus memiliki nilai numerik lengkap.");
    }
  });

  const divisors = weights.map((_, criterionIndex) =>
    Math.sqrt(
      alternatives.reduce(
        (sum, alternative) => sum + alternative.values[criterionIndex] ** 2,
        0,
      ),
    ),
  );
  const weightedMatrix = alternatives.map((alternative) =>
    alternative.values.map((value, criterionIndex) => {
      const divisor = divisors[criterionIndex];
      return (divisor === 0 ? 0 : value / divisor) * weights[criterionIndex];
    }),
  );
  const positiveIdeal = weights.map((_, criterionIndex) => {
    const values = weightedMatrix.map((row) => row[criterionIndex]);
    return types[criterionIndex] === "benefit"
      ? Math.max(...values)
      : Math.min(...values);
  });
  const negativeIdeal = weights.map((_, criterionIndex) => {
    const values = weightedMatrix.map((row) => row[criterionIndex]);
    return types[criterionIndex] === "benefit"
      ? Math.min(...values)
      : Math.max(...values);
  });

  return alternatives
    .map((alternative, rowIndex) => {
      const distancePositive = Math.sqrt(
        weightedMatrix[rowIndex].reduce(
          (sum, value, criterionIndex) =>
            sum + (value - positiveIdeal[criterionIndex]) ** 2,
          0,
        ),
      );
      const distanceNegative = Math.sqrt(
        weightedMatrix[rowIndex].reduce(
          (sum, value, criterionIndex) =>
            sum + (value - negativeIdeal[criterionIndex]) ** 2,
          0,
        ),
      );
      const denominator = distancePositive + distanceNegative;
      return {
        id: alternative.id,
        score: denominator === 0 ? 0 : distanceNegative / denominator,
        distancePositive,
        distanceNegative,
        data: alternative.data,
      };
    })
    .sort((left, right) => right.score - left.score || left.id - right.id);
}
