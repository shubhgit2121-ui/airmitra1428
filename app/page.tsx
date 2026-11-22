"use client";

import { useState } from "react";
import DashboardShell from "./components/DashboardShell";
import ProfileSidebar from "./components/ProfileSidebar";
import AqiHeroCard from "./components/AqiHeroCard";
import PollutantBreakdownCard from "./components/PollutantBreakdownCard";
import ForecastCard from "./components/ForecastCard";
import ImpactCard from "./components/ImpactCard";
import PlanCard from "./components/PlanCard";
import ChatDock from "./components/ChatDock";
import { usePlan } from "./hooks/usePlan";
import { DEFAULT_PROFILE } from "@/lib/constants";
import type { Profile } from "@/lib/types";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
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
  const { result, loading, error } = usePlan(profile);

  const cityMissing = !profile.city.trim();
  const displayError = cityMissing ? "Enter a city to see its air quality." : error;

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
      <p className="sr-only" role="status" aria-live="polite">
        {loading ? "Updating your dashboard." : ""}
      </p>

      {displayError && (
        <p
          role="alert"
          className="mb-6 border-l-2 border-[#bf4b3c] pl-4 text-sm text-[#963a2e]"
        >
          {displayError}
        </p>
      )}

      {result ? (
        <div className="relative">
          {loading && (
            <div className="sticky top-6 z-30 mb-6 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink">
                <span className="h-2 w-2 animate-ping rounded-full bg-jade" aria-hidden="true" />
                Updating your dashboard…
              </div>
            </div>
          )}

          <div
            aria-busy={loading}
            className={`space-y-6 transition-opacity duration-300 ${
              loading ? "pointer-events-none opacity-40" : "opacity-100"
            }`}
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
