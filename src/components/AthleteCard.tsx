import { Link } from "@tanstack/react-router";
import { Sparkles, Skull, MapPin } from "lucide-react";
import { fallbackAvatar, type ProfilePublic } from "@/lib/types";

export function AthleteCard({ athlete }: { athlete: ProfilePublic }) {
  return (
    <Link
      to="/profile/$id"
      params={{ id: athlete.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5"
    >
      <div className="relative h-20 bg-primary" />
      <div className="-mt-10 px-5">
        <img src={athlete.avatar_url ?? fallbackAvatar(athlete.id)} alt={athlete.first_name} className="h-20 w-20 rounded-2xl border-4 border-card bg-muted" />
      </div>
      <div className="px-5 pb-5 pt-3">
        <h3 className="font-display text-2xl tracking-wide">
          {athlete.first_name}{athlete.age ? <span className="text-muted-foreground"> · {athlete.age}</span> : null}
        </h3>
        {athlete.nickname && (
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">"{athlete.nickname}"</p>
        )}
        {athlete.lives_in && (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {athlete.lives_in}
          </p>
        )}

        {athlete.sports.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {athlete.sports.slice(0, 3).map((s) => (
              <span key={s} className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/60 p-2">
            <p className="inline-flex items-center gap-1 font-semibold text-primary"><Sparkles className="h-3 w-3" /> Superpower</p>
            <p className="mt-0.5 truncate font-medium">{athlete.superpower ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-2">
            <p className="inline-flex items-center gap-1 font-semibold text-secondary"><Skull className="h-3 w-3" /> Kryptonite</p>
            <p className="mt-0.5 truncate font-medium">{athlete.kryptonite ?? "—"}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
