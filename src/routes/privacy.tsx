import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — TeamUp" },
      {
        name: "description",
        content:
          "How TeamUp collects, uses and protects athlete data, and how to exercise your GDPR rights.",
      },
      { property: "og:title", content: "Privacy Policy — TeamUp" },
      {
        property: "og:description",
        content: "How TeamUp handles athlete data and your GDPR rights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const LAST_UPDATED = "7 September 2026";

function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated={LAST_UPDATED}>
      <P>
        TeamUp helps competition athletes find teammates and transfer race tickets. This policy
        explains what personal data we process, why, and the rights you have under the EU General
        Data Protection Regulation (GDPR).
      </P>

      <H>1. Who is responsible</H>
      <P>
        TeamUp is the data controller for the information described here.
      </P>

      <H>2. What we collect</H>
      <UL
        items={[
          "Account data: email address and login credentials, handled by our authentication provider. If you sign in with Google we receive your email, name and profile picture only.",
          "Profile data you choose to publish: first name, nickname, age, home town and city, sports, gyms, competitions, personal records, experience level, bio, what you're looking for, and up to five photos.",
          "Listings you post: competition, category, date, location, spots and description.",
          "Messages and notifications generated when you contact other athletes.",
          "Consent records: which permissions you granted and when.",
          "Technical data needed to serve the site securely, such as IP address and browser type in short-lived server logs.",
        ]}
      />
      <P>
        We do not collect health data or special category data, and we do not use
        advertising or tracking cookies. The only cookies and local storage we use keep you signed
        in.
      </P>

      <H>3. Why we process it and on what basis</H>
      <UL
        items={[
          "To run your account and show your athlete card and listings — necessary to perform our contract with you.",
          "To let athletes message each other — only after you switch on the 'allow other athletes to message me' consent.",
          "To send product news and tips — only with your separate, optional consent.",
          "To keep the platform safe and prevent abuse — our legitimate interest.",
        ]}
      />

      <H>4. Who can see your data</H>
      <P>
        Your profile and active listings are public: anyone visiting TeamUp, signed in or not, can
        see the profile fields and photos you publish, so please share only what you're comfortable
        making public. Your email address, consent settings and private messages are never public.
        Profiles are only shown publicly once you have completed onboarding, and listings only while
        they are active.
      </P>

      <H>5. Processors we use</H>
      <UL
        items={[
          "Supabase — database, authentication and file storage, hosted in the EU.",
          "Cloudflare — application hosting and delivery.",
          "Google — only if you choose Google sign-in.",
          "Firecrawl — used to collect public competition calendars; no personal data is sent to it.",
        ]}
      />
      <P>
        These providers act on our instructions under data processing agreements. We never sell your
        data.
      </P>

      <H>6. How long we keep it</H>
      <P>
        Profile and listing data is kept while your account exists. Deleting your account removes
        your profile, listings, messages, notifications, consent records, uploaded photos and login
        immediately and permanently. Inactive listings whose event date has passed can be deleted by
        you at any time.
      </P>

      <H>7. Your rights</H>
      <UL
        items={[
          "Access and portability: download everything we hold about you as a JSON file from Settings.",
          "Rectification: edit any profile field at any time.",
          "Erasure: delete your account from Settings — it is immediate and irreversible.",
          "Withdraw consent: turn off messaging, notification or marketing consents in Settings; withdrawal does not affect processing already carried out.",
          "Objection and restriction: contact us and we will respond within one month.",
          "Complaint: you may lodge a complaint with your national data protection authority.",
        ]}
      />

      <H>8. International transfers and security</H>
      <P>
        Data is stored in the EU. Where a provider processes data outside the EEA, it is covered by
        Standard Contractual Clauses. Access to the database is restricted by row-level security
        rules so that each account can only reach its own private data.
      </P>

      <H>9. Children</H>
      <P>TeamUp is not intended for anyone under 16.</P>

      <H>10. Changes</H>
      <P>
        If we change this policy materially we will tell you in the app before the change takes
        effect.
      </P>
    </LegalShell>
  );
}

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>
        <h1 className="mt-3 font-display text-5xl tracking-wide">{title}</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Last updated {updated}
        </p>
        <div className="mt-8 space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function H({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 font-display text-2xl tracking-wide">{children}</h2>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

export function UL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
