import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { createListing } from "@/lib/listings.functions";
import { competitionTypes, formats, genders, getSkillLevels } from "@/lib/types";
import { CompetitionPicker } from "@/components/CompetitionPicker";

export const Route = createFileRoute("/listings/new")({
  head: () => ({ meta: [{ title: "Post a listing — TeamUp" }] }),
  component: NewListing,
});

function NewListing() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createFn = useServerFn(createListing);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const [form, setForm] = useState({
    type: "selling-ticket" as "selling-ticket" | "need-teammate" | "join-team",
    competition: "",
    competition_type: "HYROX" as string,
    event_date: "",
    location: "",
    format: "Individual" as (typeof formats)[number],
    skill_level: "Open" as string,
    gender: "Open" as (typeof genders)[number],
    spots: 1,
    description: "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => createFn({ data }),
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing posted");
      navigate({ to: "/listings/$id", params: { id } });
    },
    onError: (e: any) => toast.error("Couldn't post listing", { description: e?.message }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
        </Link>
        <h1 className="mt-3 font-display text-5xl tracking-wide">Post a listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell the community what you need or what you're letting go of.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
          className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <Field label="Listing type">
            <div className="grid grid-cols-3 gap-2">
              {([
                ["selling-ticket", "Ticket"],
                ["need-teammate", "Teammate"],
                ["join-team", "Join team"],
              ] as const).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: v }))}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                    form.type === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
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
              <input required minLength={2} maxLength={120} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Berlin, DE" className={inputCls} />
            </Field>
            <Field label="Format">
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as any })} className={inputCls}>
                {formats.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Skill level">
              <select value={form.skill_level} onChange={(e) => setForm({ ...form, skill_level: e.target.value as any })} className={inputCls}>
                {skillLevels.map((s) => <option key={s} value={s}>{s}</option>)}
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
            <textarea required minLength={10} maxLength={2000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A few honest details — level, transfer logistics, what you're looking for." className={inputCls} />
          </Field>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Post listing
          </button>
        </form>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 ring-ring/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
