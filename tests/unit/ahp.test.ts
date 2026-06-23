import { describe, expect, it } from "vitest";

import { calculateAhp } from "@/lib/analytics/ahp";
import { buildPairwiseMatrix } from "@/lib/analytics/criteria";

describe("AHP", () => {
  it("menghasilkan bobot konsisten sesuai tingkat kepentingan", () => {
    const result = calculateAhp(buildPairwiseMatrix());

    expect(result.weights).toHaveLength(6);
    expect(result.weights).toEqual(
      expect.arrayContaining([
        expect.closeTo(0.3, 8),
        expect.closeTo(0.2, 8),
        expect.closeTo(0.15, 8),
        expect.closeTo(0.1, 8),
      ]),
    );
    expect(result.consistencyRatio).toBeCloseTo(0, 10);
    expect(result.isConsistent).toBe(true);
  });

  it("menolak matriks yang tidak resiprokal", () => {
    expect(() => calculateAhp([[1, 2], [2, 1]])).toThrow(/resiprokal/i);
  });
});
