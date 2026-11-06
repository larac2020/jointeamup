import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { safeLoginReturnPath } from "@/lib/auth-redirect";

const OPEN_PATHS = ["/onboarding", "/login", "/privacy", "/terms"];

/** Signed-in users who haven't completed profile setup are sent to /onboarding. */
export function OnboardingGate() {
  const { session, profile, loading } = useAuth();
  const { pathname, href } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session) return;
    if (profile?.onboarded) return;
    if (pathname === "/" || OPEN_PATHS.some((p) => pathname.startsWith(p))) return;
    void navigate({ to: "/onboarding", search: { redirect: safeLoginReturnPath(href) }, replace: true });
  }, [loading, session, profile?.onboarded, pathname, href, navigate]);

  return null;
}
