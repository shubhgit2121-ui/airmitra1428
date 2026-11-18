# AirMitra — Winter Smog Coach · Design Doc

_Date: 2026-11-17 · Hackathon: GenAI assistant for winter smog & urban air pollution_

## Intent & why
Families know winter smog is dangerous but don't know what to *actually do today* for their
specific household. AirMitra turns overwhelming air-quality data into a personalized, explained,
daily action plan — and makes the impact of each choice human and visible. It's a *proactive coach*,
not a Q&A chatbot.

## Goals
- Take a user's **city + household profile + daily habits** and produce a tailored **"Today's Smog Plan."**
- Cover all 4 challenge pillars: low-emission routines, indoor air-quality hacks, sustainable alternatives, and a clear **impact explanation**.
- Use **live AQI data** (real, not mocked) so the advice is grounded and the demo is credible.
- Translate pollution into human terms (cigarettes-equivalent exposure, kg CO₂ saved).
- Ship as a **single deployed public app** with GenAI usage clearly visible.

## Non-goals (MVP)
Accounts/login, historical charts & forecasts, maps, native mobile app, payments, multi-language.

## Anti-goals (would mean failure even if it "works")
- Becoming a generic chatbot where GenAI's role is invisible.
- Hardcoded/fake AQI — kills credibility with judges.
- Over-scoping so deployment or the demo video never gets done.

## Constraints (from submission rules)
- Public GitHub repo **< 10 MB** → never commit `node_modules`; keep assets tiny.
- **Deployed public URL is mandatory and graded.**
- Deliverables: repo, deployed link, demo video, "changes" text, **"where is GenAI used" text**, LinkedIn post.
- Deadline **2026-11-29 10:29 IST**; ≤ 3 submissions.

## Approaches considered
- **A) Pure conversational chatbot.** Rejected — every team builds this; GenAI feels like a wrapper; impact framing is weak.
- **B) Proactive "Today's Plan" generator + follow-up chat.** ✅ **Chosen.** Structured, personalized, shows GenAI reasoning over live data, memorable impact UI. Buildable in time.
- **C) Full analytics dashboard (history, forecasts, maps).** Rejected — data-heavy, deployment-heavy, dilutes the GenAI story.

## How it's built (my calls — correct me if any is wrong)
- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS → one repo, one deploy, one URL.
- **AI:** **Azure OpenAI** (GPT-4o) via the official `openai` npm SDK's `AzureOpenAI` client (org-provided, likely free). Uses **function-calling**: the model calls `get_air_quality(city)`, gets live data back, then reasons. Needs 4 env values: endpoint, deployment name, API key, API version.
- **Air-quality data:** WAQI API (aqicn.org, free token), by city. Returns AQI, category, dominant pollutant, PM2.5.
- **Backend:** Next.js route handlers (`/api/*`) hold `AZURE_OPENAI_*` + `WAQI_TOKEN` server-side.
- **Deploy:** Vercel, env vars set in dashboard.

## Features (MVP)
1. **Onboarding form** — city; household members (kids, elderly, respiratory/asthma, pregnant, outdoor worker); daily habits (commute mode, outdoor exercise, cooking fuel).
2. **Live AQI panel** — current AQI, category, PM2.5, dominant pollutant for the city.
3. **Today's Smog Plan** — Claude returns structured JSON → rendered as color-coded cards grouped by the 4 pillars. Each card = **action + why + impact**.
4. **Impact translator** — cumulative meter: "today's air ≈ N cigarettes for your child," "your swaps save X kg CO₂."
5. **Follow-up chat** — ask questions; Claude answers with the household + AQI context in memory.

## Impact math (documented heuristics)
- PM2.5 → cigarettes: ~22 µg/m³ over 24h ≈ 1 cigarette (Berkeley Earth rule of thumb).
- Transport CO₂: car ≈ 0.17 kg/km; public transit per-passenger ≈ near-zero marginal. Cited in README.

## Left to the builder
Exact card copy and prompt wording, color palette, form field defaults, and graceful fallback when a city has no WAQI station (nearest-station or ask for a bigger city).

## Stretch (only if time allows)
Geolocation auto-detect city; Hindi toggle; shareable plan image.
