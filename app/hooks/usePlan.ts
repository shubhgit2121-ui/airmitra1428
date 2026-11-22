"use client";

import { useEffect, useRef, useState } from "react";
import { MIN_LOADING_MS, PLAN_DEBOUNCE_MS } from "@/lib/constants";
import type { PlanResponse, Profile } from "@/lib/types";

export interface UsePlanState {
  result: PlanResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches a personalized smog plan for the given profile.
 *
 * Edits are debounced, in-flight requests are aborted when the profile changes
 * again, and the loading state is held for a short minimum so the UI doesn't
 * flicker on fast responses. Returns the latest result, loading, and error.
 */
export function usePlan(profile: Profile): UsePlanState {
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cityMissing = !profile.city.trim();

  useEffect(() => {
    if (cityMissing) return;

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const startedAt = Date.now();
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: profile.city,
            household: profile.household,
            commute: profile.commute,
            commuteKm: profile.commuteKm,
            exercise: profile.exercise,
            cooking: profile.cooking,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not build your plan.");

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_LOADING_MS) {
          await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
        }
        setResult(data as PlanResponse);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    }, PLAN_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // Depend on the profile's primitive fields (and the household array, which
    // is replaced on every toggle) rather than the object identity, so the
    // debounce fires only on a real change.
  }, [
    profile.city,
    profile.household,
    profile.commute,
    profile.commuteKm,
    profile.exercise,
    profile.cooking,
    cityMissing,
  ]);

  return { result, loading, error };
}
