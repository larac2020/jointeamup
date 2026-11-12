import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Loader2, Plus, Search, X } from "lucide-react";
import {
  createCompetition,
  findCompetitionMatches,
  listCompetitions,
  type CompetitionOption,
} from "@/lib/competitions.functions";

type Props = {
  competitionType: string;
  value: CompetitionOption | null;
  onChange: (val: CompetitionOption | null) => void;
  inputClassName?: string;
};

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function OptionLine({ c }: { c: CompetitionOption }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate font-semibold">{c.name}</span>
      <span className="text-[11px] text-muted-foreground">
        {[c.city, fmtDate(c.event_date)].filter(Boolean).join(" · ")} · {c.listing_count} listing{c.listing_count === 1 ? "" : "s"}
      </span>
    </span>
  );
}

export function CompetitionPicker({ competitionType, value, onChange, inputClassName }: Props) {
  const listFn = useServerFn(listCompetitions);
  const matchFn = useServerFn(findCompetitionMatches);
  const createFn = useServerFn(createCompetition);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", city: "", event_date: "" });
  const [matches, setMatches] = useState<CompetitionOption[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: comps, isLoading } = useQuery({
    queryKey: ["competitions", competitionType, search.trim()],
    queryFn: () => listFn({ data: { competition_type: competitionType, q: search.trim() } }),
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const startCreate = () => {
    setDraft({ name: search.trim(), city: "", event_date: "" });
    setMatches(null);
    setErr(null);
    setCreating(true);
    setOpen(false);
  };

  const doCreate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const row = await createFn({ data: { competition_type: competitionType, ...draft } });
      qc.invalidateQueries({ queryKey: ["competitions", competitionType] });
      onChange(row);
      setCreating(false);
      setMatches(null);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't create event");
    } finally {
      setBusy(false);
    }
  };

  const checkAndCreate = async () => {
    if (draft.name.trim().length < 2 || draft.city.trim().length < 2 || !draft.event_date) {
      setErr("Add the event name, city and date.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const found = await matchFn({ data: { competition_type: competitionType, ...draft } });
      if (found.length) {
        setMatches(found);
        setBusy(false);
        return;
      }
    } catch {
      // matching is best-effort; fall through to create
    }
    setBusy(false);
    await doCreate();
  };

  if (value) {
    return (
      <div className={`${inputClassName} flex items-center justify-between gap-2`}>
        <OptionLine c={value} />
        <button type="button" aria-label="Change event" onClick={() => onChange(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-background p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New {competitionType} event</p>
        <input aria-label="Event name" value={draft.name} onChange={(e) => { setDraft({ ...draft, name: e.target.value }); setMatches(null); }} placeholder="Event name, e.g. HYROX Berlin" className={inputClassName} />
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Event city" value={draft.city} onChange={(e) => { setDraft({ ...draft, city: e.target.value }); setMatches(null); }} placeholder="City" className={inputClassName} />
          <input aria-label="Event date" type="date" min={new Date().toISOString().slice(0, 10)} value={draft.event_date} onChange={(e) => { setDraft({ ...draft, event_date: e.target.value }); setMatches(null); }} className={inputClassName} />
        </div>

        {matches && matches.length > 0 && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-2">
            <p className="px-1 pb-1 text-xs font-bold">Did you mean…?</p>
            {matches.map((m) => (
              <button key={m.id} type="button" onClick={() => { onChange(m); setCreating(false); setMatches(null); }} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted">
                <OptionLine c={m} />
                <span className="shrink-0 text-xs font-bold text-primary">Use this</span>
              </button>
            ))}
            <button type="button" disabled={busy} onClick={doCreate} className="mt-1 w-full rounded-md px-2 py-2 text-left text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
              None of these — create “{draft.name.trim()}”
            </button>
          </div>
        )}

        {err && <p className="text-xs font-medium text-destructive">{err}</p>}

        <div className="flex items-center gap-3">
          {!(matches && matches.length) && (
            <button type="button" disabled={busy} onClick={checkAndCreate} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-60">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create event
            </button>
          )}
          <button type="button" onClick={() => { setCreating(false); setMatches(null); }} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={`${inputClassName} flex items-center justify-between text-left`}>
        <span className="text-muted-foreground">Pick a {competitionType} event…</span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>
      <button type="button" onClick={startCreate} className="mt-1.5 text-xs font-semibold text-primary hover:underline">
        Not in the list? Add a new event
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 opacity-60" />
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or city…" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading events…
              </div>
            )}
            {!isLoading && (comps ?? []).length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">No upcoming events yet — add one below.</div>
            )}
            {(comps ?? []).map((c) => (
              <button key={c.id} type="button" onClick={() => { onChange(c); setOpen(false); setSearch(""); }} className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted">
                <OptionLine c={c} />
              </button>
            ))}
            <button type="button" onClick={startCreate} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm font-semibold text-primary hover:bg-muted">
              <Plus className="h-4 w-4" /> Add a new event{search.trim() ? ` “${search.trim()}”` : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
