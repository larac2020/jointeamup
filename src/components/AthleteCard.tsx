import { Link } from "@tanstack/react-router";
import { Loader2, MapPin, MessageSquare } from "lucide-react";
import { fallbackAvatar, type ProfilePublic } from "@/lib/types";
import { categoryText } from "@/lib/athlete-directory";

export function AthleteCard({ athlete, onMessage, pending }: { athlete: ProfilePublic; onMessage: () => void; pending?: boolean }) {
  const photo = athlete.avatar_url ?? athlete.photos[0] ?? fallbackAvatar(athlete.id);
  const level = [...athlete.divisions, ...(athlete.experience ? [athlete.experience] : [])];
  const category = categoryText(athlete.compete_category);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <Link to="/profile/$id" params={{ id: athlete.id }} className="group block flex-1" aria-label={`Open ${athlete.first_name}'s profile`}>
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img src={photo} alt={athlete.first_name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
        </div>
        <div className="space-y-2 p-4">
          <div>
            <h3 className="font-display text-2xl leading-none tracking-wide">{athlete.first_name}</h3>
            {athlete.lives_in && <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {athlete.lives_in}</p>}
          </div>
          {athlete.sports.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {athlete.sports.slice(0, 4).map((s) => <span key={s} className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">{s}</span>)}
            </div>
          )}
          {(level.length > 0 || category) && (
            <p className="text-xs font-semibold text-foreground/80">{[category, ...level].filter(Boolean).join(" · ")}</p>
          )}
          {athlete.strengths.length > 0 && <p className="text-xs text-muted-foreground">Strengths: {athlete.strengths.slice(0, 3).join(", ")}</p>}
          {athlete.available_for && <p className="text-xs text-muted-foreground">Available for: <span className="font-semibold text-foreground">{athlete.available_for}</span></p>}
        </div>
      </Link>
      <div className="p-4 pt-0">
        <button onClick={onMessage} disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />} Message
        </button>
      </div>
    </article>
  );
}
