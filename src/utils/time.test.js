import { describe, expect, it } from "vitest";
import { describeTimeDifference, formatClock, getHourInZone, getUtcOffsetMinutes, getZoneName } from "./time";

const WINTER = new Date("2026-01-15T09:15:00Z");
const SUMMER = new Date("2026-07-15T09:15:00Z");

describe("getUtcOffsetMinutes", () => {
  it.each([
    ["Asia/Kolkata", WINTER, 330],
    ["Asia/Kathmandu", WINTER, 345],
    ["UTC", WINTER, 0],
    ["America/New_York", WINTER, -300],
    ["America/New_York", SUMMER, -240],
  ])("returns the offset for %s", (zone, date, expected) => {
    expect(getUtcOffsetMinutes(date, zone)).toBe(expected);
  });

  it("returns null for an unknown zone", () => {
    expect(getUtcOffsetMinutes(WINTER, "Not/AZone")).toBeNull();
  });
});

describe("clock helpers", () => {
  it("formats the wall-clock time in the given zone", () => {
    expect(formatClock(WINTER, "Asia/Kolkata").replace(/\s/g, " ")).toBe("2:45 PM");
    expect(getZoneName(WINTER, "Asia/Kolkata")).toBe("IST");
  });

  it("reports midnight as hour 0", () => {
    expect(getHourInZone(new Date("2026-01-15T18:30:00Z"), "Asia/Kolkata")).toBe(0);
  });
});

describe("describeTimeDifference", () => {
  it.each([
    [0, "Same time as you"],
    [330, "5h 30m ahead of you"],
    [-120, "2h behind you"],
    [45, "45m ahead of you"],
  ])("describes %i minutes", (minutes, expected) => {
    expect(describeTimeDifference(minutes)).toBe(expected);
  });
});
