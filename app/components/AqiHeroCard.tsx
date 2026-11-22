import type { AqiData } from "@/lib/types";
import { aqiStyle } from "@/lib/ui";

export default function AqiHeroCard({
  aqi,
  summary,
  loading,
}: {
  aqi: AqiData;
  summary?: string;
  loading: boolean;
}) {
  const s = aqiStyle(aqi.category);

  return (
    <div
      className="rounded-2xl px-6 py-7 sm:px-8 sm:py-9"
      style={{ background: s.wash }}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink-soft">{aqi.city}</p>
            {loading && (
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft"
                aria-hidden="true"
              />
            )}
          </div>
          <div
            className="mt-1 flex items-baseline gap-3"
            aria-label={`US AQI ${aqi.aqi}, ${aqi.category}`}
          >
            <span
              className="text-7xl font-black leading-none tracking-tight text-ink tabular-nums"
              aria-hidden="true"
            >
              {aqi.aqi}
            </span>
            <div className="pb-1" aria-hidden="true">
              <p className="text-sm font-medium text-ink-soft">US AQI</p>
              <p className={`text-lg font-bold ${s.badgeText}`}>{aqi.category}</p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:text-right">
          {aqi.pm25 != null && (
            <>
              <dt className="text-ink-soft sm:order-2">PM2.5</dt>
              <dd className="font-semibold text-ink sm:order-1">
                {aqi.pm25} µg/m³
              </dd>
            </>
          )}
          {aqi.dominantPollutant && (
            <>
              <dt className="text-ink-soft sm:order-2">Main pollutant</dt>
              <dd className="font-semibold text-ink sm:order-1">
                {aqi.dominantPollutant}
              </dd>
            </>
          )}
        </dl>
      </div>

      {summary && (
        <p className="mt-5 max-w-xl border-t border-ink/10 pt-4 text-base leading-relaxed text-ink">
          {summary}
        </p>
      )}
    </div>
  );
}
