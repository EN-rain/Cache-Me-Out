import { describe, it, expect } from "vitest";
import {
  parsePeriodKey,
  periodFromRoute,
  isValidDay,
  validateEntryPeriod,
  monthSlugToNumber,
} from "./period";

describe("period validation", () => {
  it("accepts 2020 year", () => {
    const result = parsePeriodKey("2020", "year");
    expect(result.valid).toBe(true);
    expect(result.periodStart).toBe("2020-01-01");
    expect(result.periodEnd).toBe("2020-12-31");
  });

  it("rejects non-2020 years", () => {
    expect(parsePeriodKey("2019", "year").valid).toBe(false);
    expect(parsePeriodKey("2021", "year").valid).toBe(false);
  });

  it("accepts valid months", () => {
    const result = parsePeriodKey("2020-03", "month");
    expect(result.valid).toBe(true);
    expect(result.periodStart).toBe("2020-03-01");
    expect(result.periodEnd).toBe("2020-03-31");
  });

  it("rejects invalid months", () => {
    expect(parsePeriodKey("2020-13", "month").valid).toBe(false);
    expect(parsePeriodKey("2020-00", "month").valid).toBe(false);
  });

  it("accepts valid days", () => {
    expect(parsePeriodKey("2020-03-20", "day").valid).toBe(true);
    expect(isValidDay(2020, 2, 29)).toBe(true);
  });

  it("rejects invalid days", () => {
    expect(parsePeriodKey("2020-02-30", "day").valid).toBe(false);
    expect(parsePeriodKey("2020-04-31", "day").valid).toBe(false);
  });

  it("parses route params", () => {
    expect(periodFromRoute("march").valid).toBe(true);
    expect(periodFromRoute("march", "20").period).toBe("2020-03-20");
    expect(periodFromRoute("invalid").valid).toBe(false);
    expect(periodFromRoute("february", "30").valid).toBe(false);
  });

  it("validates entry periods", () => {
    expect(validateEntryPeriod("2020-03-15", "2020-03-15", "day")).toBeNull();
    expect(validateEntryPeriod("2020-03-01", "2020-03-31", "month")).toBeNull();
    expect(validateEntryPeriod("2020-01-01", "2020-12-31", "year")).toBeNull();
    expect(validateEntryPeriod("2019-01-01", "2019-12-31", "year")).not.toBeNull();
  });

  it("converts month slugs", () => {
    expect(monthSlugToNumber("march")).toBe(3);
    expect(monthSlugToNumber("December")).toBe(12);
    expect(monthSlugToNumber("foo")).toBeNull();
  });
});
