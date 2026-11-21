import { describe, expect, it } from "vitest";
import { computeImpact } from "./impact";
import type { AqiData, Profile } from "./types";

const baseAqi: AqiData = {
  city: "Delhi",
  aqi: 180,
  category: "Unhealthy",
  pm25: 110,
  dominantPollutant: "PM2.5",
  updatedAt: null,
  pollutants: [],
  forecast: [],
};

const baseProfile: Profile = {
  city: "Delhi",
  household: ["young_kids"],
  commute: "car",
  commuteKm: 10,
  exercise: "morning",
  cooking: "lpg",
};

describe("computeImpact", () => {
  it("derives cigarette-equivalent exposure from PM2.5", () => {
    const impact = computeImpact(baseAqi, baseProfile);
    expect(impact.cigarettesPerDay).toBeCloseTo(110 / 22, 5);
  });

  it("estimates PM2.5 from AQI when the station doesn't report it", () => {
    const impact = computeImpact({ ...baseAqi, pm25: null, aqi: 50 }, baseProfile);
    expect(impact.cigarettesPerDay).toBeCloseTo(12 / 22, 1);
  });

  it("gives zero CO2 saved for car commuters (no behavior change)", () => {
    const impact = computeImpact(baseAqi, { ...baseProfile, commute: "car" });
    expect(impact.co2SavedKg).toBe(0);
  });

  it("gives full avoided CO2 for walk/cycle commuters", () => {
    const impact = computeImpact(baseAqi, { ...baseProfile, commute: "walk_cycle", commuteKm: 10 });
    expect(impact.co2SavedKg).toBeCloseTo(10 * 2 * 0.17, 5);
  });

  it("gives full avoided CO2 for work-from-home", () => {
    const impact = computeImpact(baseAqi, { ...baseProfile, commute: "wfh", commuteKm: 10 });
    expect(impact.co2SavedKg).toBeCloseTo(10 * 2 * 0.17, 5);
  });

  it("gives partial avoided CO2 for transit commuters (lower than car, not zero)", () => {
    const impact = computeImpact(baseAqi, { ...baseProfile, commute: "transit", commuteKm: 10 });
    const expectedSaved = Math.round((10 * 2 * 0.17 - 10 * 2 * 0.04) * 10) / 10;
    expect(impact.co2SavedKg).toBe(expectedSaved);
    expect(impact.co2SavedKg).toBeGreaterThan(0);
  });

  it("never produces a negative commute distance even if given one", () => {
    const impact = computeImpact(baseAqi, { ...baseProfile, commute: "walk_cycle", commuteKm: -5 });
    expect(impact.co2SavedKg).toBe(0);
  });
});
