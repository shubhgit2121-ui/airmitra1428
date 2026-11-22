import type { Profile } from "./types";

/** Debounce before a profile edit triggers a new plan request (ms). */
export const PLAN_DEBOUNCE_MS = 500;

/**
 * Minimum time the loading state stays visible, so a fast response doesn't
 * produce a jarring flicker of the skeleton/spinner.
 */
export const MIN_LOADING_MS = 500;

/** The profile the dashboard starts with before the user edits anything. */
export const DEFAULT_PROFILE: Profile = {
  city: "Delhi",
  household: ["young_kids"],
  commute: "car",
  commuteKm: 10,
  exercise: "morning",
  cooking: "lpg",
};

// Chart and visualization constants
export const CHART_MIN_SCALE = 10;
export const FORECAST_MIN_HEIGHT_PCT = 8;
export const POLLUTANT_MIN_WIDTH_PCT = 4;
export const DECIMAL_PRECISION = 10;
export const ROUND_TRIP_MULTIPLIER = 2;
export const MAX_COMMUTE_KM = 200;
