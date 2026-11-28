import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { SearchTabs } from "@/components/SearchTabs";
import { AthleteCard } from "@/components/AthleteCard";
import { useAuth } from "@/lib/auth";
import { useMessageAthlete } from "@/hooks/use-message-athlete";
import { listDirectoryAthletes } from "@/lib/profiles.functions";
import { COMPETE_CATEGORIES, DIRECTORY_COMPETITIONS, OPEN_FORMATS, STRENGTHS, TRAVEL_OPTIONS, athleteCount, divisionOptions } from "@/lib/athlete-directory";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  competition: fallback(z.string(), "").default(""),
  format: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
  division: fallback(z.string(), "").default(""),
  location: fallback(z.string(), "").default(""),
  travel: fallback(z.string(), "").default(""),
  strengths: fallback(z.string().array(), []).default([]),
});
type Filters = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/athletes")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Find athletes — TeamUp" }, { name: "description", content: "Find athletes open to teaming up for HYROX, Turf Games, DEKA, CrossFit and more." }, { property: "og:title", content: "Find athletes — TeamUp" }, { property: "og:description", content: "Find athletes open to teaming up for HYROX, Turf Games, DEKA, CrossFit and more." }, { property: "og:url", content: "https://jointeamup.lovable.app/athletes" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Athletes,
});

const pick = <T extends string>(v: string, list: readonly T[]) => (list as readonly string[]).includes(v) ? (v as T) : undefined;

function Athletes() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/athletes" });
  const { user } = useAuth();
  const { message, pending } = useMessageAthlete();
  // Keep shareable URLs short: drop filters left on "Any".
  const set = (patch: Partial<Filters>) => void navigate({
    search: (prev) => Object.fromEntries(Object.entries({ ...prev, ...patch }).filter(([, v]) => Array.isArray(v) ? v.length > 0 : !!v)) as Partial<Filters>,
    replace: true,
  });

  const div = divisionOptions(s.competition);
  const filters = {
    query: s.q.trim().slice(0, 120) || undefined,
    competition: s.competition || undefined,
    format: pick(s.format, OPEN_FORMATS),
    category: pick(s.category, ["Men", "Women"] as const),
    division: div.options.includes(s.division) ? s.division : undefined,
    location: s.location.trim().slice(0, 80) || undefined,
    travel: pick(s.travel, TRAVEL_OPTIONS),
    strengths: s.strengths.filter((x): x is (typeof STRENGTHS)[number] => (STRENGTHS as readonly string[]).includes(x)),
    exclude_id: user?.id,
  };
  const q = useQuery({ queryKey: ["athletes", filters], queryFn: () => listDirectoryAthletes({ data: filters }) });
  const athletes = (q.data ?? []).filter((a) => a.id !== user?.id);
  const active = [s.q, s.competition, s.format, s.category, s.division, s.location, s.travel].filter(Boolean).length + s.strengths.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Search</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide">Find athletes</h1>
        <div className="mt-5"><SearchTabs active="athletes" /></div>

        <div className="mt-6 grid gap-4 md:grid-cols-[280px_1fr]">
          <aside className="h-fit space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card md:sticky md:top-20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filters</p>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input aria-label="Search name or city" value={s.q} onChange={(e) => set({ q: e.target.value })} placeholder="Name or city" maxLength={120}
                className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
            </div>
            <Select label="Competition" value={s.competition} onChange={(v) => set({ competition: v, division: "" })} options={[...DIRECTORY_COMPETITIONS]} />
            <Select label="Format" value={s.format} onChange={(v) => set({ format: v })} options={[...OPEN_FORMATS]} />
            <Select label="Category" value={s.category} onChange={(v) => set({ category: v })} options={COMPETE_CATEGORIES.map((c) => ({ ...c }))} />
            <Select label={div.label} value={div.options.includes(s.division) ? s.division : ""} onChange={(v) => set({ division: v })} options={div.options} />
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City / location</label>
              <input aria-label="City / location" value={s.location} onChange={(e) => set({ location: e.target.value })} placeholder="London" maxLength={80}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
            </div>
            <Select label="Willing to travel" value={s.travel} onChange={(v) => set({ travel: v })} options={[...TRAVEL_OPTIONS]} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strengths</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {STRENGTHS.map((st) => {
                  const on = s.strengths.includes(st);
                  return <button key={st} aria-pressed={on} onClick={() => set({ strengths: on ? s.strengths.filter((x) => x !== st) : [...s.strengths, st] })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${on ? "bg-foreground text-background" : "border border-border bg-background text-muted-foreground hover:text-foreground"}`}>{st}</button>;
                })}
              </div>
            </div>
            {active > 0 && (
              <button onClick={() => void navigate({ search: {}, replace: true })} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <X className="h-3 w-3" /> Clear filters ({active})
              </button>
            )}
          </aside>

          <section>
            <p className="mb-3 text-xs font-bold tracking-wider text-muted-foreground">{q.isLoading ? "Loading…" : athleteCount(athletes.length)}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {athletes.map((a) => <AthleteCard key={a.id} athlete={a} onMessage={() => message(a.id)} pending={pending} />)}
            </div>
            {athletes.length === 0 && !q.isLoading && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <p className="font-display text-2xl">No athletes match</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[] }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40">
        <option value="">Any</option>
        {options.map((o) => { const opt = typeof o === "string" ? { value: o, label: o } : o; return <option key={opt.value} value={opt.value}>{opt.label}</option>; })}
      </select>
    </div>
  );
}
