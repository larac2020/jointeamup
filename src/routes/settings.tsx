import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, MessageSquare, Bell, Mail, Trash2, Download, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { exportMyData, deleteMyAccount } from "@/lib/gdpr.functions";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — TeamUp" }] }),
  component: Settings,
});

function Settings() {
  const { session, consents, refresh, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const runExport = useServerFn(exportMyData);
  const runDelete = useServerFn(deleteMyAccount);
  const [contactable, setContactable] = useState(false);
  const [notifMessages, setNotifMessages] = useState(false);
  const [notifListings, setNotifListings] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (consents) {
      setContactable(consents.contactable_by_athletes);
      setNotifMessages(consents.notifications_messages);
      setNotifListings(consents.notifications_listings);
      setNotifMarketing(consents.notifications_marketing);
    }
  }, [consents]);

  if (!session) return null;

  const save = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("user_consents").update({
      contactable_by_athletes: contactable,
      contactable_consent_at: contactable ? now : null,
      notifications_messages: notifMessages,
      notifications_listings: notifListings,
      notifications_marketing: notifMarketing,
      notifications_consent_at: now,
    }).eq("user_id", session.user.id);
    if (error) { toast.error(error.message); return; }
    await refresh();
    toast.success("Preferences saved");
  };

  const exportData = async () => {
    try {
      const payload = await runExport({ data: undefined });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "teamup-data.json"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Permanently delete your account, photos, listings and messages? This cannot be undone.")) return;
    try {
      await runDelete({ data: undefined });
      await signOut();
      toast.success("Your account and all your data have been deleted");
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deletion failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/profile/$id" params={{ id: session.user.id }} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <h1 className="mt-3 font-display text-5xl tracking-wide">Settings</h1>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 text-magenta">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-[0.25em]">Privacy & consents</p>
          </div>
          <div className="mt-4 space-y-3">
            <Toggle icon={MessageSquare} title="Allow other athletes to message me" body="Required to receive listing replies and team applications." checked={contactable} onChange={setContactable} />
            <Toggle icon={Bell} title="Notify me about new messages" body="In-app notifications when someone replies." checked={notifMessages} onChange={setNotifMessages} />
            <Toggle icon={Bell} title="Notify me about new listings" body="Heads-up when something matches your sport." checked={notifListings} onChange={setNotifListings} />
            <Toggle icon={Mail} title="Product news & tips" body="Occasional emails. Never sold." checked={notifMarketing} onChange={setNotifMarketing} />
          </div>
          <button onClick={save} className="mt-6 w-full rounded-2xl bg-warm px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-blaze hover:opacity-95">
            Save preferences
          </button>
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Your data (GDPR)</p>
          <h2 className="mt-1 font-display text-2xl tracking-wide">Export or delete</h2>
          <p className="mt-1 text-sm text-muted-foreground">Download a copy of your data, or permanently delete your account.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={exportData} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-accent">
              <Download className="h-4 w-4" /> Export my data
            </button>
            <button onClick={deleteAccount} className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-destructive hover:bg-destructive/20">
              <Trash2 className="h-4 w-4" /> Delete account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Toggle({ icon: Icon, title, body, checked, onChange }: { icon: typeof Bell; title: string; body: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${checked ? "border-primary/50 bg-accent/50" : "border-border bg-background hover:bg-accent/30"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
      <div className="flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
    </label>
  );
}
