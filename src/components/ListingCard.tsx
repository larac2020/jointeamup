import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import { getAthlete, listingTypeMeta, type Listing } from "@/lib/mock-data";

export function ListingCard({ listing }: { listing: Listing }) {
  const author = getAthlete(listing.authorId);
  const meta = listingTypeMeta[listing.type];

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-blaze"
    >
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}>
          {meta.label}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{listing.postedAt}</span>
      </div>

      <div className="px-5 pb-4 pt-3">
        <h3 className="font-display text-3xl leading-none tracking-wide">{listing.competition}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 bg-muted/40 px-5 py-3 text-xs font-medium text-foreground/80">
        <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> {listing.date}</span>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-magenta" /> {listing.location}</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-violet" /> {listing.format} · {listing.skillLevel}</span>
        {listing.gender && <span className="rounded-full bg-background px-2 py-0.5 text-[10px] uppercase tracking-wider">{listing.gender}</span>}
      </div>

      {author && (
        <div className="flex items-center justify-between border-t border-border/70 px-5 py-3">
          <div className="flex items-center gap-2">
            <img src={author.avatar} alt={author.firstName} className="h-8 w-8 rounded-full bg-muted" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{author.firstName}{author.nickname && <span className="text-muted-foreground"> · {author.nickname}</span>}</p>
              <p className="text-xs text-muted-foreground">{author.livesIn}</p>
            </div>
          </div>
          <span className="font-display text-xl text-primary opacity-0 transition group-hover:opacity-100">→</span>
        </div>
      )}
    </Link>
  );
}
