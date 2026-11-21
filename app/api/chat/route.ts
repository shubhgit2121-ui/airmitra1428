import { NextResponse } from "next/server";
import { answerFollowUp } from "@/lib/ai";
import type { AqiData, ChatMessage, Profile } from "@/lib/types";

interface ChatBody {
  profile: Profile;
  aqi: AqiData;
  messages: ChatMessage[];
}

export async function POST(req: Request) {
  try {
    const { profile, aqi, messages } = (await req.json()) as ChatBody;

    if (!profile || !aqi || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing context. Generate a plan first." },
        { status: 400 }
      );
    }

    const reply = await answerFollowUp(aqi, profile, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
