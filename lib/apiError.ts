import { NextResponse } from "next/server";
import { ValidationError } from "./validate";

// Shared by every API route's catch block: validation failures are the
// caller's fault (400), anything else is logged server-side and reported
// generically so internals never leak to the client.
export function errorResponse(routeName: string, err: unknown) {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  console.error(`[${routeName}]`, err);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}
