import type { AqiData, ImpactMeter, Profile } from "./types";

// Berkeley Earth rule of thumb: breathing ~22 µg/m³ of PM2.5 for 24h
// is roughly equivalent to smoking 1 cigarette.
const PM25_PER_CIGARETTE = 22;

// Rough tailpipe emission factor for a petrol car (kg CO2 per km).
const CAR_KG_CO2_PER_KM = 0.17;

// Shared-transit per-passenger-km emission factor (bus/metro average) — lower
// than driving, but not zero, unlike walking/cycling or not commuting at all.
const TRANSIT_KG_CO2_PER_KM = 0.04;

// Estimate PM2.5 from AQI when the station doesn't report raw PM2.5.
// US AQI for PM2.5 is piecewise-linear; this inverts the two most common bands.
function estimatePm25FromAqi(aqi: number): number {
  const bands: Array<[number, number, number, number]> = [
    // [aqiLo, aqiHi, concLo, concHi]
    [0, 50, 0, 12],
    [51, 100, 12.1, 35.4],
    [101, 150, 35.5, 55.4],
    [151, 200, 55.5, 150.4],
    [201, 300, 150.5, 250.4],
    [301, 500, 250.5, 500.4],
  ];
  for (const [aLo, aHi, cLo, cHi] of bands) {
    if (aqi >= aLo && aqi <= aHi) {
      return cLo + ((aqi - aLo) * (cHi - cLo)) / (aHi - aLo);
    }
  }
  return 500;
}

export function computeImpact(aqi: AqiData, profile: Profile): ImpactMeter {
  const pm25 = aqi.pm25 ?? estimatePm25FromAqi(aqi.aqi);
  const cigarettes = Math.round((pm25 / PM25_PER_CIGARETTE) * 10) / 10;

  const sensitive = profile.household.some(
    (h) => h === "young_kids" || h === "elderly" || h === "respiratory" || h === "pregnant"
  );
  const who = profile.household.includes("young_kids")
    ? "your child"
    : profile.household.includes("elderly")
    ? "your elderly family member"
    : "each person";

  const cigarettesNote =
    `Breathing today's outdoor air ≈ smoking ${cigarettes} cigarette` +
    `${cigarettes === 1 ? "" : "s"} for ${who} over 24 hours` +
    (sensitive ? " — and sensitive lungs feel it more." : ".");

  // CO2 avoided today vs. driving that same round trip by car. Each mode has
  // its own emission factor, so the figure actually moves when the mode does:
  // car itself saves nothing (you're still driving); transit is lower-carbon
  // but not zero; walking/cycling and not commuting at all are zero-emission.
  const roundTripKm = Math.max(0, profile.commuteKm) * 2;
  const drivingCo2 = Math.round(roundTripKm * CAR_KG_CO2_PER_KM * 10) / 10;
  const transitCo2 = Math.round(roundTripKm * TRANSIT_KG_CO2_PER_KM * 10) / 10;

  let co2SavedKg = 0;
  let co2Note = "";
  switch (profile.commute) {
    case "car":
      co2SavedKg = 0;
      co2Note =
        drivingCo2 > 0
          ? `Switching today's ${roundTripKm} km round-trip from car to public transit would cut about ${Math.round((drivingCo2 - transitCo2) * 10) / 10} kg CO₂ — and keep you out of roadside pollution peaks.`
          : `Leaving the car home on high-pollution days avoids tailpipe emissions and your own roadside exposure.`;
      break;
    case "transit":
      co2SavedKg = Math.max(0, Math.round((drivingCo2 - transitCo2) * 10) / 10);
      co2Note = `By taking public transit instead of driving, you're already avoiding about ${co2SavedKg} kg CO₂ today — transit still emits some, just far less per person than a car.`;
      break;
    case "walk_cycle":
      co2SavedKg = drivingCo2;
      co2Note = `Walking/cycling adds zero tailpipe CO₂ — about ${drivingCo2} kg saved vs driving. On severe-AQI days, mask up or shift indoors.`;
      break;
    case "wfh":
      co2SavedKg = drivingCo2;
      co2Note = `Working from home today avoids roughly ${drivingCo2} kg CO₂ of commuting and your exposure during peak-traffic smog.`;
      break;
  }

  return { cigarettesPerDay: cigarettes, cigarettesNote, co2SavedKg, co2Note };
}
