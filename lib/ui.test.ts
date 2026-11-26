import { describe, expect, it } from "vitest";
import { aqiStyle } from "./ui";

describe("aqiStyle", () => {
  it("returns the matching style for a known AQI category", () => {
    expect(aqiStyle("Good").hex).toBe("#4f9e6e");
    expect(aqiStyle("Hazardous").hex).toBe("#5c2430");
  });

  it("falls back to the default (Moderate) style for an unknown category", () => {
    expect(aqiStyle("Something Unexpected")).toEqual(aqiStyle("Moderate"));
  });
});
