import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Lock, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({ mode: z.enum(["signin", "signup", "forgot"]).optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Log in or sign up — TeamUp" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { mode: initialMode } = useSearch({ from: "/login" });
  const { session, profile } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [busy, setBusy] = useState(false);

  // If already signed in, route them away.
  useEffect(() => {
    if (!session) return;
    if (profile?.onboarded) navigate({ to: "/feed" });
    else navigate({ to: "/onboarding" });
  }, [session, profile, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed", { description: result.error.message });
      setBusy(false);
      return;
    }
    if (result.redirected) return; // browser will navigate
    // session set — listener in AuthProvider handles the rest
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: firstName },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "Check your inbox to verify your email." });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent", { description: "Check your email." });
        setMode("signin");
      }
    } catch (err: any) {
      toast.error("Something went wrong", { description: err?.message ?? "Try again" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] opacity-80">Welcome to TeamUp</p>
            <h1 className="mt-4 font-display text-7xl leading-[0.9] tracking-wide">
              Your race<br />day, saved.
            </h1>
            <p className="mt-5 max-w-sm text-base font-medium opacity-90">
              Join competition athletes matching tickets and teammates across Europe.
            </p>
          </div>
          <div className="text-xs opacity-70">© 2026 TeamUp</div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl tracking-wide">TeamUp</span>
          </div>

          <h2 className="mt-8 font-display text-5xl tracking-wide">
            {mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Log in"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? ""
              : mode === "forgot"
              ? "We'll email you a reset link."
              : "Welcome back, athlete."}
          </p>

          {mode !== "forgot" && (
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold uppercase tracking-wider shadow-card transition hover:-translate-y-0.5 hover:shadow-card disabled:opacity-60"
              >
                <GoogleIcon /> Continue with Google
              </button>
            </div>
          )}

          {mode !== "forgot" && (
            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                minLength={1}
                maxLength={60}
                placeholder="First name"
                className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm font-medium outline-none ring-ring/40 transition focus:ring-2"
              />
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@athlete.com"
                className="w-full rounded-xl border border-input bg-card px-12 py-3.5 text-sm font-medium outline-none ring-ring/40 transition focus:ring-2"
              />
            </div>
            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Password (min 8 chars)"
                  className="w-full rounded-xl border border-input bg-card px-12 py-3.5 text-sm font-medium outline-none ring-ring/40 transition focus:ring-2"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                <button type="button" onClick={() => setMode("forgot")} className="font-semibold hover:text-foreground">
                  Forgot password?
                </button>
                <button type="button" onClick={() => setMode("signup")} className="font-semibold hover:text-foreground">
                  Need an account? <span className="text-primary">Sign up</span>
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setMode("signin")} className="ml-auto font-semibold hover:text-foreground">
                Back to log in
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms & Community Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
    </svg>
  );
}
