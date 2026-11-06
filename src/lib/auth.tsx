import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { isSignupConfirmation } from "@/lib/auth-redirect";

export type Consents = {
  user_id: string;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  contactable_by_athletes: boolean;
  contactable_consent_at: string | null;
  notifications_messages: boolean;
  notifications_listings: boolean;
  notifications_marketing: boolean;
  notifications_consent_at: string | null;
};

export type Profile = {
  id: string;
  first_name: string;
  nickname: string | null;
  age: number | null;
  from_location: string | null;
  lives_in: string | null;
  sports: string[];
  gyms: string[];
  competitions: string[];
  prs: { name: string; value: string }[];
  superpower: string | null;
  kryptonite: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  looking_for: string | null;
  photos: string[];
  onboarded: boolean;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  consents: Consents | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [consents, setConsents] = useState<Consents | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (uid: string) => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_consents").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    setProfile(p as Profile | null);
    setConsents(c as Consents | null);
  };

  useEffect(() => {
    // Capture the confirmation marker before the auth client clears the hash.
    let confirmationPending = isSignupConfirmation(window.location.hash);
    const finishConfirmation = (s: Session | null) => {
      if (!confirmationPending || !s?.user) return;
      confirmationPending = false;
      void navigate({ to: "/feed", replace: true });
    };
    // 1. Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      finishConfirmation(s);
      if (s?.user) {
        // Defer DB calls to avoid deadlock with auth events
        setTimeout(() => loadUserData(s.user.id), 0);
      } else {
        setProfile(null);
        setConsents(null);
      }
    });

    // 2. Then check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      finishConfirmation(s);
      if (s?.user) loadUserData(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const refresh = async () => {
    if (session?.user) await loadUserData(session.user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, profile, consents, loading, refresh, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside <AuthProvider>");
  return c;
}
