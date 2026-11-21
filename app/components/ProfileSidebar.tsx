import type {
  CommuteMode,
  CookingFuel,
  ExerciseHabit,
  HouseholdTag,
  Profile,
} from "@/lib/types";

const HOUSEHOLD_OPTIONS: { tag: HouseholdTag; label: string }[] = [
  { tag: "young_kids", label: "Young kids" },
  { tag: "elderly", label: "Elderly" },
  { tag: "respiratory", label: "Asthma / respiratory" },
  { tag: "pregnant", label: "Pregnant" },
];

const COMMUTE_OPTIONS: { value: CommuteMode; label: string }[] = [
  { value: "car", label: "Car / bike" },
  { value: "transit", label: "Public transit" },
  { value: "walk_cycle", label: "Walk or cycle" },
  { value: "wfh", label: "Work from home" },
];

const EXERCISE_OPTIONS: { value: ExerciseHabit; label: string }[] = [
  { value: "morning", label: "Outdoors, mornings" },
  { value: "evening", label: "Outdoors, evenings" },
  { value: "none", label: "Not outdoors" },
];

const COOKING_OPTIONS: { value: CookingFuel; label: string }[] = [
  { value: "lpg", label: "LPG / gas" },
  { value: "biomass", label: "Wood / biomass" },
  { value: "electric", label: "Electric / induction" },
];

const field = "mb-5";
const label = "mb-1.5 block text-xs font-semibold text-ink-soft";
const selectCls =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-jade";
const inputCls =
  "w-full border-0 border-b border-line bg-transparent pb-1 text-lg font-semibold text-ink outline-none placeholder:text-ink-soft/50 focus:border-jade";

export default function ProfileSidebar({
  profile,
  onChange,
  loading,
  updatedAt,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  loading: boolean;
  updatedAt: string | null;
}) {
  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    onChange({ ...profile, [key]: value });
  }

  function toggleHousehold(tag: HouseholdTag) {
    const next = profile.household.includes(tag)
      ? profile.household.filter((t) => t !== tag)
      : [...profile.household.filter((t) => t !== "none"), tag];
    set("household", next.length ? next : ["none"]);
  }

  const updated = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(undefined, { timeStyle: "short" })
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5">
        <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-jade" aria-hidden="true" />
        <p className="text-3xl font-black tracking-tight text-ink">airmitra</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Your household&apos;s live smog dashboard.
      </p>

      <div className="mt-7">
        <div className={field}>
          <label className={label} htmlFor="city">
            City
          </label>
          <input
            id="city"
            value={profile.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Delhi, Mumbai, Beijing…"
            className={inputCls}
          />
        </div>

        <fieldset className={field + " border-0 p-0 m-0"}>
          <legend className={label}>Household</legend>
          <div className="flex flex-wrap gap-1.5">
            {HOUSEHOLD_OPTIONS.map((o) => {
              const active = profile.household.includes(o.tag);
              return (
                <button
                  type="button"
                  key={o.tag}
                  onClick={() => toggleHousehold(o.tag)}
                  aria-pressed={active}
                  className={
                    "rounded-full border px-3 py-1 text-xs font-medium transition " +
                    (active
                      ? "border-jade bg-jade-soft text-jade"
                      : "border-line text-ink-soft hover:border-ink-soft")
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className={field}>
          <label className={label} htmlFor="commute">
            Commute
          </label>
          <select
            id="commute"
            value={profile.commute}
            onChange={(e) => set("commute", e.target.value as CommuteMode)}
            className={selectCls}
          >
            {COMMUTE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
            <input
              type="number"
              min={0}
              max={200}
              value={profile.commuteKm}
              onChange={(e) =>
                set("commuteKm", Number.isFinite(parseFloat(e.target.value)) ? parseFloat(e.target.value) : 0)
              }
              className="w-16 rounded-md border border-line bg-paper px-2 py-1.5 text-ink outline-none focus:border-jade"
            />
            km one-way
          </label>
        </div>

        <div className={field}>
          <label className={label} htmlFor="exercise">
            Outdoor exercise
          </label>
          <select
            id="exercise"
            value={profile.exercise}
            onChange={(e) => set("exercise", e.target.value as ExerciseHabit)}
            className={selectCls}
          >
            {EXERCISE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={field + " mb-0"}>
          <label className={label} htmlFor="cooking">
            Cooking fuel
          </label>
          <select
            id="cooking"
            value={profile.cooking}
            onChange={(e) => set("cooking", e.target.value as CookingFuel)}
            className={selectCls}
          >
            {COOKING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-8 text-xs text-ink-soft">
        <span
          className={
            "h-1.5 w-1.5 rounded-full " +
            (loading ? "bg-marigold animate-pulse" : "bg-jade")
          }
        />
        {loading ? "Reading today's air…" : updated ? `Updated ${updated}` : "Waiting for a city"}
      </div>
    </div>
  );
}
