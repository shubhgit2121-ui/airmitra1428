import type { PollutantReading } from "@/lib/types";
import { CHART_MIN_SCALE, POLLUTANT_MIN_WIDTH_PCT } from "@/lib/constants";

export default function PollutantBreakdownCard({
  pollutants,
  dominant,
}: {
  pollutants: PollutantReading[];
  dominant: string | null;
}) {
  if (!pollutants.length) return null;

  const max = Math.max(...pollutants.map((p) => p.value), CHART_MIN_SCALE);

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h3 className="text-sm font-bold text-ink">Pollutants today</h3>
      <ul className="mt-4 space-y-3">
        {pollutants.map((p) => {
          const isDominant = p.label === dominant;
          const widthPct = Math.max((p.value / max) * 100, POLLUTANT_MIN_WIDTH_PCT);
          return (
            <li
              key={p.key}
              className="flex items-center gap-3"
              aria-label={`${p.label}: ${p.value}${isDominant ? ", main pollutant" : ""}`}
            >
              <span className="w-14 shrink-0 text-xs font-semibold text-ink-soft" aria-hidden="true">
                {p.label}
              </span>
              <span className="h-2 flex-1 rounded-full bg-line" aria-hidden="true">
                <span
                  className="block h-2 rounded-full"
                  style={{
                    width: `${widthPct}%`,
                    background: isDominant ? "var(--marigold)" : "var(--ink-soft)",
                    opacity: isDominant ? 1 : 0.55,
                  }}
                />
              </span>
              <span
                className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-ink"
                aria-hidden="true"
              >
                {p.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
