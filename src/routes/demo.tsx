import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Search,
  MapPin,
  Calendar,
  Users,
  Trophy,
  MessageCircle,
  Filter,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";

const searchSchema = z.object({
  step: fallback(z.number().int().min(1).max(10), 1).default(1),
});

export const Route = createFileRoute("/demo")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Shareholder briefing — TeamUp" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPage,
});

const TOTAL = 10;

function DemoPage() {
  const { step } = Route.useSearch();
  const navigate = useNavigate({ from: "/demo" });

  const go = (n: number) => {
    const next = Math.min(TOTAL, Math.max(1, n));
    navigate({ search: { step: next } });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(step + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(step - 1);
      } else if (e.key === "Escape") {
        navigate({ to: "/" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const Slide = useMemo(() => SLIDES[step - 1], [step]);

  return (
    <div className="fixed inset-0 bg-secondary text-secondary-foreground overflow-hidden">
      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / TOTAL) * 100}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-40 text-xs uppercase tracking-[0.2em] text-white/60">
        <span className="font-display text-base text-primary tracking-widest">TeamUp · Shareholder Briefing</span>
        <div className="flex items-center gap-4">
          <span>{String(step).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}</span>
          <Link to="/" className="hover:text-primary transition flex items-center gap-1">
            <X className="w-4 h-4" /> Exit
          </Link>
        </div>
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 pt-16 pb-20 px-10 md:px-20 flex"
        >
          <Slide />
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 z-40">
        <button
          onClick={() => go(step - 1)}
          disabled={step === 1}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-secondary-foreground"
          aria-label="Previous"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => go(i + 1)}
              className={`h-1.5 rounded-full transition-all ${
                i + 1 === step ? "w-8 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => go(step + 1)}
          disabled={step === TOTAL}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition disabled:opacity-30"
          aria-label="Next"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------ SLIDES ------------------------ */

function SlideCover() {
  return (
    <div className="m-auto text-center max-w-5xl">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 text-primary text-xs uppercase tracking-[0.25em] mb-10">
        <Sparkles className="w-3.5 h-3.5" /> Confidential · 2026
      </div>
      <h1 className="font-display text-[120px] md:text-[180px] leading-[0.85] text-white">
        FIND YOUR <span className="text-primary">TEAM.</span>
      </h1>
      <p className="mt-10 text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light">
        The marketplace where competitive athletes find partners for the events that matter.
      </p>
    </div>
  );
}

function SlideProblem() {
  const stats = [
    { n: "73%", l: "of competitive athletes struggle to find partners for team events" },
    { n: "11 days", l: "average time spent searching across DMs, groups, and gym boards" },
    { n: "1 in 4", l: "registrations are cancelled because a partner drops out" },
  ];
  return (
    <div className="m-auto max-w-6xl w-full">
      <div className="text-primary uppercase text-xs tracking-[0.25em] mb-4">01 · The Problem</div>
      <h2 className="font-display text-6xl md:text-8xl text-white max-w-4xl leading-none mb-16">
        Great athletes are sidelined by a missing teammate.
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.n} className="border-l-2 border-primary pl-6">
            <div className="font-display text-6xl text-primary mb-3">{s.n}</div>
            <div className="text-white/70 text-sm leading-relaxed">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideAlternatives() {
  return (
    <div className="m-auto max-w-6xl w-full">
      <div className="text-primary uppercase text-xs tracking-[0.25em] mb-4">02 · Today's reality</div>
      <h2 className="font-display text-6xl md:text-7xl text-white mb-12">
        Athletes hack it together. Badly.
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 rounded-2xl p-8">
          <div className="text-white/40 uppercase text-xs tracking-widest mb-6">How it's done today</div>
          <ul className="space-y-4 text-white/80">
            {["Instagram DMs to strangers", "WhatsApp gym group spam", "Asking the coach", "Hoping someone posts in r/crossfit"].map((x) => (
              <li key={x} className="flex items-center gap-3">
                <X className="w-4 h-4 text-destructive shrink-0" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8">
          <div className="text-primary uppercase text-xs tracking-widest mb-6">What's missing</div>
          <ul className="space-y-4 text-white">
            {["Filter by event, date, skill, location", "Verified athlete profiles with PRs", "Structured listings, not noise", "Safe in-platform messaging"].map((x) => (
              <li key={x} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SlideMarket() {
  const sports = ["CrossFit", "Hyrox", "Spartan", "Padel", "Triathlon", "Trail Running", "OCR", "Rowing"];
  return (
    <div className="m-auto max-w-6xl w-full">
      <div className="text-primary uppercase text-xs tracking-[0.25em] mb-4">03 · Market opportunity</div>
      <h2 className="font-display text-6xl md:text-7xl text-white mb-12 max-w-4xl">
        A category-defining wedge into team fitness.
      </h2>
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Tam label="TAM" value="48M" sub="Competitive athletes worldwide in team-format events" />
        <Tam label="SAM" value="9.2M" sub="EU + US in our launch sports" />
        <Tam label="SOM (Y3)" value="420K" sub="Active users in top-25 cities" highlight />
      </div>
      <div>
        <div className="text-white/40 uppercase text-xs tracking-widest mb-4">Launch verticals</div>
        <div className="flex flex-wrap gap-2">
          {sports.map((s) => (
            <span key={s} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/80 text-sm">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tam({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-8 ${highlight ? "bg-primary text-primary-foreground" : "bg-white/5 text-white"}`}>
      <div className={`uppercase text-xs tracking-widest mb-3 ${highlight ? "text-primary-foreground/70" : "text-white/40"}`}>{label}</div>
      <div className="font-display text-7xl mb-3">{value}</div>
      <div className={`text-sm ${highlight ? "text-primary-foreground/80" : "text-white/60"}`}>{sub}</div>
    </div>
  );
}

/* ---------- Product walkthrough ---------- */

function ProductSlide({ kicker, title, copy, callouts, children }: {
  kicker: string; title: string; copy: string; callouts: string[]; children: React.ReactNode;
}) {
  return (
    <div className="m-auto max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="text-primary uppercase text-xs tracking-[0.25em] mb-4">{kicker}</div>
        <h2 className="font-display text-5xl md:text-6xl text-white mb-6 leading-[0.95]">{title}</h2>
        <p className="text-lg text-white/70 mb-8 leading-relaxed">{copy}</p>
        <ul className="space-y-3">
          {callouts.map((c) => (
            <li key={c} className="flex items-center gap-3 text-white/85">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {c}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <div className="absolute -inset-6 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

function MockListingCard({ sport, name, date, location, spots, skill }: {
  sport: string; name: string; date: string; location: string; spots: string; skill: string;
}) {
  return (
    <div className="border border-border rounded-xl p-4 hover:border-primary transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-primary-foreground bg-primary px-2 py-1 rounded">{sport}</span>
        <span className="text-xs text-muted-foreground">{skill}</span>
      </div>
      <div className="font-display text-lg mb-3 leading-tight">{name}</div>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {date}</div>
        <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {location}</div>
        <div className="flex items-center gap-2"><Users className="w-3 h-3" /> {spots}</div>
      </div>
    </div>
  );
}

function SlideBrowse() {
  return (
    <ProductSlide
      kicker="04 · Browse"
      title="Every event. Every format. One feed."
      copy="Athletes filter by sport, date, location, and skill level. No more scrolling through unrelated posts to find the one teammate that fits."
      callouts={["Real-time filters", "Verified competition database", "Saved searches & alerts"]}
    >
      <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search competitions…</span>
        <div className="ml-auto flex gap-1.5">
          <span className="text-xs px-2 py-1 bg-primary/20 text-foreground rounded flex items-center gap-1"><Filter className="w-3 h-3" /> CrossFit</span>
          <span className="text-xs px-2 py-1 bg-primary/20 text-foreground rounded">Berlin</span>
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 bg-background">
        <MockListingCard sport="CrossFit" name="Mayhem Classic Pairs" date="Sep 14, 2026" location="Berlin, DE" spots="1 of 2 spots" skill="Rx" />
        <MockListingCard sport="Hyrox" name="Hyrox Doubles Spring" date="Oct 03, 2026" location="Munich, DE" spots="1 of 2 spots" skill="Pro" />
        <MockListingCard sport="CrossFit" name="Throwdown Team of 4" date="Nov 21, 2026" location="Hamburg, DE" spots="2 of 4 spots" skill="Intermediate" />
        <MockListingCard sport="OCR" name="Spartan Trifecta Team" date="Aug 30, 2026" location="Garmisch, DE" spots="1 of 3 spots" skill="All levels" />
      </div>
    </ProductSlide>
  );
}

function SlideDetail() {
  return (
    <ProductSlide
      kicker="05 · Listing detail"
      title="Structured, not a paragraph of hope."
      copy="Every listing carries the same trusted fields, so athletes decide in seconds whether it's a fit."
      callouts={["Format & rules surfaced upfront", "Skill requirements explicit", "One-tap to contact"]}
    >
      <div className="p-6 bg-background">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider text-primary-foreground bg-primary px-2 py-1 rounded">CrossFit</span>
          <span className="text-xs text-muted-foreground">Posted 2h ago</span>
        </div>
        <h3 className="font-display text-2xl mb-4">Mayhem Classic — Pairs Division</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Event" value="Sep 14, 2026" />
          <Field label="Location" value="Berlin, DE" />
          <Field label="Format" value="Mixed Pairs" />
          <Field label="Skill" value="Rx · 2+ years" />
          <Field label="Spots" value="1 of 2" />
          <Field label="Gender" value="Female partner" />
        </div>
        <div className="bg-muted rounded-lg p-3 text-sm text-foreground/80 mb-4">
          "Looking for a strong female partner. 5+ Rx workouts/wk. Plan to train together in August."
        </div>
        <button className="w-full bg-secondary text-secondary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" /> Message Athlete
        </button>
      </div>
    </ProductSlide>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function SlidePost() {
  return (
    <ProductSlide
      kicker="06 · Post a listing"
      title="Under 60 seconds, from idea to live."
      copy="The faster posting is, the more supply we get. Athletes pick from a competition database, set the basics, and they're live."
      callouts={["Autocomplete from verified events", "Smart defaults from your profile", "Instant moderation"]}
    >
      <div className="p-6 bg-background space-y-4">
        <Step n={1} label="Pick the competition" value="Mayhem Classic 2026" done />
        <Step n={2} label="Set format & spots" value="Pairs · 1 spot · Female" done />
        <Step n={3} label="Add a note" value="Training in Berlin from Aug 1" />
        <button className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Publish listing
        </button>
      </div>
    </ProductSlide>
  );
}

function Step({ n, label, value, done }: { n: number; label: string; value: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {done ? <Check className="w-4 h-4" /> : n}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function SlideConnect() {
  return (
    <ProductSlide
      kicker="07 · Connect"
      title="Conversations that stay on platform."
      copy="In-app messaging keeps athletes safe and gives us the trust signal — and the engagement data — that no DM thread can."
      callouts={["Opt-in contactability per athlete", "Read receipts & notifications", "Block & report built in"]}
    >
      <div className="bg-background flex flex-col h-[360px]">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-display text-secondary">M</div>
          <div>
            <div className="text-sm font-medium">Maya R.</div>
            <div className="text-xs text-muted-foreground">re: Mayhem Classic Pairs</div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-hidden">
          <Bubble side="them">Hey! Saw your listing — I'm Rx, 3 years competing.</Bubble>
          <Bubble side="me">Perfect. What's your fran time?</Bubble>
          <Bubble side="them">3:24. Where do you usually train?</Bubble>
          <Bubble side="me">CrossFit Mitte. Want to do a workout this Saturday?</Bubble>
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">Write a message…</div>
          <button className="bg-primary text-primary-foreground rounded-lg px-4 text-sm font-medium">Send</button>
        </div>
      </div>
    </ProductSlide>
  );
}

function Bubble({ side, children }: { side: "me" | "them"; children: React.ReactNode }) {
  return (
    <div className={`flex ${side === "me" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] text-sm px-3 py-2 rounded-2xl ${side === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
        {children}
      </div>
    </div>
  );
}

function SlideProfile() {
  return (
    <ProductSlide
      kicker="08 · Profile"
      title="More than a classifieds board."
      copy="Profiles surface PRs, sports, gyms, and history. Athletes build reputation — and we build a graph that gets stronger with every signup."
      callouts={["Verified PRs & competition history", "Trusted gym network", "Network effects compound"]}
    >
      <div className="bg-background">
        <div className="h-24 bg-gradient-to-br from-primary/40 to-primary" />
        <div className="px-6 pb-6 -mt-12">
          <div className="w-20 h-20 rounded-full bg-secondary border-4 border-background flex items-center justify-center font-display text-3xl text-primary mb-3">JK</div>
          <h3 className="font-display text-2xl">Jonas K. <span className="text-muted-foreground text-lg">· 28</span></h3>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mb-4"><MapPin className="w-3 h-3" /> Berlin · CrossFit Mitte</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["CrossFit", "Hyrox", "Olympic Lifting"].map((s) => (
              <span key={s} className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded">{s}</span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Pr label="Fran" value="2:48" />
            <Pr label="Snatch" value="115kg" />
            <Pr label="Hyrox" value="58:12" />
          </div>
        </div>
      </div>
    </ProductSlide>
  );
}

function Pr({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-2 text-center">
      <Trophy className="w-3 h-3 text-primary mx-auto mb-1" />
      <div className="font-display text-base">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function SlideClose() {
  return (
    <div className="m-auto text-center max-w-5xl">
      <div className="text-primary uppercase text-xs tracking-[0.25em] mb-6">10 · What's next</div>
      <h2 className="font-display text-7xl md:text-9xl text-white leading-[0.9] mb-10">
        Own the team-event <span className="text-primary">layer</span> of competitive fitness.
      </h2>
      <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12 font-light">
        Launch sport by sport. Compound the athlete graph. Become the default before anyone else does.
      </p>
      <div className="inline-flex gap-3">
        <Link
          to="/"
          className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition"
        >
          Try the live product
        </Link>
        <button
          onClick={() => window.location.assign("/demo?step=1")}
          className="px-8 py-3 border border-white/30 text-white rounded-full font-medium hover:bg-white/5 transition"
        >
          Restart demo
        </button>
      </div>
    </div>
  );
}

const SLIDES = [
  SlideCover,
  SlideProblem,
  SlideAlternatives,
  SlideMarket,
  SlideBrowse,
  SlideDetail,
  SlidePost,
  SlideConnect,
  SlideProfile,
  SlideClose,
];
