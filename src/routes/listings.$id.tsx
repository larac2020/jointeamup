import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Calendar, MapPin, MessageSquare, Share2, Users, Loader2, Pencil, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { getListing, getMyListing, deactivateListing, reactivateListing } from "@/lib/listings.functions";
import { startConversationFromListing } from "@/lib/messages.functions";
import { listingTypeMeta, fallbackAvatar, categoryLabel } from "@/lib/types";
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
  const { session, user } = useAuth();
  const qc = useQueryClient();
  const { data: publicListing } = useSuspenseQuery(detailQO(id));
  const getMineFn = useServerFn(getMyListing);
  // Expired or deactivated listings are hidden publicly; the owner can still open them.
  const { data: ownListing, isLoading: ownLoading } = useQuery({
    queryKey: ["listings", id, "mine"],
    queryFn: () => getMineFn({ data: { id } }),
    enabled: !publicListing && !!session,
  });
  const listing = publicListing ?? ownListing ?? null;
  const startFn = useServerFn(startConversationFromListing);
  const deactivateFn = useServerFn(deactivateListing);
  const reactivateFn = useServerFn(reactivateListing);
  const startMut = useMutation({
    mutationFn: () => startFn({ data: { listing_id: id } }),
    onSuccess: ({ conversation_id }) => {
      navigate({ to: "/messages", search: { c: conversation_id } });
    },
    onError: (e: any) => toast.error("Couldn't start conversation", { description: e?.message }),
  });
  const toggleMut = useMutation({
    mutationFn: (active: boolean) =>
      active ? reactivateFn({ data: { id } }) : deactivateFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing updated");
    },
    onError: (e: any) => toast.error("Update failed", { description: e?.message }),
  });

  if (!listing && !!session && ownLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }
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
  const isMine = user?.id === listing.author_id;
  const isExpired = listing.event_date < new Date().toISOString().slice(0, 10);

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
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {categoryLabel(listing, listing.competition_type)}</span>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Sport" value={listing.competition_type} />
              <Stat label="Category" value={categoryLabel(listing, listing.competition_type)} />
              <Stat label="Spots" value={String(listing.spots)} />
            </div>
            <h2 className="mt-8 font-display text-2xl tracking-wide">Details</h2>
            {listing.description && <p className="mt-2 text-sm leading-relaxed text-foreground/85">{listing.description}</p>}
          </div>
          {author && (
            <div className="border-t border-border bg-muted/30 p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Posted by</p>
              <div className="mt-3 flex items-start gap-4">
                <Link to="/profile/$id" params={{ id: author.id }} className="shrink-0">
                  <img src={author.avatar_url ?? fallbackAvatar(author.id)} alt={author.first_name} className="h-16 w-16 rounded-xl bg-muted object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to="/profile/$id" params={{ id: author.id }} className="group inline-flex items-baseline gap-2">
                    <span className="font-display text-2xl tracking-wide group-hover:text-primary">
                      {author.first_name}{author.nickname && ` "${author.nickname}"`}
                    </span>
                    {author.age && <span className="text-sm text-muted-foreground">· {author.age}</span>}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {author.lives_in ?? "—"}
                    {author.experience && ` · ${author.experience}`}
                    {author.sports.length > 0 && ` · ${author.sports.slice(0, 3).join(" · ")}`}
                  </p>
                  {author.bio && (
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/85">{author.bio}</p>
                  )}
                  <Link
                    to="/profile/$id"
                    params={{ id: author.id }}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    View full profile →
                  </Link>
                </div>
                <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-accent">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        {isExpired && (
          <div className="mt-6 rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
            Expired — this event date has passed. Only you can see this listing.
          </div>
        )}
        {!isExpired && !listing.is_active && (
          <div className="mt-6 rounded-2xl border border-warm/40 bg-warm/10 px-4 py-3 text-sm font-semibold text-foreground">
            This listing is deactivated — only you can see it.
          </div>
        )}
        {isMine ? (isExpired ? null : (
          <div className="sticky bottom-4 mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/listings/$id/edit"
              params={{ id }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95"
            >
              <Pencil className="h-4 w-4" /> Edit listing
            </Link>
            <button
              onClick={() => toggleMut.mutate(!listing.is_active)}
              disabled={toggleMut.isPending}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-accent disabled:opacity-60"
            >
              {toggleMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : listing.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {listing.is_active ? "Deactivate" : "Reactivate"}
            </button>
          </div>
        )) : author && !isExpired && listing.is_active && (
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
