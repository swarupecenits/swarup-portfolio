import { describe, expect, it } from "vitest";
import { isOngoing, toISOMonth } from "./dates";

describe("toISOMonth", () => {
  it.each([
    ["May 2024", "2024-05"],
    ["September 2023", "2023-09"],
    ["Sept. 2023", "2023-09"],
    [" jan 2026 ", "2026-01"],
  ])("converts %j", (input, expected) => {
    expect(toISOMonth(input)).toBe(expected);
  });

  it.each(["Present", "2024", "Foo 2024", "", undefined])("returns undefined for %j", (input) => {
    expect(toISOMonth(input)).toBeUndefined();
  });
});

describe("isOngoing", () => {
  it("detects open-ended ranges", () => {
    expect(isOngoing("Jul 2026 - Present")).toBe(true);
    expect(isOngoing("May 2024 - Jun 2025")).toBe(false);
    expect(isOngoing(undefined)).toBe(false);
  });
});
