import { NextResponse } from "next/server";
import { fetchAqi } from "@/lib/aqi";
import { generatePlan } from "@/lib/ai";
import { computeImpact } from "@/lib/impact";
import { errorResponse } from "@/lib/apiError";
import { clientKeyFor, rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { validateProfile } from "@/lib/validate";
import type { PlanResponse } from "@/lib/types";

export async function POST(req: Request) {
  const limit = rateLimit(`plan:${clientKeyFor(req)}`);
  if (!limit.ok) {
    return rateLimitResponse(limit);
  }

  try {
    const body = await req.json();
    const profile = validateProfile(body);

    // 1. Live air-quality data (real, not mocked)
    const aqi = await fetchAqi(profile.city);

    // 2. GenAI (Groq — GPT-OSS 120B) generates the personalized plan
    const plan = await generatePlan(aqi, profile);
    // 3. Deterministic impact math (cigarettes / CO2)
    const impact = computeImpact(aqi, profile);

    const payload: PlanResponse = { aqi, plan, impact };
    return NextResponse.json(payload);
  } catch (err) {
    return errorResponse("/api/plan", err);
  }
}
