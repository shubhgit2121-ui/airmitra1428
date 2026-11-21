"use client";

import { useMemo, useState } from "react";
import type { SmogPlan, Tip } from "@/lib/types";

function TipRow({ tip, accent }: { tip: Tip; accent: string }) {
  return (
    <li className="border-l-2 py-4 pl-5" style={{ borderColor: accent }}>
      <h4 className="font-bold text-ink">{tip.title}</h4>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{tip.action}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{tip.why}</p>
      <p className="mt-2 text-sm font-medium" style={{ color: accent }}>
        {tip.impact}
      </p>
    </li>
  );
}

export default function PlanCard({ plan }: { plan: SmogPlan }) {
  const tabs = useMemo(
    () =>
      [
        { key: "routines", label: "Daily routines", tips: plan.routines, accent: "var(--ink-soft)" },
        { key: "indoor", label: "Indoor air hacks", tips: plan.indoor, accent: "var(--marigold)" },
        { key: "sustainable", label: "Sustainable swaps", tips: plan.sustainable, accent: "var(--jade)" },
      ].filter((t) => t.tips.length),
    [plan]
  );

  const [active, setActive] = useState(0);
  const current = tabs[Math.min(active, tabs.length - 1)];

  if (!tabs.length) return null;

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h2 className="text-xl font-black tracking-tight text-ink">{plan.headline}</h2>

      <div role="tablist" aria-label="Plan categories" className="mt-5 flex flex-wrap gap-5 border-b border-line">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            role="tab"
            aria-selected={current.key === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setActive(i)}
            className={
              "-mb-px border-b-2 pb-3 text-sm font-semibold transition " +
              (current.key === t.key
                ? "border-ink text-ink"
                : "border-transparent text-ink-soft hover:text-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul
        id={`panel-${current.key}`}
        role="tabpanel"
        aria-labelledby={`tab-${current.key}`}
        className="mt-2"
      >
        {current.tips.map((t, i) => (
          <TipRow key={i} tip={t} accent={current.accent} />
        ))}
      </ul>
    </div>
  );
}
