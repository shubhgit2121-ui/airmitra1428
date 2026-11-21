import { NextResponse } from "next/server";
import { answerFollowUp } from "@/lib/ai";
import { errorResponse } from "@/lib/apiError";
import { clientKeyFor, rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { validateAqi, validateChatMessages, validateProfile } from "@/lib/validate";

export async function POST(req: Request) {
  const limit = rateLimit(`chat:${clientKeyFor(req)}`);
  if (!limit.ok) {
    return rateLimitResponse(limit);
  }

  try {
    const body = await req.json();
    const profile = validateProfile(body?.profile);
    const aqi = validateAqi(body?.aqi);
    const messages = validateChatMessages(body?.messages);

    const reply = await answerFollowUp(aqi, profile, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    return errorResponse("/api/chat", err);
  }
}
