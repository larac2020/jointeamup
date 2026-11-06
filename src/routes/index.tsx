import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Ticket, Users, Search, HandHeart, Zap, Sparkles } from "lucide-react";


export const Route = createFileRoute("/")({
  component: Landing,
});



const sides = [
  {
    tag: "Got a spot",
    title: "Pass it on.",
    accent: "bg-warm",
    accentText: "text-warm",
    items: [
      { icon: Ticket, title: "Resell your bib", body: "Injured, travelling, or out of shape? List your spot and pass it to an athlete who's ready." },
      { icon: Users, title: "Replace a teammate", body: "Lost a partner before race day? Find a stand-in by sport, level, and location." },
    ],
  },
  {
    tag: "Need a spot",
    title: "Get on the start line.",
    accent: "bg-cool",
    accentText: "text-cool",
    items: [
      { icon: Search, title: "Find a bib", body: "Race sold out? Browse last-minute bibs from athletes who can't make it." },
      { icon: HandHeart, title: "Join a team", body: "Solo and looking? Match with teams hunting for a teammate at your level." },
    ],
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-blaze">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl tracking-wide">TeamUp</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white/90 hover:text-white">
              Log in
            </Link>
            <Link to="/login" className="rounded-full bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:opacity-90">
              Sign up
            </Link>
          </div>
        </div>
      </header>


      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-secondary">

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-40 md:pb-32 md:pt-48">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Built by athletes, for athletes
          </span>
          <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-wide text-white md:text-8xl">
            Don't waste<br />
            <span className="text-blaze">a race day.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium text-white/85">
            Can’t make your competition anymore? Need a last-minute teammate who fits your team vibe?<br />
            TeamUp helps you connect with athletes to buy, resell, and replace teammates in sports competitions, like HYROX, TurfGames, DEKA, and more.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/login" className="group inline-flex items-center gap-2 rounded-full bg-warm px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze transition hover:opacity-95">
              Join the community
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          
          </div>
        </div>
      </section>


      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-magenta">How it works</p>
            <h2 className="mt-2 font-display text-5xl tracking-wide md:text-6xl">Two sides.<br />One start line.</h2>
          </div>
          <p className="max-w-md text-base text-muted-foreground">
            Whether you've got a spot you can't use or you're hunting for one, TeamUp matches both sides of race day.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sides.map((side) => (
            <div key={side.tag} className="rounded-3xl border border-border bg-card p-7 shadow-card">
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${side.accent}`} />
                <p className={`text-xs font-bold uppercase tracking-[0.25em] ${side.accentText}`}>{side.tag}</p>
              </div>
              <h3 className="mt-3 font-display text-4xl tracking-wide">{side.title}</h3>
              <div className="mt-6 space-y-4">
                {side.items.map((it) => (
                  <div key={it.title} className="group flex gap-4 rounded-2xl border border-border/70 bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-blaze">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${side.accent} text-primary-foreground shadow-md`}>
                      <it.icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="font-display text-xl tracking-wide">{it.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* CTA strip */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-10 md:p-16 shadow-blaze">
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-5xl leading-none tracking-wide text-white md:text-6xl">
                Race day is calling.
              </h2>
              <p className="mt-3 max-w-md text-base font-medium text-white/80">
                Build your athlete profile in 60 seconds. Get matched with tickets and teammates near you.
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:opacity-95">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row">
          <p>© 2026 TeamUp. Built by athletes, for athletes.</p>
          <p className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
