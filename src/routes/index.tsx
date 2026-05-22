import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Ticket, Users, MessagesSquare, Zap, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const stats = [
  { k: "12K+", v: "Athletes" },
  { k: "340", v: "Tickets matched" },
  { k: "28", v: "Cities" },
];

const features = [
  { icon: Ticket, title: "Resell your bib", body: "Injured? Travelling? Pass your spot to another athlete in days, not weeks.", tone: "bg-warm" },
  { icon: Users, title: "Find a teammate", body: "Lost a partner before race day? Match with athletes by level, location and sport.", tone: "bg-cool" },
  { icon: MessagesSquare, title: "Connect directly", body: "We don't handle payments. We just connect supply and demand — the rest is up to you.", tone: "bg-secondary" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-primary-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-warm shadow-blaze">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl tracking-wide">TeamUp</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground/90 hover:text-primary-foreground">
              Log in
            </Link>
            <Link to="/login" className="rounded-full bg-primary-foreground px-5 py-2 text-sm font-bold uppercase tracking-wider text-foreground shadow-lg hover:opacity-90">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Athletes training in a competition gym"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/80" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-40 md:pb-32 md:pt-48">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Built by athletes, for athletes
          </span>
          <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-wide text-white md:text-8xl">
            Don't waste<br />
            <span className="text-blaze">a race day.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium text-white/85">
            TeamUp is the community marketplace where competition athletes resell tickets and teams find last-minute replacements. HYROX, Turf Games, DEKA, CrossFit — all in one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/login" className="group inline-flex items-center gap-2 rounded-full bg-warm px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze transition hover:opacity-95">
              Join the community
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/feed" className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white backdrop-blur hover:bg-white/20">
              Browse listings
            </Link>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.v}>
                <dt className="font-display text-4xl text-white">{s.k}</dt>
                <dd className="text-xs font-semibold uppercase tracking-wider text-white/70">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-magenta">How it works</p>
            <h2 className="mt-2 font-display text-5xl tracking-wide md:text-6xl">Three plays.<br />One community.</h2>
          </div>
          <p className="max-w-md text-base text-muted-foreground">
            We connect supply and demand. No payment processing, no middleman fees — just athletes helping athletes show up on race day.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-border bg-card p-7 shadow-card transition hover:-translate-y-1 hover:shadow-blaze">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${f.tone} text-primary-foreground shadow-md`}>
                <f.icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 font-display text-3xl tracking-wide">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 md:p-16 shadow-blaze">
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-5xl leading-none tracking-wide text-primary-foreground md:text-6xl">
                Race day is calling.
              </h2>
              <p className="mt-3 max-w-md text-base font-medium text-primary-foreground/90">
                Build your athlete profile in 60 seconds. Get matched with tickets and teammates near you.
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-foreground shadow-lg hover:opacity-95">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row">
          <p>© 2026 TeamUp. Built by athletes, for athletes.</p>
          <p>HYROX · Turf Games · DEKA · CrossFit · Spartan</p>
        </div>
      </footer>
    </div>
  );
}
