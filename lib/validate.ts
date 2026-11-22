// Server-side validation for untrusted request bodies.
// Every field is whitelisted/bounded before it reaches the LLM prompt or an
// upstream API call — the UI already only ever sends well-formed values, but
// the API routes are public endpoints and must not trust that.

import type {
  AqiData,
  ChatMessage,
  CommuteMode,
  CookingFuel,
  ExerciseHabit,
  HouseholdTag,
  Profile,
} from "./types";
import { MAX_COMMUTE_KM } from "./constants";

export const MAX_CITY_LENGTH = 80;
export const MAX_CHAT_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 500;

const HOUSEHOLD_TAGS: HouseholdTag[] = [
  "young_kids",
  "elderly",
  "respiratory",
  "pregnant",
  "none",
];
const COMMUTE_MODES: CommuteMode[] = ["car", "transit", "walk_cycle", "wfh"];
const EXERCISE_HABITS: ExerciseHabit[] = ["morning", "evening", "none"];
const COOKING_FUELS: CookingFuel[] = ["lpg", "biomass", "electric"];

export class ValidationError extends Error {}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export function validateProfile(input: unknown): Profile {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Profile is required.");
  }
  const p = input as Record<string, unknown>;

  if (typeof p.city !== "string" || !p.city.trim()) {
    throw new ValidationError("Please enter a city.");
  }
  const city = p.city.trim().slice(0, MAX_CITY_LENGTH);

  const household = Array.isArray(p.household)
    ? p.household.filter((h): h is HouseholdTag => isOneOf(h, HOUSEHOLD_TAGS))
    : [];

  if (!isOneOf(p.commute, COMMUTE_MODES)) {
    throw new ValidationError("Invalid commute mode.");
  }
  if (!isOneOf(p.exercise, EXERCISE_HABITS)) {
    throw new ValidationError("Invalid exercise habit.");
  }
  if (!isOneOf(p.cooking, COOKING_FUELS)) {
    throw new ValidationError("Invalid cooking fuel.");
  }

  const commuteKmRaw = typeof p.commuteKm === "number" ? p.commuteKm : Number(p.commuteKm);
  const commuteKm = Number.isFinite(commuteKmRaw)
    ? Math.min(Math.max(commuteKmRaw, 0), MAX_COMMUTE_KM)
    : 0;

  return {
    city,
    household: household.length ? household : ["none"],
    commute: p.commute,
    commuteKm,
    exercise: p.exercise,
    cooking: p.cooking,
  };
}

export function validateChatMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new ValidationError("At least one message is required.");
  }

  const messages = input.slice(-MAX_CHAT_MESSAGES).map((m): ChatMessage => {
    if (!m || typeof m !== "object") {
      throw new ValidationError("Invalid message.");
    }
    const entry = m as Record<string, unknown>;
    if (entry.role !== "user" && entry.role !== "assistant") {
      throw new ValidationError("Invalid message role.");
    }
    if (typeof entry.content !== "string" || !entry.content.trim()) {
      throw new ValidationError("Invalid message content.");
    }
    return {
      role: entry.role,
      content: entry.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    };
  });

  return messages;
}

// The chat endpoint receives the AQI reading back from the client (it was
// issued by our own /api/plan response), so this only guards against a
// malformed/forged payload crashing the prompt builder — not a full re-parse.
export function validateAqi(input: unknown): AqiData {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Air-quality context is required.");
  }
  const a = input as Record<string, unknown>;
  if (typeof a.city !== "string" || typeof a.aqi !== "number" || typeof a.category !== "string") {
    throw new ValidationError("Invalid air-quality context.");
  }

  return {
    city: a.city.slice(0, MAX_CITY_LENGTH),
    aqi: a.aqi,
    category: a.category,
    pm25: typeof a.pm25 === "number" ? a.pm25 : null,
    dominantPollutant: typeof a.dominantPollutant === "string" ? a.dominantPollutant : null,
    updatedAt: typeof a.updatedAt === "string" ? a.updatedAt : null,
    pollutants: Array.isArray(a.pollutants) ? (a.pollutants as AqiData["pollutants"]) : [],
    forecast: Array.isArray(a.forecast) ? (a.forecast as AqiData["forecast"]) : [],
  };
}
