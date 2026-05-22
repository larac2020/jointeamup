import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { AthleteCard } from "@/components/AthleteCard";
import { athletes, competitionTypes, formats, listings, skillLevels } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — TeamUp" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [mode, setMode] = useState<"listings" | "athletes">("listings");
  const [query, setQuery] = useState("");
  const [comp, setComp] = useState("");
  const [format, setFormat] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");

  const filteredListings = useMemo(() => listings.filter((l) =>
    (!query || (l.competition + l.description).toLowerCase().includes(query.toLowerCase())) &&
    (!comp || l.competitionType === comp) &&
    (!format || l.format === format) &&
    (!level || l.skillLevel === level) &&
    (!location || l.location.toLowerCase().includes(location.toLowerCase()))
  ), [query, comp, format, level, location]);

  const filteredAthletes = useMemo(() => athletes.filter((a) =>
    (!query || (a.firstName + (a.nickname ?? "") + a.sports.join(" ")).toLowerCase().includes(query.toLowerCase())) &&
    (!comp || a.sports.some((s) => s.toLowerCase().includes(comp.toLowerCase()))) &&
    (!location || a.livesIn.toLowerCase().includes(location.toLowerCase()))
  ), [query, comp, location]);

  const activeFilters = [comp, format, level, location].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-magenta">Discover</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide">Search</h1>
        <div className="mt-6 flex gap-2 rounded-full bg-muted p-1 w-fit">
          {(["listings", "athletes"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition ${mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>{m}</button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
          <aside className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card h-fit md:sticky md:top-20">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={mode === "listings" ? "HYROX, Berlin…" : "Name, sport"} maxLength={120} className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
            </div>
            <Select label="Competition" value={comp} onChange={setComp} options={competitionTypes} />
            {mode === "listings" && <>
              <Select label="Format" value={format} onChange={setFormat} options={[...formats]} />
              <Select label="Skill level" value={level} onChange={setLevel} options={[...skillLevels]} />
            </>}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or country" maxLength={80} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { setComp(""); setFormat(""); setLevel(""); setLocation(""); }} className="inline-flex items-center gap-1 text-xs font-semibold text-magenta hover:underline">
                <X className="h-3 w-3" /> Clear filters ({activeFilters})
              </button>
            )}
          </aside>
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {mode === "listings" ? filteredListings.length : filteredAthletes.length} results
            </p>
            {mode === "listings" ? (
              <div className="space-y-4">{filteredListings.map((l) => <ListingCard key={l.id} listing={l} />)}</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">{filteredAthletes.map((a) => <AthleteCard key={a.id} athlete={a} />)}</div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40">
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
