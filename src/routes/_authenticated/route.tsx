import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { safeLoginReturnPath } from "@/lib/auth-redirect";

export const Route = createFileRoute("/_authenticated")({
  // The browser owns the persisted session. Never run this gate during SSR.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: safeLoginReturnPath(location.href) },
        replace: true,
      });
    }
  },
  component: Outlet,
});