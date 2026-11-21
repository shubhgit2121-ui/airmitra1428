# AirMitra — Dashboard UI Redesign Plan

## Intent

AirMitra currently reads as a single scrolling article: profile form, then
AQI panel, impact meter, plan, chat — stacked top to bottom, one thing
revealed at a time. For the hackathon, UI is the main thing being judged,
so we're rebuilding the results experience as a **persistent dashboard**:
a live, glanceable "cockpit" view that updates as the household profile
changes, instead of a one-shot wizard.

## Goals

- Read as an app/dashboard, not a landing page or document.
- Profile is a **permanent, editable sidebar panel** — changing city,
  household, commute, exercise, or cooking fuel live-updates the rest of
  the dashboard (debounced re-fetch), no "start over" button.
- Put currently-unused WAQI data to work: per-pollutant breakdown
  (PM10, O₃, NO₂, SO₂, CO) and the multi-day forecast, as small charts.
- Keep the existing earthy/muted color system and Archivo type — it's
  already a deliberate, non-templated palette (see `lib/ui.ts`). We are
  restructuring layout and density, not re-skinning with a generic
  dark/neon "tech dashboard" look.
- Chat becomes a docked panel, always reachable, not the last thing you
  scroll to.

## Non-goals / anti-goals

- No auth, no persistence/database, no multi-user accounts.
- No historical trend data beyond what WAQI's own forecast endpoint gives us.
- No dark mode toggle for v1 (single light theme, already defined).
- Not a generic admin-template look (no stock shadcn dashboard clichés,
  no purple gradients) — the palette and type already have a point of view;
  the redesign should extend it, not replace it.
- Don't over-engineer state management (no Redux/Zustand) — profile state
  and derived dashboard data stay in React state in the page component or
  a small context, nothing heavier.

## Structure: persistent dashboard shell

```
┌─────────────┬───────────────────────────────────────────┐
│             │  AQI hero (big number, category, trend)   │
│  Profile    ├───────────────────┬───────────────────────┤
│  sidebar    │ Pollutant          │ Forecast               │
│  (editable) │ breakdown chart    │ mini chart (pm2.5)     │
│             ├───────────────────┴───────────────────────┤
│  city       │  Impact stat tiles (cigarettes / CO₂)      │
│  household  ├─────────────────────────────────────────────┤
│  commute    │  Plan (routines / indoor / sustainable —    │
│  exercise   │  tabs or accordion, not one long list)      │
│  cooking    │                                             │
└─────────────┴─────────────────────────────────────────────┘
             [ docked chat panel, bottom-right, collapsible ]
```

- **Desktop (≥1024px):** fixed-width sidebar + CSS grid of cards in main area.
- **Tablet:** sidebar collapses to a top bar with a "edit profile" sheet;
  grid drops to 1–2 columns.
- **Mobile:** sidebar becomes a collapsible top sheet (profile summary +
  "edit" button); cards stack single-column; chat becomes a floating
  action button opening a full-screen sheet.
- Empty state (no profile submitted yet) = sidebar form only, main area
  shows a simple prompt — not the full grid with placeholders.

## Data layer changes

`lib/aqi.ts` currently discards most of the WAQI response. Extend it to
also return:
- Full `iaqi` pollutant set (pm25, pm10, o3, no2, so2, co) — for the
  breakdown chart, not just the dominant one.
- `forecast.daily.pm25` (and `o3` if present) for the next few days —
  for the mini forecast chart.
- Keep the existing shape backward compatible (`AqiData` fields stay);
  add new optional fields rather than breaking `PlanResponse` consumers.

Charting: small inline SVG bar/sparkline components (per the existing
`dataviz` conventions — muted categorical colors pulled from `lib/ui.ts`
tokens, no 3D, no chart-junk), not a new charting library dependency.

## Component changes

| Component | Change |
|---|---|
| `DashboardShell` (new) | Grid layout wrapper: sidebar + main area, responsive breakpoints |
| `ProfileForm` → `ProfileSidebar` | Same fields, restyled as a compact persistent panel; edits debounce (≈500ms) and trigger re-fetch instead of a submit-once button |
| `AqiPanel` → `AqiHeroCard` | Keeps the big-number treatment, adds inline trend indicator |
| `PollutantBreakdownCard` (new) | Small bar chart across available pollutants |
| `ForecastCard` (new) | Small multi-day pm2.5 forecast chart, graceful hide if WAQI has no forecast for that city |
| `ImpactMeter` → `ImpactCard` | Same stats, restyled as tiles to fit the grid |
| `PlanView` → `PlanCard` | Routines / indoor / sustainable become tabs (or accordion on mobile) instead of one long vertical scroll |
| `Chat` → `ChatDock` | Docked panel, collapsible; floating button + sheet on mobile |

Per-card loading/error states (skeleton or spinner scoped to that card)
replace the current full-page spinner/error, since a profile edit should
only re-load the cards that depend on it — not blank the whole screen.

## State & data flow

- Profile state lives in `page.tsx` (or a small `DashboardContext` if
  prop-drilling gets unwieldy once ChatDock also needs profile+aqi).
  Starting point: keep it in `page.tsx`, promote to context only if
  needed once wired up.
- Edits to the sidebar debounce, then re-call `/api/plan`; an in-flight
  request is aborted if a newer edit comes in (AbortController).
- `/api/plan` and `/api/chat` routes are unchanged in contract; only the
  `AqiData` shape gains optional fields.

## Implementation phases

1. **Data layer** — extend `lib/aqi.ts` for full pollutants + forecast.
2. **Shell & layout** — `DashboardShell`, grid/sidebar scaffolding, responsive breakpoints, empty state.
3. **Card restyle** — AqiHeroCard, ImpactCard, PlanCard (tabs/accordion) using existing palette.
4. **New charts** — PollutantBreakdownCard, ForecastCard.
5. **Live-edit wiring** — ProfileSidebar debounce + abort-on-change, per-card loading states.
6. **ChatDock** — docked/collapsible panel, mobile floating-sheet behavior.
7. **Responsive pass + polish** — mobile sheet behavior, focus states, motion/transitions, copy pass.

## Risks

- WAQI forecast data isn't guaranteed for every station/city — ForecastCard
  must hide cleanly rather than show an empty chart.
- Debounced live re-fetch adds WAQI/Groq calls per edit — fine for
  a hackathon demo, but worth a short debounce (500ms+) to avoid hammering
  the free-tier WAQI token and Groq rate limits during a live demo.
