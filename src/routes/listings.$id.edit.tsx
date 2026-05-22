import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { getListing, updateListing } from "@/lib/listings.functions";
import { competitionTypes, formats, genders, getSkillLevels } from "@/lib/types";
import { CompetitionPicker } from "@/components/CompetitionPicker";

export const Route = createFileRoute("/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Edit listing — TeamUp" }] }),
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
    queryFn: () => getListing({ data: { id } }),
  });

  const [form, setForm] = useState({
    type: "selling-ticket" as "selling-ticket" | "need-teammate" | "join-team",
    competition: "",
    competition_type: "HYROX",
    event_date: "",
    location: "",
    format: "Individual" as (typeof formats)[number],
    skill_level: "Open" as string,
    gender: "Open" as (typeof genders)[number],
    spots: 1,
    description: "",
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!listing) return;
    setForm({
      type: listing.type,
      competition: listing.competition,
      competition_type: listing.competition_type,
      event_date: listing.event_date,
      location: listing.location,
      format: listing.format,
      skill_level: listing.skill_level,
      gender: (listing.gender ?? "Open") as (typeof genders)[number],
      spots: listing.spots,
      description: listing.description,
    });
  }, [listing]);

  const mutation = useMutation({
    mutationFn: () => updateFn({ data: { id, ...form } }),
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
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
          className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <Field label="Listing type">
            <div className="grid grid-cols-3 gap-2">
              {([
                ["selling-ticket", "Ticket"],
                ["need-teammate", "Teammate"],
                ["join-team", "Join team"],
              ] as const).map(([v, l]) => (
                <button key={v} type="button" onClick={() => setForm((f) => ({ ...f, type: v }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${form.type === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Competition type">
              <select
                value={form.competition_type}
                onChange={(e) => {
                  const ct = e.target.value;
                  const levels = getSkillLevels(ct);
                  setForm((f) => ({ ...f, competition_type: ct, competition: "", skill_level: levels.includes(f.skill_level) ? f.skill_level : levels[0] }));
                }}
                className={inputCls}
              >
                {competitionTypes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Competition name">
              <CompetitionPicker
                competitionType={form.competition_type}
                value={form.competition}
                onChange={(v) => setForm((f) => ({ ...f, competition: v }))}
                inputClassName={inputCls}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <input required type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Location">
              <input required minLength={2} maxLength={120} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Format">
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as any })} className={inputCls}>
                {formats.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Skill level">
              <select value={form.skill_level} onChange={(e) => setForm({ ...form, skill_level: e.target.value })} className={inputCls}>
                {getSkillLevels(form.competition_type).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })} className={inputCls}>
                {genders.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Spots available">
              <input type="number" min={1} max={20} value={form.spots} onChange={(e) => setForm({ ...form, spots: Number(e.target.value) })} className={inputCls} />
            </Field>
          </div>

          <Field label="Description">
            <textarea required minLength={10} maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </Field>

          <button type="submit" disabled={mutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-60">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
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
