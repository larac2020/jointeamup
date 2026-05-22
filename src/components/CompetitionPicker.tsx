import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { listCompetitions, suggestCompetition } from "@/lib/competitions.functions";

type Props = {
  competitionType: string;
  value: string;
  onChange: (val: string) => void;
  inputClassName?: string;
};

const OTHER = "__other__";

export function CompetitionPicker({ competitionType, value, onChange, inputClassName }: Props) {
  const listFn = useServerFn(listCompetitions);
  const suggestFn = useServerFn(suggestCompetition);
  const isOther = competitionType === "Other";

  const { data: comps, isLoading } = useQuery({
    queryKey: ["competitions", competitionType],
    queryFn: () => listFn({ data: { competition_type: competitionType } }),
    enabled: !isOther,
    staleTime: 5 * 60 * 1000,
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [otherMode, setOtherMode] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // If switching to Other type, force free-text
  useEffect(() => {
    if (isOther) {
      setOtherMode(true);
    } else {
      setOtherMode(false);
    }
  }, [isOther]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = comps ?? [];
    if (!s) return list.slice(0, 100);
    return list.filter((c) => c.name.toLowerCase().includes(s)).slice(0, 100);
  }, [comps, search]);

  const select = async (name: string) => {
    if (name === OTHER) {
      setOtherMode(true);
      setOpen(false);
      onChange("");
      return;
    }
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  if (otherMode || isOther) {
    return (
      <div className="space-y-2">
        <input
          required
          minLength={2}
          maxLength={200}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={async () => {
            const name = value.trim();
            if (name.length >= 2) {
              try {
                await suggestFn({ data: { competition_type: isOther ? "Other" : competitionType, name } });
              } catch {
                // silent — suggestion is best-effort
              }
            }
          }}
          placeholder="Type the competition name"
          className={inputClassName}
        />
        {!isOther && (
          <button
            type="button"
            onClick={() => {
              setOtherMode(false);
              onChange("");
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            ← Pick from list instead
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClassName} flex items-center justify-between text-left`}
      >
        <span className={value ? "" : "text-muted-foreground"}>
          {value || `Pick a ${competitionType} event…`}
        </span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 opacity-60" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading events…
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">No matches</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => select(c.name)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="truncate">{c.name}</span>
                {c.event_date && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">{c.event_date}</span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => select(OTHER)}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm font-medium hover:bg-muted"
            >
              + Other competition not listed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
