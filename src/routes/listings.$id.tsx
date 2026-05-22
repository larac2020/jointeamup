import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Calendar, MapPin, MessageSquare, Share2, Shield, Users, Loader2, Pencil, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { getListing, deactivateListing, reactivateListing } from "@/lib/listings.functions";
import { startConversationFromListing } from "@/lib/messages.functions";
import { listingTypeMeta, fallbackAvatar } from "@/lib/types";
import { useAuth } from "@/lib/auth";

const detailQO = (id: string) =>
  queryOptions({
    queryKey: ["listings", id],
    queryFn: () => getListing({ data: { id } }),
  });

export const Route = createFileRoute("/listings/$id")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(detailQO(params.id)),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: listing } = useSuspenseQuery(detailQO(id));
  const startFn = useServerFn(startConversationFromListing);
  const startMut = useMutation({
    mutationFn: () => startFn({ data: { listing_id: id } }),
    onSuccess: ({ conversation_id }) => {
      navigate({ to: "/messages", search: { c: conversation_id } });
    },
    onError: (e: any) => toast.error("Couldn't start conversation", { description: e?.message }),
  });

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-5xl">Listing not found</h1>
          <Link to="/feed" className="mt-4 inline-block text-sm font-semibold text-primary underline">Back to feed</Link>
        </div>
      </div>
    );
  }
  const author = listing.author;
  const meta = listingTypeMeta[listing.type];

  const onMessage = () => {
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    startMut.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to feed
        </Link>
        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="bg-primary p-8 text-primary-foreground">
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">{meta.label}</span>
            <h1 className="mt-4 font-display text-6xl leading-none tracking-wide">{listing.competition}</h1>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {listing.event_date}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {listing.location}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {listing.format}</span>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Type" value={listing.competition_type} />
              <Stat label="Level" value={listing.skill_level} />
              <Stat label="Spots" value={String(listing.spots)} />
              <Stat label="Category" value={listing.gender ?? "Open"} />
            </div>
            <h2 className="mt-8 font-display text-2xl tracking-wide">Details</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{listing.description}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              TeamUp connects athletes — payments happen directly between you and the seller.
            </div>
          </div>
          {author && (
            <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/30 p-6">
              <Link to="/profile/$id" params={{ id: author.id }} className="flex items-center gap-3 group">
                <img src={author.avatar_url ?? fallbackAvatar(author.id)} alt={author.first_name} className="h-14 w-14 rounded-xl bg-muted" />
                <div>
                  <p className="font-display text-xl tracking-wide group-hover:text-primary">{author.first_name}{author.nickname && ` "${author.nickname}"`}</p>
                  <p className="text-xs text-muted-foreground">{author.lives_in ?? "—"} · {author.sports.slice(0,2).join(" · ")}</p>
                </div>
              </Link>
              <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-accent">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        {author && (
          <div className="sticky bottom-4 mt-6">
            <button
              onClick={onMessage}
              disabled={startMut.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-60"
            >
              {startMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
              Message {author.first_name}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-xl tracking-wide">{value}</p>
    </div>
  );
}
