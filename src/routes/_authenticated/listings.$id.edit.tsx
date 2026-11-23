import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { listCompetitions, type CompetitionOption } from "@/lib/competitions.functions";

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
  const listEventsFn = useServerFn(listCompetitions);

  const { data: listing } = useQuery({
    queryKey: ["listings", id],
    queryFn: () => getMyListing({ data: { id } }),
  });

  const { data: linkedEvents } = useQuery({
    queryKey: ["competitions", "edit", listing?.competition_type, listing?.competition],
    queryFn: () => listEventsFn({ data: { competition_type: listing?.competition_type ?? "HYROX", q: listing?.competition ?? "" } }),
    enabled: !!listing,
  });

  const [comp, setComp] = useState<CompetitionOption | null>(null);
  const [compErr, setCompErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "selling-ticket" as "selling-ticket" | "need-teammate" | "join-team",
    competition: "",
    competition_type: "HYROX",
    event_date: "",
    competition_date: "",
    location: "",
    format: "Individual" as Format,
    skill_level: "Open" as string,
    gender: "Open" as Gender,
    spots: 1,
    description: "",
  });

  useEffect(() => {
    if (!listing) return;
    setForm({
      type: listing.type,
      competition: listing.competition,
      competition_type: listing.competition_type,
      event_date: listing.event_date,
      competition_date: listing.competition_date || listing.event_date,
      location: listing.location,
      format: listing.format,
      skill_level: listing.skill_level,
      gender: (listing.gender ?? "Open") as Gender,
      spots: listing.spots,
      description: listing.description,
    });
  }, [listing]);

  useEffect(() => {
    if (listing) setComp(linkedEvents?.find((event) => event.id === listing.competition_id) ?? null);
  }, [listing, linkedEvents]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!comp) throw new Error("Pick an event or add a new one.");
      return updateFn({ data: { id, ...form, competition_id: comp.id, competition: comp.name, event_date: form.competition_date, location: comp.city ?? "" } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["competitions"] });
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
                  setForm((f) => ({ ...f, competition_type: ct, competition: "", competition_date: "", ...defaultSportValues(ct) }));
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
                onChange={(c) => { setComp(c); setCompErr(null); setForm((f) => ({ ...f, competition_date: c?.event_date ?? "" })); }}
                inputClassName={inputCls}
              />
              {compErr && <p className="mt-1 text-xs font-medium text-destructive">{compErr}</p>}
            </Field>
          </div>

          <Field label="Your competition date">
            <input aria-label="Your competition date" required type="date" min={new Date().toISOString().slice(0, 10)} value={form.competition_date} onChange={(e) => setForm((f) => ({ ...f, competition_date: e.target.value }))} className={inputCls} />
          </Field>

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
