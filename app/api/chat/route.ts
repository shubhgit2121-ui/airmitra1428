import { NextResponse } from "next/server";
import { answerFollowUp } from "@/lib/ai";
import { clientKeyFor, rateLimit } from "@/lib/rateLimit";
import { ValidationError, validateAqi, validateChatMessages, validateProfile } from "@/lib/validate";

export async function POST(req: Request) {
  const limit = rateLimit(`chat:${clientKeyFor(req)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const profile = validateProfile(body?.profile);
    const aqi = validateAqi(body?.aqi);
    const messages = validateChatMessages(body?.messages);

    const reply = await answerFollowUp(aqi, profile, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[/api/chat]", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
