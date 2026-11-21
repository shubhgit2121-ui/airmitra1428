// Shared types for AirMitra

export type HouseholdTag =
  | "young_kids"
  | "elderly"
  | "respiratory"
  | "pregnant"
  | "none";

export type CommuteMode =
  | "car"
  | "transit"
  | "walk_cycle"
  | "wfh";

export type ExerciseHabit = "morning" | "evening" | "none";
export type CookingFuel = "lpg" | "biomass" | "electric";

export interface Profile {
  city: string;
  household: HouseholdTag[];
  commute: CommuteMode;
  commuteKm: number; // one-way daily commute distance
  exercise: ExerciseHabit;
  cooking: CookingFuel;
}

export interface PollutantReading {
  key: string;   // pm25 / pm10 / o3 / no2 / so2 / co
  label: string; // display label, e.g. "PM2.5"
  value: number; // station-reported index value
}

export interface ForecastDay {
  date: string;        // YYYY-MM-DD
  pm25Avg: number | null;
}

export interface AqiData {
  city: string;        // resolved station/city name
  aqi: number;         // US AQI index
  category: string;    // Good / Moderate / Unhealthy / ... / Hazardous
  pm25: number | null; // µg/m3 if available
  dominantPollutant: string | null;
  updatedAt: string | null;
  pollutants: PollutantReading[]; // full per-pollutant breakdown, if reported
  forecast: ForecastDay[];        // upcoming days' pm2.5 forecast, if reported
}

export interface Tip {
  title: string;
  action: string; // what to do today
  why: string;    // the reason / mechanism
  impact: string; // the explained effect of the choice
}

export interface ImpactMeter {
  cigarettesPerDay: number;
  cigarettesNote: string;
  co2SavedKg: number;
  co2Note: string;
}

export interface SmogPlan {
  headline: string;
  aqiSummary: string;
  routines: Tip[];
  indoor: Tip[];
  sustainable: Tip[];
}

export interface PlanResponse {
  aqi: AqiData;
  plan: SmogPlan;
  impact: ImpactMeter;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
