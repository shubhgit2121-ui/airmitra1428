import { NextResponse } from "next/server";
import { fetchAqi } from "@/lib/aqi";
import { generatePlan } from "@/lib/ai";
import { computeImpact } from "@/lib/impact";
import { clientKeyFor, rateLimit } from "@/lib/rateLimit";
import { ValidationError, validateProfile } from "@/lib/validate";
import type { PlanResponse } from "@/lib/types";

export async function POST(req: Request) {
  const limit = rateLimit(`plan:${clientKeyFor(req)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const profile = validateProfile(body);

    // 1. Live air-quality data (real, not mocked)
    const aqi = await fetchAqi(profile.city);

    // 2. GenAI (Groq — GPT-OSS 120B) generates the personalized plan
    // 3. Deterministic impact math (cigarettes / CO2)
    const [plan, impact] = [await generatePlan(aqi, profile), computeImpact(aqi, profile)];

    const payload: PlanResponse = { aqi, plan, impact };
    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[/api/plan]", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
