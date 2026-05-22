import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Dumbbell, LogOut, MapPin, MessageSquare, Settings, Share2, Skull, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/lib/auth";
import { getProfile } from "@/lib/profiles.functions";
import { listListingsByAuthor } from "@/lib/listings.functions";
import { fallbackAvatar } from "@/lib/types";

const profileQO = (id: string) =>
  queryOptions({
    queryKey: ["profiles", id],
    queryFn: () => getProfile({ data: { id } }),
  });

export const Route = createFileRoute("/profile/$id")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(profileQO(params.id)),
  component: Profile,
});

function Profile() {
  const { id } = Route.useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: a } = useSuspenseQuery(profileQO(id));
  const myListingsQ = useQuery({
    queryKey: ["listings", "by", id],
    queryFn: () => listListingsByAuthor({ data: { author_id: id } }),
    enabled: !!a,
  });
  const isMe = user?.id === id;

  if (!a) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-5xl">Athlete not found</h1>
        </div>
      </div>
    );
  }

  const avatar = a.avatar_url ?? fallbackAvatar(a.id);
  const myListings = myListingsQ.data ?? [];
  const gallery = [avatar, ...(a.photos ?? [])].slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          {/* Scrollable photo gallery — main + up to 4 extras */}
          <div className="relative">
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto p-2 scroll-smooth">
              {gallery.map((url, i) => (
                <div key={`${url}-${i}`} className="relative aspect-[4/5] w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl bg-muted sm:w-[48%] md:w-[38%]">
                  <img src={url} alt={`${a.first_name} photo ${i + 1}`} className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                </div>
              ))}
            </div>
            {gallery.length > 1 && (
              <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                Swipe · {gallery.length} photos
              </p>
            )}
          </div>

          <div className="px-6 pb-6 pt-4 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4 md:gap-5">
                {/* Always-visible account avatar */}
                <img
                  src={avatar}
                  alt={`${a.first_name} avatar`}
                  className="-mt-16 h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-background shadow-card md:mt-0 md:h-28 md:w-28"
                />
                <div>
                  <h1 className="font-display text-5xl leading-none tracking-wide">
                    {a.first_name} {a.age ? <span className="text-muted-foreground">· {a.age}</span> : null}
                  </h1>
                  {a.nickname && <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-primary">"{a.nickname}"</p>}
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> From {a.from_location ?? "—"} · Lives in {a.lives_in ?? "—"}
                  </p>
                  {a.experience && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cool/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cool">
                      <Zap className="h-3.5 w-3.5" /> {a.experience}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {isMe ? (
                  <>
                    <Link to="/profile/edit" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95">
                      <Settings className="h-4 w-4" /> Edit profile
                    </Link>
                    <Link to="/settings" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-accent">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-accent">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card hover:bg-accent"><Share2 className="h-4 w-4" /></button>
                    <Link to="/messages" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      <MessageSquare className="h-4 w-4" /> Message
                    </Link>
                  </>
                )}
              </div>
            </div>

            {a.sports.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {a.sports.map((s) => (
                  <span key={s} className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider">{s}</span>
                ))}
              </div>
            )}

            {a.bio && (
              <p className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/80">{a.bio}</p>
            )}

            {a.looking_for && (
              <div className="mt-6 rounded-2xl border border-magenta/30 bg-magenta/5 p-4">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-magenta">
                  <Target className="h-3.5 w-3.5" /> Looking for
                </p>
                <p className="mt-1 text-sm">{a.looking_for}</p>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card icon={Sparkles} tint="text-primary" title="Superpower" body={a.superpower ?? "—"} />
              <Card icon={Skull} tint="text-secondary" title="Kryptonite" body={a.kryptonite ?? "—"} />
            </div>


            {a.prs.length > 0 && (
              <Section title="Personal bests" icon={Trophy}>
                <div className="grid gap-2 sm:grid-cols-3">
                  {a.prs.map((p) => (
                    <div key={p.name} className="rounded-xl bg-muted/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.name}</p>
                      <p className="mt-0.5 font-display text-2xl tracking-wide">{p.value}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {a.competitions.length > 0 && (
              <Section title="Competitions completed" icon={Trophy}>
                <div className="flex flex-wrap gap-2">
                  {a.competitions.map((c) => (
                    <span key={c} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </Section>
            )}

            {a.gyms.length > 0 && (
              <Section title="Gyms" icon={Dumbbell}>
                <div className="flex flex-wrap gap-2">
                  {a.gyms.map((g) => (
                    <span key={g} className="rounded-full bg-muted/60 px-3 py-1.5 text-xs font-semibold">{g}</span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>

        {myListings.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-3xl tracking-wide">Active listings</h2>
            <div className="mt-4 space-y-4">
              {myListings.map((l) => (
                <ListingCard key={l.id} listing={{ ...l, author: a }} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Card({ icon: Icon, tint, title, body }: { icon: typeof Sparkles; tint: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${tint}`}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <p className="mt-2 font-display text-3xl tracking-wide">{body}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Trophy; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="inline-flex items-center gap-2 font-display text-2xl tracking-wide">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
