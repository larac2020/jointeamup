import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { AthleteCard } from "@/components/AthleteCard";
import { listListings } from "@/lib/listings.functions";
import { listProfiles } from "@/lib/profiles.functions";
import { competitionTypes, formats, skillLevels } from "@/lib/types";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Browse — TeamUp" }] }),
  component: Feed,
});

const shortcuts = [
  { id: "all", label: "All" },
  { id: "selling-ticket", label: "Tickets" },
  { id: "need-teammate", label: "Need teammate" },
  { id: "join-team", label: "Join a team" },
] as const;

type Shortcut = (typeof shortcuts)[number]["id"];

function Feed() {
  const [shortcut, setShortcut] = useState<Shortcut>("all");
  const [query, setQuery] = useState("");
  const [comp, setComp] = useState("");
  const [format, setFormat] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mode: "listings" = "listings";
  const typeFilter = shortcut === "all" ? undefined : shortcut;

  const listingFilters = useMemo(
    () => ({
      query: query || undefined,
      type: typeFilter as any,
      competition_type: comp || undefined,
      format: (format || undefined) as any,
      skill_level: (level || undefined) as any,
      location: location || undefined,
    }),
    [query, typeFilter, comp, format, level, location],
  );

  const listingsQ = useQuery({
    queryKey: ["listings", "feed", listingFilters],
    queryFn: () => listListings({ data: listingFilters }),
    enabled: mode === "listings",
  });
  const athletesQ = useQuery({
    queryKey: ["profiles", "feed", { query, sport: comp, location }],
    queryFn: () => listProfiles({ data: { query: query || undefined, sport: comp || undefined, location: location || undefined } }),
    enabled: mode === "athletes",
  });

  const listings = listingsQ.data ?? [];
  const athletes = athletesQ.data ?? [];
  const activeFilters = [comp, format, level, location, query].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Browse</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">What's open</h1>
          </div>
          <Link to="/listings/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95">
            <Plus className="h-4 w-4" /> Post
          </Link>
        </div>

        {/* Shortcut pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {shortcuts.map((t) => {
            const active = shortcut === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setShortcut(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  active ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className={`mt-6 grid gap-4 ${sidebarOpen ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[48px_1fr]"}`}>
          {/* Collapsible sidebar */}
          <aside className="h-fit md:sticky md:top-20">
            {sidebarOpen ? (
              <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filters</p>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Collapse filters"
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === "listings" ? "HYROX, Berlin…" : "Name, sport"}
                    maxLength={120}
                    className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
                  />
                </div>
                <Select label={mode === "athletes" ? "Sport" : "Competition"} value={comp} onChange={setComp} options={[...competitionTypes]} />
                {mode === "listings" && (
                  <>
                    <Select label="Format" value={format} onChange={setFormat} options={[...formats]} />
                    <Select label="Skill level" value={level} onChange={setLevel} options={[...skillLevels]} />
                  </>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or country"
                    maxLength={80}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
                  />
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={() => { setQuery(""); setComp(""); setFormat(""); setLevel(""); setLocation(""); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <X className="h-3 w-3" /> Clear filters ({activeFilters})
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Expand filters"
                className="relative hidden h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-card text-muted-foreground hover:text-foreground md:grid"
              >
                <ChevronRight className="h-4 w-4" />
                {activeFilters > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {activeFilters}
                  </span>
                )}
              </button>
            )}
          </aside>

          {/* Results */}
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {mode === "listings"
                ? listingsQ.isLoading ? "Loading…" : `${listings.length} results`
                : athletesQ.isLoading ? "Loading…" : `${athletes.length} results`}
            </p>
            {mode === "listings" ? (
              <div className="space-y-4">
                {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
                {listings.length === 0 && !listingsQ.isLoading && (
                  <EmptyState />
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {athletes.map((a) => <AthleteCard key={a.id} athlete={a} />)}
                {athletes.length === 0 && !athletesQ.isLoading && <EmptyState />}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-display text-2xl">Nothing matches</p>
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or post the first listing.</p>
      <Link to="/listings/new" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
        <Plus className="h-4 w-4" /> Post a listing
      </Link>
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
