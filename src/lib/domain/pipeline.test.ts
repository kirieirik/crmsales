import { describe, expect, it } from "vitest";

import { calculateWeightedValue, isOverdue } from "./pipeline";

describe("calculateWeightedValue", () => {
  it("calculates a probability-weighted opportunity value", () => {
    expect(calculateWeightedValue(100000, 60)).toBe(60000);
  });

  it("rejects invalid values", () => {
    expect(() => calculateWeightedValue(-1, 50)).toThrow();
    expect(() => calculateWeightedValue(100, 101)).toThrow();
  });
});

describe("isOverdue", () => {
  it("returns true only when a due date is before now", () => {
    const now = new Date("2026-09-21T12:00:00.000Z");

    expect(isOverdue(new Date("2026-09-21T11:59:59.000Z"), now)).toBe(true);
    expect(isOverdue(new Date("2026-09-21T12:00:00.000Z"), now)).toBe(false);
  });
});
