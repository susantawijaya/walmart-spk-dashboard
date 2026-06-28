import { describe, expect, it } from "vitest";

import { calculateAhp } from "@/lib/analytics/ahp";
import { buildPairwiseMatrix } from "@/lib/analytics/criteria";

describe("AHP", () => {
  it("menghasilkan bobot konsisten sesuai tingkat kepentingan", () => {
    const result = calculateAhp(buildPairwiseMatrix());

    expect(result.weights).toHaveLength(6);
    expect(result.weights).toEqual(
      [
        expect.closeTo(7 / 27, 5),
        expect.closeTo(6 / 27, 5),
        expect.closeTo(4 / 27, 5),
        expect.closeTo(5 / 27, 5),
        expect.closeTo(3 / 27, 5),
        expect.closeTo(2 / 27, 5),
      ],
    );
    expect(result.consistencyRatio).toBeCloseTo(0, 10);
    expect(result.isConsistent).toBe(true);
  });

  it("menolak matriks yang tidak resiprokal", () => {
    expect(() => calculateAhp([[1, 2], [2, 1]])).toThrow(/resiprokal/i);
  });
});
