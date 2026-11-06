import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const OPEN_PATHS = ["/onboarding", "/login", "/privacy", "/terms"];

/** Signed-in users who haven't completed profile setup are sent to /onboarding. */
export function OnboardingGate() {
  const { session, profile, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session) return;
    if (profile?.onboarded) return;
    if (pathname === "/" || OPEN_PATHS.some((p) => pathname.startsWith(p))) return;
    void navigate({ to: "/onboarding", replace: true });
  }, [loading, session, profile?.onboarded, pathname, navigate]);

  return null;
}
