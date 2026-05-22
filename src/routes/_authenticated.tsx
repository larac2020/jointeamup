import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

function Layout() {
  const { loading, session, profile, consents } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    // Needs to accept ToS + create athlete profile
    const needsOnboarding =
      !consents?.terms_accepted_at ||
      !consents?.privacy_accepted_at ||
      !profile?.onboarded;
    if (needsOnboarding && location.pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [loading, session, profile, consents, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="font-display text-3xl tracking-wide text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!session) return null;
  return <Outlet />;
}
