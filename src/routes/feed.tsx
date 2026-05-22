import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { listings, listingTypeMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/feed")({
  head: () => ({ meta: [{ title: "Listings feed — TeamUp" }] }),
  component: Feed,
});

const tabs = [
  { id: "all", label: "All" },
  { id: "selling-ticket", label: "Tickets" },
  { id: "need-teammate", label: "Need teammate" },
  { id: "join-team", label: "Join a team" },
] as const;

function Feed() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  const filtered = tab === "all" ? listings : listings.filter((l) => l.type === tab);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-magenta">Live feed</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">What's open</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-warm px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95">
            <Plus className="h-4 w-4" /> Post
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => {
            const count = t.id === "all" ? listings.length : listings.filter((l) => l.type === t.id).length;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  active ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label} <span className="ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
          <Link to="/search" className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            <Filter className="h-3.5 w-3.5" /> Filters
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-display text-2xl">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to post a {listingTypeMeta[tab as keyof typeof listingTypeMeta]?.label.toLowerCase() ?? "listing"}.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
