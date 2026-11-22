import type { ForecastDay } from "@/lib/types";
import { categoryFor } from "@/lib/aqi";
import { aqiStyle } from "@/lib/ui";
import { CHART_MIN_SCALE, FORECAST_MIN_HEIGHT_PCT } from "@/lib/constants";

const DAY_LABEL = new Intl.DateTimeFormat(undefined, { weekday: "short" });

export default function ForecastCard({ forecast }: { forecast: ForecastDay[] }) {
  const days = forecast.filter((d) => d.pm25Avg != null).slice(0, 7);
  if (!days.length) return null;

  const max = Math.max(...days.map((d) => d.pm25Avg as number), CHART_MIN_SCALE);

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h3 className="text-sm font-bold text-ink">PM2.5 forecast</h3>
      <ul className="mt-5 flex items-end gap-3">
        {days.map((d) => {
          const value = d.pm25Avg as number;
          const heightPct = Math.max((value / max) * 100, FORECAST_MIN_HEIGHT_PCT);
          const color = aqiStyle(categoryFor(value)).hex;
          const date = new Date(d.date);
          const label = Number.isNaN(date.getTime()) ? d.date : DAY_LABEL.format(date);
          return (
            <li
              key={d.date}
              className="flex flex-1 flex-col items-center gap-2"
              aria-label={`${label}: PM2.5 ${value}`}
            >
              <span className="text-xs font-semibold tabular-nums text-ink-soft" aria-hidden="true">
                {value}
              </span>
              <div className="flex h-24 w-full items-end" aria-hidden="true">
                <span
                  className="w-full rounded-t-md"
                  style={{ height: `${heightPct}%`, background: color }}
                />
              </div>
              <span className="text-xs font-medium text-ink-soft" aria-hidden="true">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
