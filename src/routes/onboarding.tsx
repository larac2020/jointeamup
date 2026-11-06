import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, MessageSquare, Bell, Mail, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — TeamUp" }] }),
  component: Onboarding,
});

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Required").max(60),
  nickname: z.string().trim().max(40).optional().or(z.literal("")),
  age: z.number().int().min(13).max(120).optional().or(z.nan()),
  lives_in: z.string().trim().max(80).optional().or(z.literal("")),
  superpower: z.string().trim().max(60).optional().or(z.literal("")),
  kryptonite: z.string().trim().max(60).optional().or(z.literal("")),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
  experience: z.string().trim().max(40).optional().or(z.literal("")),
  gym: z.string().trim().max(80).optional().or(z.literal("")),
  sports: z.array(z.string()).min(1, "Pick at least one sport"),
});

const SPORTS = ["HYROX", "HYROX Doubles", "Turf Games", "CrossFit", "DEKA", "Spartan", "Running", "Rowing", "Triathlon"];
const EXPERIENCE = ["Beginner", "Intermediate", "Advanced", "Elite", "Pro"];

function Onboarding() {
  const { session, profile, consents, refresh, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1: consents
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifListings, setNotifListings] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Step 2: profile
  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<string>("");
  const [livesIn, setLivesIn] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [superpower, setSuperpower] = useState("");
  const [kryptonite, setKryptonite] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [gym, setGym] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setNickname(profile.nickname ?? "");
      setAge(profile.age ? String(profile.age) : "");
      setLivesIn(profile.lives_in ?? "");
      setSports(profile.sports ?? []);
      setSuperpower(profile.superpower ?? "");
      setKryptonite(profile.kryptonite ?? "");
      setBio(profile.bio ?? "");
      setExperience(profile.experience ?? "");
      setGym(profile.gyms?.[0] ?? "");
    }
    if (consents) {
      setTerms(!!consents.terms_accepted_at);
      setPrivacy(!!consents.privacy_accepted_at);
      setNotifMessages(consents.notifications_messages);
      setNotifListings(consents.notifications_listings);
      setNotifMarketing(consents.notifications_marketing);
    }
  }, [profile, consents]);

  if (loading || !session) return null;

  const saveConsents = async () => {
    if (!terms || !privacy) {
      toast.error("You must accept the Terms and Privacy Policy to continue.");
      return;
    }
    const now = new Date().toISOString();
    const { error } = await supabase.from("user_consents").upsert({
      user_id: session.user.id,
      terms_accepted_at: now,
      privacy_accepted_at: now,
      contactable_by_athletes: true,
      contactable_consent_at: now,
      notifications_messages: notifMessages,
      notifications_listings: notifListings,
      notifications_marketing: notifMarketing,
      notifications_consent_at: now,
    });
    if (error) { toast.error(error.message); return; }
    await refresh();
    setStep(1);
  };

  const saveProfile = async () => {
    const parsed = profileSchema.safeParse({
      first_name: firstName,
      nickname,
      age: age ? Number(age) : NaN,
      lives_in: livesIn,
      sports,
      superpower,
      kryptonite,
      bio,
      experience,
      gym,
    });
    if (!parsed.success) {
      setShowErrors(true);
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const gymTrim = gym.trim();
    const { error } = await supabase.from("profiles").update({
      first_name: firstName.trim(),
      nickname: nickname.trim() || null,
      age: age ? Number(age) : null,
      lives_in: livesIn.trim() || null,
      sports,
      superpower: superpower.trim() || null,
      kryptonite: kryptonite.trim() || null,
      bio: bio.trim() || null,
      experience: experience.trim() || null,
      gyms: gymTrim ? [gymTrim] : [],
      onboarded: true,
    }).eq("id", session.user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    await refresh();
    toast.success("Welcome to TeamUp 🔥");
    navigate({ to: "/feed" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-warm shadow-blaze">
            <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-2xl tracking-wide">TeamUp</span>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Pill active={step >= 0} done={step > 0} label="Consents" />
          <div className="h-px flex-1 bg-border" />
          <Pill active={step >= 1} done={false} label="Profile" />
        </div>

        {step === 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className="flex items-center gap-2 text-magenta">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-[0.25em]">Your data, your rules</p>
            </div>
            <h1 className="mt-2 font-display text-4xl tracking-wide">Before we start</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              TeamUp processes your data under GDPR. You're in control — toggle anything off later in Settings.
            </p>

            <div className="mt-6 space-y-3">
              <Consent
                required
                checked={terms}
                onChange={setTerms}
                title="I accept the Terms of Service"
                body="The basic rules for using TeamUp."
              />
              <Consent
                required
                checked={privacy}
                onChange={setPrivacy}
                title="I accept the Privacy Policy"
                body="How we store and process your personal data."
              />
              <p className="text-xs text-muted-foreground">
                Read the{" "}
                <a href="/terms" target="_blank" rel="noreferrer" className="font-bold underline hover:text-foreground">Terms of Service</a>
                {" "}and the{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold underline hover:text-foreground">Privacy Policy</a>.
              </p>


              <p className="pt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Optional — recommended</p>
              <Consent
                icon={Bell}
                checked={notifMessages}
                onChange={setNotifMessages}
                title="Notify me about new messages"
                body="In-app notification badge when someone replies."
              />
              <Consent
                icon={Sparkles}
                checked={notifListings}
                onChange={setNotifListings}
                title="Notify me about new listings near me"
                body="Heads-up when a ticket or team matches your sport."
              />
              <Consent
                icon={Mail}
                checked={notifMarketing}
                onChange={setNotifMarketing}
                title="Send me product news and tips"
                body="Occasional emails. We never sell your data."
              />
            </div>

            <button
              onClick={saveConsents}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-warm px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze transition hover:opacity-95"
            >
              Continue
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-magenta">Build your sports card</p>
            <h1 className="mt-2 font-display text-4xl tracking-wide">Your athlete profile</h1>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Field label="First name *" value={firstName} onChange={setFirstName} placeholder="Maya" />
                {showErrors && !firstName.trim() && <p className="mt-1 text-xs font-bold text-destructive">First name is required</p>}
              </div>
              <Field label="Nickname" value={nickname} onChange={setNickname} placeholder="Sledgehammer" />
              <Field label="Age" value={age} onChange={setAge} placeholder="28" type="number" />
              <Field label="Lives in" value={livesIn} onChange={setLivesIn} placeholder="Berlin, DE" />
              <Field label="Home gym" value={gym} onChange={setGym} placeholder="CrossFit Mitte" />
              <Field label="Superpower" value={superpower} onChange={setSuperpower} placeholder="Sled push" />
              <Field label="Kryptonite" value={kryptonite} onChange={setKryptonite} placeholder="Wall balls" />
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={600}
                placeholder="A couple sentences about you, your training, your goals…"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">{bio.length}/600</p>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Experience level</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXPERIENCE.map((lvl) => {
                  const on = experience === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(on ? "" : lvl)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        on ? "bg-cool text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sports *</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SPORTS.map((s) => {
                  const on = sports.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSports(on ? sports.filter((x) => x !== s) : [...sports, s])}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        on ? "bg-warm text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {showErrors && sports.length === 0 && <p className="mt-2 text-xs font-bold text-destructive">Pick at least one sport</p>}
            </div>


            <div className="mt-8 flex flex-wrap gap-2">
              <button onClick={() => setStep(0)} className="rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                Back
              </button>
              <button
                onClick={saveProfile}
                disabled={saving || !firstName.trim() || sports.length === 0}
                className="flex-1 rounded-2xl bg-warm px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Enter TeamUp"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
      done ? "bg-secondary text-secondary-foreground" : active ? "bg-warm text-primary-foreground" : "bg-muted text-muted-foreground"
    }`}>
      {done && <Check className="h-3 w-3" />} {label}
    </div>
  );
}

function Consent({
  icon: Icon, required, checked, onChange, title, body,
}: { icon?: typeof MessageSquare; required?: boolean; checked: boolean; onChange: (v: boolean) => void; title: string; body: string }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
      checked ? "border-primary/50 bg-accent/50" : "border-border bg-background hover:bg-accent/30"
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />
      <div className="flex-1">
        <p className="text-sm font-bold">
          {title} {required && <span className="text-magenta">*</span>}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
      {Icon && <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />}
    </label>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40"
      />
    </div>
  );
}
