import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { eventEnd } from "@/lib/event-dates";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { getMyListing, updateListing } from "@/lib/listings.functions";
import { competitionTypes, type Format, type Gender } from "@/lib/types";
import { ListingSportFields } from "@/components/ListingSportFields";
import { defaultSportValues, spotsLabel } from "@/lib/listing-sports";
import { Button } from "@/components/ui/button";
import { CompetitionPicker } from "@/components/CompetitionPicker";
import type { CompetitionOption } from "@/lib/competitions.functions";

export const Route = createFileRoute("/_authenticated/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Edit listing — TeamUp" }, { name: "description", content: "Update your TeamUp competition listing." }, { property: "og:title", content: "Edit listing — TeamUp" }, { property: "og:description", content: "Update your TeamUp competition listing." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const { session, user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updateFn = useServerFn(updateListing);

  const { data: listing } = useQuery({
    queryKey: ["listings", id],
    queryFn: () => getMyListing({ data: { id } }),
  });

  const [comp, setComp] = useState<CompetitionOption | null>(null);
  const [compErr, setCompErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "selling-ticket" as "selling-ticket" | "need-teammate" | "join-team",
    competition: "",
    competition_type: "HYROX",
    event_date: "",
    race_day: "",
    location: "",
    format: "Individual" as Format,
    skill_level: "Open" as string,
    gender: "Open" as Gender,
    spots: 1,
    description: "",
  });

  useEffect(() => {
    if (!listing) return;
    setComp(listing.competition_id ? { id: listing.competition_id, name: listing.competition, city: listing.location, event_date: listing.event_date, end_date: listing.end_date ?? listing.event_date, listing_count: 0 } : null);
    setForm({
      type: listing.type,
      competition: listing.competition,
      competition_type: listing.competition_type,
      event_date: listing.event_date,
      race_day: listing.race_day ?? "",
      location: listing.location,
      format: listing.format,
      skill_level: listing.skill_level,
      gender: (listing.gender ?? "Open") as Gender,
      spots: listing.spots,
      description: listing.description,
    });
  }, [listing]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!comp) throw new Error("Pick an event or add a new one.");
      return updateFn({ data: { id, ...form, competition_id: comp.id, competition: comp.name, event_date: comp.event_date, location: comp.city ?? "", race_day: comp.end_date > comp.event_date ? form.race_day || null : null } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing updated");
      navigate({ to: "/listings/$id", params: { id } });
    },
    onError: (e: any) => toast.error("Couldn't save", { description: e?.message }),
  });

  if (loading || !session || !listing) {
    return <div className="min-h-screen bg-background"><Header /><div className="p-10 text-center text-sm text-muted-foreground">Loading…</div></div>;
  }
  if (user?.id !== listing.author_id) {
    return <div className="min-h-screen bg-background"><Header /><div className="p-10 text-center"><h1 className="font-display text-4xl">Not your listing</h1></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/listings/$id" params={{ id }} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to listing
        </Link>
        <h1 className="mt-3 font-display text-5xl tracking-wide">Edit listing</h1>

        <form
          onSubmit={(e) => { e.preventDefault(); if (!comp) { setCompErr("Pick an event or add a new one."); return; } mutation.mutate(); }}
          className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <Field label="What do you want to do?">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {([
                ["selling-ticket", "Pass on my ticket"],
                ["need-teammate", "Find teammates for my team"],
                ["join-team", "Join a team"],
              ] as const).map(([v, l]) => (
                <Button variant="outline" key={v} type="button" onClick={() => setForm((f) => ({ ...f, type: v }))}
                  className={`h-auto min-h-12 whitespace-normal rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${form.type === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>
                  {l}
                </Button>
              ))}
            </div>
          </Field>

          <p className="text-xs text-muted-foreground">Have a team but missing people? Choose Find teammates for my team.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Competition type">
              <select
                value={form.competition_type}
                onChange={(e) => {
                  const ct = e.target.value;
                  setForm((f) => ({ ...f, competition_type: ct, competition: "", race_day: "", ...defaultSportValues(ct) }));
                  setComp(null);
                }}
                className={inputCls}
              >
                {competitionTypes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Competition name">
              <CompetitionPicker
                competitionType={form.competition_type}
                value={comp}
                onChange={(c) => { setComp(c); setCompErr(null); setForm((f) => ({ ...f, race_day: "" })); }}
                inputClassName={inputCls}
              />
              {compErr && <p className="mt-1 text-xs font-medium text-destructive">{compErr}</p>}
            </Field>
          </div>

          {comp && eventEnd(comp) > comp.event_date && (
            <Field label="Race day (optional)">
              <input aria-label="Race day (optional)" type="date" min={comp.event_date} max={eventEnd(comp)} value={form.race_day} onChange={(e) => setForm((f) => ({ ...f, race_day: e.target.value }))} className={inputCls} />
            </Field>
          )}

          <ListingSportFields sport={form.competition_type} value={form}
            onChange={(values) => setForm((current) => ({ ...current, ...values, gender: values.gender ?? "Open" }))} inputClassName={inputCls} />
          <Field label={spotsLabel(form.type)}>
            <input type="number" min={1} max={20} value={form.spots} onChange={(e) => setForm({ ...form, spots: Number(e.target.value) })} className={inputCls} />
          </Field>

          <Field label="Other info (optional)">
            <textarea placeholder="e.g. we train Tuesdays, need a strong runner, team name" maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </Field>

          <Button type="submit" disabled={mutation.isPending} className="h-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-60">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </form>
      </main>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 ring-ring/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
