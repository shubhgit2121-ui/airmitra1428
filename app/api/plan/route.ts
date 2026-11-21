import { NextResponse } from "next/server";
import { fetchAqi } from "@/lib/aqi";
import { generatePlan } from "@/lib/ai";
import { computeImpact } from "@/lib/impact";
import type { PlanResponse, Profile } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const profile = (await req.json()) as Profile;

    if (!profile?.city || !profile.city.trim()) {
      return NextResponse.json({ error: "Please enter a city." }, { status: 400 });
    }

    // 1. Live air-quality data (real, not mocked)
    const aqi = await fetchAqi(profile.city);

    // 2. GenAI (Groq — GPT-OSS 120B) generates the personalized plan
    // 3. Deterministic impact math (cigarettes / CO2)
    const [plan, impact] = [await generatePlan(aqi, profile), computeImpact(aqi, profile)];

    const payload: PlanResponse = { aqi, plan, impact };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
