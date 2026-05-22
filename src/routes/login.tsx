import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Mail, Zap } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-blaze lg:block">
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-violet/40 blur-3xl" />
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
              Join 12K+ competition athletes matching tickets and teammates across Europe.
            </p>
          </div>
          <div className="text-xs opacity-70">© 2026 TeamUp</div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-warm shadow-blaze">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl tracking-wide">TeamUp</span>
          </div>

          <h2 className="mt-8 font-display text-5xl tracking-wide">Log in or sign up</h2>
          <p className="mt-2 text-sm text-muted-foreground">No password needed for early access. Pick how you want to continue.</p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate({ to: "/feed" })}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold uppercase tracking-wider shadow-card transition hover:-translate-y-0.5 hover:shadow-blaze"
            >
              <GoogleIcon /> Continue with Google
            </button>
            <button
              onClick={() => navigate({ to: "/feed" })}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold uppercase tracking-wider shadow-card transition hover:-translate-y-0.5 hover:shadow-blaze"
            >
              <AppleIcon /> Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/feed" }); }}
            className="space-y-3"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@athlete.com"
                className="w-full rounded-xl border border-input bg-card px-12 py-3.5 text-sm font-medium outline-none ring-ring/40 transition focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-warm px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze transition hover:opacity-95"
            >
              Send magic link
            </button>
          </form>

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

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.36 1.43c0 1.14-.42 2.21-1.25 3.08-.9.97-2.05 1.53-3.06 1.45-.12-1.1.43-2.27 1.21-3.13.86-.94 2.21-1.6 3.1-1.4Zm3.55 16.46c-.51 1.18-.75 1.7-1.4 2.74-.92 1.45-2.2 3.25-3.81 3.27-1.43.02-1.8-.94-3.74-.93-1.95.01-2.35.95-3.79.93-1.6-.02-2.82-1.64-3.74-3.09C1.32 16.6.59 11.55 2.79 8.46c1.55-2.19 3.99-3.47 6.29-3.47 2.34 0 3.82 1.29 5.76 1.29 1.88 0 3.02-1.29 5.73-1.29 2.04 0 4.21 1.12 5.76 3.04-5.07 2.78-4.25 10.04-1.42 12.86Z"/>
    </svg>
  );
}
