"use client";

import { useEffect, useRef, useState } from "react";
import DashboardShell from "./components/DashboardShell";
import ProfileSidebar from "./components/ProfileSidebar";
import AqiHeroCard from "./components/AqiHeroCard";
import PollutantBreakdownCard from "./components/PollutantBreakdownCard";
import ForecastCard from "./components/ForecastCard";
import ImpactCard from "./components/ImpactCard";
import PlanCard from "./components/PlanCard";
import ChatDock from "./components/ChatDock";
import type { PlanResponse, Profile } from "@/lib/types";

const DEFAULT_PROFILE: Profile = {
  city: "Delhi",
  household: ["young_kids"],
  commute: "car",
  commuteKm: 10,
  exercise: "morning",
  cooking: "lpg",
};

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 rounded-2xl bg-surface" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-40 rounded-xl bg-surface" />
        <div className="h-40 rounded-xl bg-surface" />
      </div>
      <div className="h-28 rounded-xl bg-surface" />
      <div className="h-64 rounded-xl bg-surface" />
    </div>
  );
}

export default function Home() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cityMissing = !profile.city.trim();
  const displayError = cityMissing ? "Enter a city to see its air quality." : error;

  useEffect(() => {
    if (cityMissing) return;

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const MIN_LOADING_MS = 500;
      const startedAt = Date.now();

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not build your plan.");

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_LOADING_MS) {
          await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
        }
        setResult(data as PlanResponse);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
    // profile is compared by value, not identity — JSON.stringify keeps the
    // debounce from re-firing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(profile)]);

  return (
    <DashboardShell
      sidebar={
        <ProfileSidebar
          profile={profile}
          onChange={setProfile}
          loading={loading}
          updatedAt={result?.aqi.updatedAt ?? null}
        />
      }
    >
      {displayError && (
        <p className="mb-6 border-l-2 border-[#bf4b3c] pl-4 text-sm text-[#963a2e]">
          {displayError}
        </p>
      )}

      {result ? (
        <div className="relative">
          {loading && (
            <div className="sticky top-6 z-30 mb-6 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink">
                <span className="h-2 w-2 animate-ping rounded-full bg-jade" />
                Updating your dashboard…
              </div>
            </div>
          )}

          <div
            className={
              "space-y-6 transition-opacity duration-300 " +
              (loading ? "pointer-events-none opacity-40" : "opacity-100")
            }
          >
            <AqiHeroCard aqi={result.aqi} summary={result.plan.aqiSummary} loading={loading} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PollutantBreakdownCard
                pollutants={result.aqi.pollutants}
                dominant={result.aqi.dominantPollutant}
              />
              <ForecastCard forecast={result.aqi.forecast} />
            </div>

            <ImpactCard impact={result.impact} />
            <PlanCard plan={result.plan} />

            <p className="pt-2 text-xs text-ink-soft/70">
              Impact estimates use published heuristics (PM2.5↔cigarettes;
              standard transport CO₂ factors). Advice is informational, not
              medical. Built on Groq (GPT-OSS 120B) and live WAQI air-quality data.
            </p>
          </div>
        </div>
      ) : (
        !displayError && <DashboardSkeleton />
      )}

      {result && <ChatDock profile={profile} aqi={result.aqi} />}
    </DashboardShell>
  );
}
