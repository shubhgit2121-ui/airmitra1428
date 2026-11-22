import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AqiData, ChatMessage, Profile } from "./types";

const { createMock, ctorCalls } = vi.hoisted(() => ({
  createMock: vi.fn(),
  ctorCalls: [] as unknown[],
}));

vi.mock("openai", () => {
  class OpenAI {
    chat = { completions: { create: createMock } };
    constructor(opts: unknown) {
      ctorCalls.push(opts);
    }
  }
  return { OpenAI };
});

import { answerFollowUp, generatePlan } from "./ai";

const aqi: AqiData = {
  city: "Delhi",
  aqi: 164,
  category: "Unhealthy",
  pm25: 164,
  dominantPollutant: "PM2.5",
  updatedAt: null,
  pollutants: [],
  forecast: [],
};

const profile: Profile = {
  city: "Delhi",
  household: ["young_kids", "elderly"],
  commute: "car",
  commuteKm: 10,
  exercise: "morning",
  cooking: "lpg",
};

function completionWith(content: string) {
  return { choices: [{ message: { content } }] };
}

describe("generatePlan", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "test-key";
    createMock.mockReset();
    ctorCalls.length = 0;
  });

  afterEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  it("throws a clear error when GROQ_API_KEY is missing", async () => {
    delete process.env.GROQ_API_KEY;
    await expect(generatePlan(aqi, profile)).rejects.toThrow(/Groq is not configured/);
  });

  it("points the OpenAI client at Groq's base URL", async () => {
    createMock.mockResolvedValue(completionWith("{}"));
    await generatePlan(aqi, profile);
    expect(ctorCalls[0]).toEqual(
      expect.objectContaining({ baseURL: "https://api.groq.com/openai/v1" })
    );
  });

  it("requests a JSON object response", async () => {
    createMock.mockResolvedValue(completionWith("{}"));
    await generatePlan(aqi, profile);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ response_format: { type: "json_object" } })
    );
  });

  it("parses a well-formed plan from the model", async () => {
    const plan = {
      headline: "Protect the kids today",
      aqiSummary: "Air is unhealthy.",
      routines: [{ title: "T", action: "A", why: "W", impact: "I" }],
      indoor: [],
      sustainable: [],
    };
    createMock.mockResolvedValue(completionWith(JSON.stringify(plan)));

    const result = await generatePlan(aqi, profile);
    expect(result.headline).toBe("Protect the kids today");
    expect(result.routines).toHaveLength(1);
    expect(result.indoor).toEqual([]);
  });

  it("fills safe defaults when the model omits fields", async () => {
    createMock.mockResolvedValue(completionWith(JSON.stringify({ headline: "Hi" })));
    const result = await generatePlan(aqi, profile);
    expect(result.headline).toBe("Hi");
    expect(result.routines).toEqual([]);
    expect(result.indoor).toEqual([]);
    expect(result.sustainable).toEqual([]);
    expect(result.aqiSummary).toContain("Delhi");
  });

  it("throws a friendly error when the model returns invalid JSON", async () => {
    createMock.mockResolvedValue(completionWith("not json at all"));
    await expect(generatePlan(aqi, profile)).rejects.toThrow(/invalid plan/i);
  });

  it("coerces a non-array routines field to an empty array", async () => {
    createMock.mockResolvedValue(
      completionWith(JSON.stringify({ routines: "oops", indoor: null }))
    );
    const result = await generatePlan(aqi, profile);
    expect(result.routines).toEqual([]);
    expect(result.indoor).toEqual([]);
  });
});

describe("answerFollowUp", () => {
  const history: ChatMessage[] = [{ role: "user", content: "Is it safe to jog?" }];

  beforeEach(() => {
    process.env.GROQ_API_KEY = "test-key";
    createMock.mockReset();
  });

  afterEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  it("returns the model's reply", async () => {
    createMock.mockResolvedValue(completionWith("Better to stay indoors today."));
    const reply = await answerFollowUp(aqi, profile, history);
    expect(reply).toBe("Better to stay indoors today.");
  });

  it("sends the history after a grounding system message", async () => {
    createMock.mockResolvedValue(completionWith("ok"));
    await answerFollowUp(aqi, profile, history);
    const args = createMock.mock.calls[0][0];
    expect(args.messages[0].role).toBe("system");
    expect(args.messages[0].content).toContain("Delhi");
    expect(args.messages[1]).toEqual({ role: "user", content: "Is it safe to jog?" });
  });

  it("falls back to a polite message when the model returns nothing", async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: null } }] });
    const reply = await answerFollowUp(aqi, profile, history);
    expect(reply).toMatch(/couldn't answer/i);
  });
});
