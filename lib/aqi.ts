import type { AqiData, ForecastDay, PollutantReading } from "./types";

// US AQI category bands
export function categoryFor(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

const POLLUTANT_LABELS: Record<string, string> = {
  pm25: "PM2.5",
  pm10: "PM10",
  o3: "Ozone",
  no2: "NO₂",
  so2: "SO₂",
  co: "CO",
};

/**
 * Fetch live air quality for a city from the WAQI API (aqicn.org).
 * Falls back to a clear error that the caller can surface to the user.
 */
export async function fetchAqi(city: string): Promise<AqiData> {
  const token = process.env.WAQI_TOKEN;
  if (!token) {
    throw new Error(
      "WAQI_TOKEN is not set. Get a free token at https://aqicn.org/data-platform/token/"
    );
  }

  const url = `https://api.waqi.info/feed/${encodeURIComponent(
    city.trim()
  )}/?token=${token}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Air-quality service error (HTTP ${res.status}).`);
  }

  const json = (await res.json()) as {
    status: string;
    data:
      | {
          aqi: number;
          dominentpol?: string;
          iaqi?: Record<string, { v: number }>;
          city?: { name?: string };
          time?: { s?: string; iso?: string };
          forecast?: {
            daily?: Record<string, Array<{ avg: number; day: string }>>;
          };
        }
      | string;
  };

  if (json.status !== "ok" || typeof json.data === "string") {
    throw new Error(
      `Could not find air-quality data for "${city}". Try a larger nearby city.`
    );
  }

  const d = json.data;
  const aqi = typeof d.aqi === "number" ? d.aqi : Number(d.aqi);
  const pm25 = d.iaqi?.pm25?.v ?? null;
  const dominant = d.dominentpol
    ? POLLUTANT_LABELS[d.dominentpol] ?? d.dominentpol.toUpperCase()
    : null;

  const pollutants: PollutantReading[] = Object.entries(POLLUTANT_LABELS)
    .filter(([key]) => typeof d.iaqi?.[key]?.v === "number")
    .map(([key, label]) => ({ key, label, value: d.iaqi![key].v }));

  const forecast: ForecastDay[] = (d.forecast?.daily?.pm25 ?? []).map((day) => ({
    date: day.day,
    pm25Avg: typeof day.avg === "number" ? day.avg : null,
  }));

  return {
    city: d.city?.name ?? city,
    aqi: Number.isFinite(aqi) ? aqi : 0,
    category: categoryFor(Number.isFinite(aqi) ? aqi : 0),
    pm25: typeof pm25 === "number" ? pm25 : null,
    dominantPollutant: dominant,
    updatedAt: d.time?.iso ?? d.time?.s ?? null,
    pollutants,
    forecast,
  };
}
