import { afterEach, describe, expect, it, vi } from "vitest";
import { categoryFor, fetchAqi } from "./aqi";

describe("categoryFor", () => {
  it("maps boundary values to the right US AQI band", () => {
    expect(categoryFor(0)).toBe("Good");
    expect(categoryFor(50)).toBe("Good");
    expect(categoryFor(51)).toBe("Moderate");
    expect(categoryFor(100)).toBe("Moderate");
    expect(categoryFor(101)).toBe("Unhealthy for Sensitive Groups");
    expect(categoryFor(150)).toBe("Unhealthy for Sensitive Groups");
    expect(categoryFor(151)).toBe("Unhealthy");
    expect(categoryFor(200)).toBe("Unhealthy");
    expect(categoryFor(201)).toBe("Very Unhealthy");
    expect(categoryFor(300)).toBe("Very Unhealthy");
    expect(categoryFor(301)).toBe("Hazardous");
    expect(categoryFor(500)).toBe("Hazardous");
  });
});

describe("fetchAqi", () => {
  const originalFetch = global.fetch;
  const originalToken = process.env.WAQI_TOKEN;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.WAQI_TOKEN = originalToken;
    vi.restoreAllMocks();
  });

  it("throws a clear error when WAQI_TOKEN is missing", async () => {
    delete process.env.WAQI_TOKEN;
    await expect(fetchAqi("Delhi")).rejects.toThrow(/WAQI_TOKEN/);
  });

  it("parses a successful WAQI response into AqiData", async () => {
    process.env.WAQI_TOKEN = "test-token";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        data: {
          aqi: 180,
          dominentpol: "pm25",
          iaqi: { pm25: { v: 120 }, pm10: { v: 90 } },
          city: { name: "New Delhi" },
          time: { iso: "2026-11-21T10:00:00+05:30" },
          forecast: { daily: { pm25: [{ avg: 130, day: "2026-11-22" }] } },
        },
      }),
    }) as unknown as typeof fetch;

    const result = await fetchAqi(`unique-city-${Date.now()}`);

    expect(result.city).toBe("New Delhi");
    expect(result.aqi).toBe(180);
    expect(result.category).toBe("Unhealthy");
    expect(result.pm25).toBe(120);
    expect(result.dominantPollutant).toBe("PM2.5");
    expect(result.forecast).toEqual([{ date: "2026-11-22", pm25Avg: 130 }]);
  });

  it("throws when the station is unknown", async () => {
    process.env.WAQI_TOKEN = "test-token";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "error", data: "Unknown station" }),
    }) as unknown as typeof fetch;

    await expect(fetchAqi(`unique-city-${Date.now()}`)).rejects.toThrow(/Could not find/);
  });

  it("throws a clear error when the upstream HTTP call fails", async () => {
    process.env.WAQI_TOKEN = "test-token";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    await expect(fetchAqi(`unique-city-${Date.now()}`)).rejects.toThrow(/HTTP 503/);
  });

  it("serves a cached reading instead of re-fetching within the TTL", async () => {
    process.env.WAQI_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "ok",
        data: {
          aqi: 80,
          iaqi: { pm25: { v: 40 } },
          city: { name: "Cached City" },
        },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const city = `cache-city-${Date.now()}`;
    const first = await fetchAqi(city);
    const second = await fetchAqi(city);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});
