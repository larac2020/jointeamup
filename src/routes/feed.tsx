import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search as SearchIcon, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { listListings } from "@/lib/listings.functions";
import { competitionTypes, getCategories } from "@/lib/types";

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
  const [category, setCategory] = useState(""); // label from getCategories(comp)
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const typeFilter = shortcut === "all" ? undefined : shortcut;

  const categoryTuple = useMemo(() => {
    if (!comp || !category) return null;
    return getCategories(comp).find((c) => c.label === category) ?? null;
  }, [comp, category]);

  const listingFilters = useMemo(
    () => ({
      query: query || undefined,
      type: typeFilter as any,
      competition_type: comp || undefined,
      format: (categoryTuple?.format || undefined) as any,
      skill_level: (categoryTuple?.skill_level || undefined) as any,
      gender: (categoryTuple?.gender || undefined) as any,
      location: location || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [query, typeFilter, comp, categoryTuple, location, dateFrom, dateTo],
  );

  const listingsQ = useQuery({
    queryKey: ["listings", "feed", listingFilters],
    queryFn: () => listListings({ data: listingFilters }),
  });

  const listings = listingsQ.data ?? [];
  const activeFilters = [comp, category, location, query, dateFrom, dateTo].filter(Boolean).length;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Browse</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">What's open</h1>
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
                    placeholder="HYROX, Berlin…"
                    maxLength={120}
                    className="w-full rounded-lg border border-input bg-background px-10 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
                  />
                </div>
                <Select label="Competition" value={comp} onChange={(v) => { setComp(v); setCategory(""); }} options={[...competitionTypes]} />
                {comp && (
                  <Select
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    options={getCategories(comp).map((c) => c.label)}
                  />
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
                    onClick={() => { setQuery(""); setComp(""); setCategory(""); setLocation(""); }}
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
              {listingsQ.isLoading ? "Loading…" : `${listings.length} results`}
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
