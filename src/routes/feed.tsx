import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { SearchTabs } from "@/components/SearchTabs";
import { listListings } from "@/lib/listings.functions";
import { competitionTypes, type Format, type Gender } from "@/lib/types";

import { sportFields } from "@/lib/listing-sports";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Search competitions \u2014 TeamUp" }, { name: "description", content: "Browse upcoming competition listings and find athletes by competition, format, division and location." }, { property: "og:title", content: "Search competitions \u2014 TeamUp" }, { property: "og:description", content: "Browse upcoming competition listings and find athletes by competition, format, division and location." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Feed,
});

const shortcuts = [
  { id: "all", label: "All" },
  { id: "selling-ticket", label: "Tickets" },
  { id: "need-teammate", label: "Teams recruiting" },
  { id: "join-team", label: "Looking for a team" },
] as const;

type Shortcut = (typeof shortcuts)[number]["id"];

function Feed() {
  const [shortcut, setShortcut] = useState<Shortcut>("all");
  const [query, setQuery] = useState("");
  const [comp, setComp] = useState("");
  const [sportFilters, setSportFilters] = useState({ format: "", gender: "", skill_level: "" });
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const typeFilter = shortcut === "all" ? undefined : shortcut;

  const listingFilters = useMemo(
    () => ({
      query: query || undefined,
      type: typeFilter as any,
      competition_type: comp || undefined,
      format: (sportFilters.format || undefined) as Format | undefined,
      skill_level: sportFilters.skill_level || undefined,
      gender: (sportFilters.gender || undefined) as Gender | undefined,
      location: location || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [query, typeFilter, comp, sportFilters, location, dateFrom, dateTo],
  );

  const listingsQ = useQuery({
    queryKey: ["listings", "feed", listingFilters],
    queryFn: () => listListings({ data: listingFilters }),
  });

  const listings = listingsQ.data ?? [];
  const activeFilters = [comp, ...Object.values(sportFilters), location, query, dateFrom, dateTo].filter(Boolean).length;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Search</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">What's open</h1>
            <div className="mt-5"><SearchTabs active="competitions" /></div>
          </div>
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
          {/* Filters: always shown on mobile, collapsible on desktop */}
          <aside className="h-fit md:sticky md:top-20">
            {!sidebarOpen && (
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
            <div className={`block ${sidebarOpen ? "md:block" : "md:hidden"} space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filters</p>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Collapse filters"
                  className="hidden md:grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="HYROX, Berlin…"
                  maxLength={120}
                  className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <Select label="Competition" value={comp} onChange={(v) => { setComp(v); setSportFilters({ format: "", gender: "", skill_level: "" }); }} options={[...competitionTypes]} />
                {comp && sportFields(comp, sportFilters.format).map((field) => (
                  <Select key={field.key} label={field.label} value={sportFilters[field.key]}
                    onChange={(value) => setSportFilters((current) => ({ ...current, [field.key]: value,
                      ...(field.key === "format" && value === "Relay" ? { skill_level: current.skill_level === "Pro" ? "" : current.skill_level } : {}) }))}
                    options={field.options} />
                ))}
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
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event date</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      aria-label="From"
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 ring-ring/40"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      aria-label="To"
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 ring-ring/40"
                    />
                  </div>
                </div>
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setQuery(""); setComp(""); setSportFilters({ format: "", gender: "", skill_level: "" }); setLocation(""); setDateFrom(""); setDateTo(""); }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <X className="h-3 w-3" /> Clear filters ({activeFilters})
                </button>
              )}
            </div>
          </aside>

          {/* Results */}
          <section>
            <p className="mb-3 text-xs font-bold tracking-wider text-muted-foreground">
              {listingsQ.isLoading ? "Loading…" : `${listings.length} ${listings.length === 1 ? "result" : "results"}`}
            </p>
            <div className="space-y-4">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
              {listings.length === 0 && !listingsQ.isLoading && <EmptyState />}
            </div>
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
      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[] }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40">
        <option value="">Any</option>
        {options.map((o) => { const option = typeof o === "string" ? { value: o, label: o } : o; return <option key={option.value} value={option.value}>{option.label}</option>; })}
      </select>
    </div>
  );
}
