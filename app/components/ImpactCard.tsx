import type { ImpactMeter } from "@/lib/types";

export default function ImpactCard({ impact }: { impact: ImpactMeter }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h3 className="text-sm font-bold text-ink">Today&apos;s impact</h3>
      <div className="mt-4 grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="pb-5 sm:pb-0 sm:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums text-marigold">
              {impact.cigarettesPerDay}
            </span>
            <span className="text-sm font-semibold text-ink-soft">
              cigarettes / day, equivalent
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {impact.cigarettesNote}
          </p>
        </div>

        <div className="pt-5 sm:pt-0 sm:pl-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tabular-nums text-jade">
              {impact.co2SavedKg}
            </span>
            <span className="text-sm font-semibold text-ink-soft">
              kg CO₂ you can save today
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {impact.co2Note}
          </p>
        </div>
      </div>
    </div>
  );
}
