import { describe, expect, it } from "vitest";
import {
  MAX_CHAT_MESSAGES,
  ValidationError,
  validateAqi,
  validateChatMessages,
  validateProfile,
} from "./validate";

const validProfileInput = {
  city: "  Delhi  ",
  household: ["young_kids", "not_a_real_tag"],
  commute: "car",
  commuteKm: 10,
  exercise: "morning",
  cooking: "lpg",
};

describe("validateProfile", () => {
  it("trims the city and drops unknown household tags", () => {
    const profile = validateProfile(validProfileInput);
    expect(profile.city).toBe("Delhi");
    expect(profile.household).toEqual(["young_kids"]);
  });

  it("defaults to ['none'] when no valid household tags remain", () => {
    const profile = validateProfile({ ...validProfileInput, household: ["bogus"] });
    expect(profile.household).toEqual(["none"]);
  });

  it("clamps commuteKm into [0, 200]", () => {
    expect(validateProfile({ ...validProfileInput, commuteKm: -50 }).commuteKm).toBe(0);
    expect(validateProfile({ ...validProfileInput, commuteKm: 9000 }).commuteKm).toBe(200);
    expect(validateProfile({ ...validProfileInput, commuteKm: "not-a-number" }).commuteKm).toBe(0);
  });

  it("rejects a missing or blank city", () => {
    expect(() => validateProfile({ ...validProfileInput, city: "" })).toThrow(ValidationError);
    expect(() => validateProfile({ ...validProfileInput, city: "   " })).toThrow(ValidationError);
  });

  it("rejects an invalid commute/exercise/cooking enum", () => {
    expect(() => validateProfile({ ...validProfileInput, commute: "teleport" })).toThrow(
      ValidationError
    );
    expect(() => validateProfile({ ...validProfileInput, exercise: "teleport" })).toThrow(
      ValidationError
    );
    expect(() => validateProfile({ ...validProfileInput, cooking: "teleport" })).toThrow(
      ValidationError
    );
  });

  it("rejects a non-object body", () => {
    expect(() => validateProfile(null)).toThrow(ValidationError);
    expect(() => validateProfile("delhi")).toThrow(ValidationError);
  });
});

describe("validateChatMessages", () => {
  it("rejects an empty or non-array messages list", () => {
    expect(() => validateChatMessages([])).toThrow(ValidationError);
    expect(() => validateChatMessages(undefined)).toThrow(ValidationError);
  });

  it("rejects an invalid role", () => {
    expect(() => validateChatMessages([{ role: "system", content: "hi" }])).toThrow(
      ValidationError
    );
  });

  it("rejects blank content", () => {
    expect(() => validateChatMessages([{ role: "user", content: "   " }])).toThrow(
      ValidationError
    );
  });

  it("rejects a non-object entry in the messages array", () => {
    expect(() => validateChatMessages([null])).toThrow(ValidationError);
    expect(() => validateChatMessages([42])).toThrow(ValidationError);
  });

  it("caps history length and message length", () => {
    const longHistory = Array.from({ length: MAX_CHAT_MESSAGES + 10 }, (_, i) => ({
      role: "user" as const,
      content: `message ${i}`,
    }));
    const result = validateChatMessages(longHistory);
    expect(result).toHaveLength(MAX_CHAT_MESSAGES);
    expect(result[result.length - 1].content).toBe(`message ${longHistory.length - 1}`);

    const longMessage = [{ role: "user" as const, content: "x".repeat(5000) }];
    expect(validateChatMessages(longMessage)[0].content.length).toBeLessThanOrEqual(500);
  });
});

describe("validateAqi", () => {
  it("rejects a malformed payload", () => {
    expect(() => validateAqi(null)).toThrow(ValidationError);
    expect(() => validateAqi({ city: "Delhi" })).toThrow(ValidationError);
  });

  it("fills in safe defaults for missing optional fields", () => {
    const aqi = validateAqi({ city: "Delhi", aqi: 150, category: "Unhealthy" });
    expect(aqi.pm25).toBeNull();
    expect(aqi.pollutants).toEqual([]);
    expect(aqi.forecast).toEqual([]);
  });
});
