import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, MapPin, Users, Pencil, Eye, EyeOff, RotateCcw, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import {
  listMyListings,
  deactivateListing,
  reactivateListing,
  deleteListing,
} from "@/lib/listings.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { listingTypeMeta, categoryLabel, type ListingRow } from "@/lib/types";

const myListingsQO = queryOptions({
  queryKey: ["listings", "mine"],
  queryFn: () => listMyListings(),
});

export const Route = createFileRoute("/_authenticated/listings/mine")({
  head: () => ({ meta: [{ title: "My listings — TeamUp" }, { name: "description", content: "Manage your TeamUp competition listings." }, { property: "og:title", content: "My listings — TeamUp" }, { property: "og:description", content: "Manage your TeamUp competition listings." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(myListingsQO),
  component: MyListingsPage,
});

type Status = "active" | "expired" | "deactivated";
function statusOf(l: ListingRow): Status {
  const today = new Date().toISOString().slice(0, 10);
  if (l.event_date < today) return "expired";
  if (!l.is_active) return "deactivated";
  return "active";
}

function MyListingsPage() {
  const { data: listings } = useSuspenseQuery(myListingsQO);

  const active = listings.filter((l) => statusOf(l) === "active");
  const past = listings
    .filter((l) => statusOf(l) !== "active")
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-5xl tracking-wide">My listings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage what you've posted.</p>
          </div>
          <Link
            to="/listings/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-warm px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95"
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> Post
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">You haven't posted yet.</p>
            <Link to="/listings/new" className="mt-3 inline-block text-sm font-semibold text-primary underline">
              Post your first listing
            </Link>
          </div>
        ) : (
          <>
            <Section title={`Active (${active.length})`}>
              {active.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active listings.</p>
              ) : (
                active.map((l) => <Row key={l.id} listing={l} status="active" />)
              )}
            </Section>

            {past.length > 0 && (
              <Section title={`Past & inactive (${past.length})`}>
                {past.map((l) => (
                  <Row key={l.id} listing={l} status={statusOf(l)} />
                ))}
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-wide">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ listing, status }: { listing: ListingRow; status: Status }) {
  const qc = useQueryClient();
  const deactivateFn = useServerFn(deactivateListing);
  const reactivateFn = useServerFn(reactivateListing);
  const deleteFn = useServerFn(deleteListing);
  const delMut = useMutation({
    mutationFn: () => deleteFn({ data: { id: listing.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing deleted");
    },
    onError: (e: any) => toast.error("Delete failed", { description: e?.message }),
  });
  const meta = listingTypeMeta[listing.type];
  const dimmed = status !== "active";

  const mut = useMutation({
    mutationFn: (next: "deactivate" | "reactivate") =>
      next === "deactivate"
        ? deactivateFn({ data: { id: listing.id } })
        : reactivateFn({ data: { id: listing.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing updated");
    },
    onError: (e: any) => toast.error("Update failed", { description: e?.message }),
  });

  const statusChip =
    status === "active" ? (
      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
    ) : status === "deactivated" ? (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deactivated</span>
    ) : (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expired</span>
    );

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${dimmed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>
              {meta.label}
            </span>
            {statusChip}
          </div>
          <h3 className="mt-2 font-display text-2xl leading-tight tracking-wide">{listing.competition}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {listing.event_date}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {listing.location}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {categoryLabel(listing, listing.competition_type)}</span>
            <span>{listing.spots} spot{listing.spots > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          to="/listings/$id"
          params={{ id: listing.id }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Link>
        {status !== "expired" && (
          <Link
            to="/listings/$id/edit"
            params={{ id: listing.id }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        )}
        {status === "active" && (
          <button
            disabled={mut.isPending}
            onClick={() => mut.mutate("deactivate")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent disabled:opacity-50"
          >
            {mut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />} Deactivate
          </button>
        )}
        {status === "deactivated" && (
          <button
            disabled={mut.isPending}
            onClick={() => mut.mutate("reactivate")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-50"
          >
            {mut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Reactivate
          </button>
        )}
        {status !== "active" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={delMut.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                {delMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this listing permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This can't be undone. Your conversations about it will stay in Messages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => delMut.mutate()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
