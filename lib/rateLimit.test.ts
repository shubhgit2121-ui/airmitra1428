import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientKeyFor, rateLimit, rateLimitResponse } from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit within the window", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 20; i++) {
      expect(rateLimit(key).ok).toBe(true);
    }
  });

  it("blocks once the window's request limit is exceeded", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 20; i++) rateLimit(key);
    const result = rateLimit(key);
    expect(result.ok).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets the window once it elapses", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 20; i++) rateLimit(key);
    expect(rateLimit(key).ok).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(rateLimit(key).ok).toBe(true);
  });
});

describe("clientKeyFor", () => {
  it("uses the first IP in x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientKeyFor(req)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    const req = new Request("https://example.com");
    expect(clientKeyFor(req)).toBe("unknown");
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 with the computed Retry-After header", async () => {
    const res = rateLimitResponse({ retryAfterSeconds: 42 });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    const body = await res.json();
    expect(body.error).toMatch(/Too many requests/);
  });

  it("defaults Retry-After to 60 seconds when not provided", () => {
    const res = rateLimitResponse({});
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});
