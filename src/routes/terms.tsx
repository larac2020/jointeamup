import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, H, P, UL } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — TeamUp" },
      {
        name: "description",
        content: "The rules for using TeamUp: accounts, listings, messaging and ticket transfers.",
      },
      { property: "og:title", content: "Terms of Service — TeamUp" },
      { property: "og:description", content: "The rules for using TeamUp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalShell title="Terms of Service" updated="7 September 2026">
      <P>
        By creating a TeamUp account you agree to these terms. If you don't agree, please don't use
        the platform.
      </P>

      <H>1. Your account</H>
      <P>
        You must be at least 16 years old and give accurate information. You are responsible for
        activity under your account and for keeping your login safe.
      </P>

      <H>2. What you post</H>
      <UL
        items={[
          "You keep ownership of your profile content and photos, and grant TeamUp permission to display them on the platform.",
          "Only upload photos you have the right to use, and don't publish other people's personal data.",
          "Listings must be genuine: a real competition, a real slot or a real search for teammates.",
        ]}
      />

      <H>3. Tickets and teammates</H>
      <P>
        TeamUp is an introduction platform. We are not party to any ticket transfer or team
        agreement, we don't handle payments, and we can't guarantee that a race organiser will
        approve a transfer. Always check the organiser's transfer rules before agreeing anything,
        and take normal precautions when meeting or paying someone.
      </P>

      <H>4. Behaviour</H>
      <P>
        No harassment, hate speech, spam, scams, scraping or attempts to break the platform's
        security. We may suspend or remove accounts and listings that break these rules.
      </P>

      <H>5. Availability</H>
      <P>
        TeamUp is provided "as is". We work to keep it running but can't promise uninterrupted
        service, and we're not liable for indirect losses arising from use of the platform.
      </P>

      <H>6. Ending your use</H>
      <P>
        You can delete your account at any time from Settings, which permanently removes your data.
        We may terminate accounts that seriously or repeatedly breach these terms.
      </P>

      <H>7. Contact</H>
      <P>Questions about these terms: hello@jointeamup.app.</P>
    </LegalShell>
  );
}
