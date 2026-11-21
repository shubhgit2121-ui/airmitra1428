import { OpenAI } from "openai";
import type { AqiData, ChatMessage, Profile, SmogPlan } from "./types";

// Groq (free, OpenAI-SDK-compatible) is the GenAI brain.
function getClient(): { client: OpenAI; model: string } {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Groq is not configured. Get a free key at https://console.groq.com and set GROQ_API_KEY in .env.local"
    );
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
  return { client, model };
}

const HOUSEHOLD_LABELS: Record<string, string> = {
  young_kids: "young children",
  elderly: "elderly members",
  respiratory: "someone with asthma / a respiratory condition",
  pregnant: "a pregnant member",
  none: "no especially sensitive members",
};
const COMMUTE_LABELS: Record<string, string> = {
  car: "commutes by car/bike (petrol/diesel)",
  transit: "commutes by public transit",
  walk_cycle: "walks or cycles",
  wfh: "works from home",
};
const EXERCISE_LABELS: Record<string, string> = {
  morning: "exercises outdoors in the morning",
  evening: "exercises outdoors in the evening",
  none: "does not exercise outdoors",
};
const COOKING_LABELS: Record<string, string> = {
  lpg: "cooks on LPG/gas",
  biomass: "cooks on wood/biomass",
  electric: "cooks on electric/induction",
};

function describeProfile(p: Profile): string {
  const hh = p.household.length
    ? p.household.map((h) => HOUSEHOLD_LABELS[h]).join(", ")
    : "unspecified household";
  return [
    `Household includes: ${hh}.`,
    `${COMMUTE_LABELS[p.commute]} (about ${p.commuteKm} km one way).`,
    `${EXERCISE_LABELS[p.exercise]}.`,
    `${COOKING_LABELS[p.cooking]}.`,
  ].join(" ");
}

function describeAqi(a: AqiData): string {
  return [
    `City: ${a.city}.`,
    `Live US AQI: ${a.aqi} (${a.category}).`,
    a.pm25 != null ? `PM2.5: ${a.pm25} µg/m³.` : "",
    a.dominantPollutant ? `Dominant pollutant: ${a.dominantPollutant}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

const SYSTEM_PROMPT = `You are AirMitra, a warm, practical air-quality coach for families facing winter smog and urban air pollution.

You are given a household profile and TODAY'S LIVE air-quality reading. Produce a concrete, personalized "Today's Smog Plan". Rules:
- Be specific to the live AQI number and the household (kids, elderly, asthma, pregnancy change the advice and urgency).
- Every tip must have: a short title, an action ("what to do today"), a why ("the reason/mechanism"), and an impact ("the direct effect of this choice", stated concretely).
- Keep each field to 1-2 short sentences. Practical, affordable, India-relevant where possible (e.g. DIY HEPA box-fan, N95, metro, avoiding biomass cooking).
- Do NOT invent exact numeric pollution statistics; speak qualitatively about reductions unless restating the provided numbers.
- Tone: calm, empowering, non-preachy.

Return ONLY valid JSON matching exactly this shape (no markdown, no extra keys):
{
  "headline": string,          // one punchy line for today
  "aqiSummary": string,        // one plain-language sentence on what today's air means for THIS household
  "routines": Tip[],           // 2-3 tips: low-emission / exposure-reducing daily routines
  "indoor": Tip[],             // 2-3 tips: indoor air-quality hacks
  "sustainable": Tip[]         // 2-3 tips: greener, sustainable alternatives
}
where Tip = { "title": string, "action": string, "why": string, "impact": string }`;

export async function generatePlan(aqi: AqiData, profile: Profile): Promise<SmogPlan> {
  const { client, model } = getClient();

  const userPrompt = `TODAY'S LIVE AIR QUALITY:\n${describeAqi(aqi)}\n\nHOUSEHOLD PROFILE:\n${describeProfile(
    profile
  )}\n\nGenerate the personalized Today's Smog Plan as JSON.`;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 5000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<SmogPlan>;

  return {
    headline: parsed.headline ?? "Today's air needs a few smart moves",
    aqiSummary: parsed.aqiSummary ?? describeAqi(aqi),
    routines: Array.isArray(parsed.routines) ? parsed.routines : [],
    indoor: Array.isArray(parsed.indoor) ? parsed.indoor : [],
    sustainable: Array.isArray(parsed.sustainable) ? parsed.sustainable : [],
  };
}

export async function answerFollowUp(
  aqi: AqiData,
  profile: Profile,
  history: ChatMessage[]
): Promise<string> {
  const { client, model } = getClient();

  const context = `You are AirMitra, continuing to help this family. Keep answers short, warm and practical. Always ground advice in their situation.\n\nLIVE AIR QUALITY: ${describeAqi(
    aqi
  )}\nHOUSEHOLD: ${describeProfile(profile)}`;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 2000,
    messages: [
      { role: "system", content: context },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  return completion.choices[0]?.message?.content ?? "Sorry, I couldn't answer that just now.";
}
