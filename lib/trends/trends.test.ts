import { describe, expect, it } from "vitest";
import { trendDateRange, compactDate } from "./dates";
import { wikimediaPageviewsUrl, wikipediaArticleTitle } from "./wikimedia";
import { gdeltDocUrl } from "./gdelt";

describe("trend importer helpers", () => {
  it("builds 2020 date ranges", () => {
    expect(trendDateRange("2020-03", "month")).toEqual({
      valid: true,
      periodKey: "2020-03",
      start: "2020-03-01",
      end: "2020-03-31",
    });
  });

  it("compacts dates for external APIs", () => {
    expect(compactDate("2020-03-20")).toBe("20200320");
  });

  it("formats Wikimedia article URLs", () => {
    expect(wikipediaArticleTitle("Tiger King")).toBe("Tiger_King");
    expect(wikimediaPageviewsUrl("Tiger King", "2020-03-01", "2020-03-31")).toContain(
      "/Tiger_King/daily/2020030100/2020033100"
    );
  });

  it("formats GDELT document URLs", () => {
    const url = gdeltDocUrl("Animal Crossing", "2020-03-01", "2020-03-31");
    expect(url).toContain("mode=artlist");
    expect(url).toContain("startdatetime=20200301000000");
    expect(url).toContain("enddatetime=20200331235959");
  });
});
