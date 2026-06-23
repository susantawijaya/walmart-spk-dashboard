import type { AhpResult } from "@/lib/data/contracts";

const RANDOM_INDEX: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

function validateMatrix(matrix: number[][]): void {
  const size = matrix.length;
  if (size === 0 || matrix.some((row) => row.length !== size)) {
    throw new Error("Matriks AHP harus berbentuk persegi dan tidak kosong.");
  }

  matrix.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Seluruh nilai matriks AHP harus positif.");
      }
      const reciprocal = matrix[columnIndex][rowIndex];
      if (Math.abs(value * reciprocal - 1) > 1e-8) {
        throw new Error("Matriks AHP harus bersifat resiprokal.");
      }
    });
  });
}

export function calculateAhp(matrix: number[][], maxCR = 0.1): AhpResult {
  validateMatrix(matrix);
  const size = matrix.length;
  const columnSums = Array.from({ length: size }, (_, columnIndex) =>
    matrix.reduce((sum, row) => sum + row[columnIndex], 0),
  );
  const normalized = matrix.map((row) =>
    row.map((value, columnIndex) => value / columnSums[columnIndex]),
  );
  const weights = normalized.map(
    (row) => row.reduce((sum, value) => sum + value, 0) / size,
  );
  const weightedSums = matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * weights[index], 0),
  );
  const consistencyVector = weightedSums.map(
    (value, index) => value / weights[index],
  );
  const lambdaMax =
    consistencyVector.reduce((sum, value) => sum + value, 0) / size;
  const consistencyIndex = size <= 2 ? 0 : (lambdaMax - size) / (size - 1);
  const randomIndex = RANDOM_INDEX[size] ?? 1.49;
  const consistencyRatio = randomIndex === 0 ? 0 : consistencyIndex / randomIndex;

  return {
    weights,
    lambdaMax,
    consistencyIndex,
    randomIndex,
    consistencyRatio,
    isConsistent: consistencyRatio <= maxCR,
  };
}
