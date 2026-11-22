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
