import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, MessageSquare, Sparkles, Ticket, UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { notifications as mockNotifs } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TeamUp" }] }),
  component: Notifications,
});

const iconMap = { message: MessageSquare, application: UserPlus, match: Sparkles, system: Bell, listing: Ticket } as const;
const toneMap: Record<string, string> = { message: "bg-warm", application: "bg-cool", match: "bg-secondary text-secondary-foreground", system: "bg-muted text-foreground", listing: "bg-blaze" };

type Notif = { id: string; kind: string; title?: string; text?: string; body?: string | null; time: string; unread: boolean };

function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>(mockNotifs as any);

  useEffect(() => {
    if (!user) return;
    // Load real notifications
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50).then(({ data }) => {
      if (data && data.length) {
        setItems(data.map((n: any) => ({ id: n.id, kind: n.kind, text: n.title, body: n.body, time: timeAgo(n.created_at), unread: !n.read_at })));
      }
    });
    // Realtime
    const ch = supabase
      .channel("notif-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (p) => {
        const n: any = p.new;
        setItems((prev) => [{ id: n.id, kind: n.kind, text: n.title, body: n.body, time: "now", unread: true }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (user) await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-magenta">Inbox</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">Notifications</h1>
          </div>
          <button onClick={markAllRead} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">Mark all read</button>
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {items.map((n, i) => {
            const Icon = iconMap[n.kind as keyof typeof iconMap] ?? Bell;
            return (
              <div key={n.id} className={`flex items-start gap-4 px-5 py-4 ${i !== items.length - 1 ? "border-b border-border" : ""} ${n.unread ? "bg-muted/30" : ""}`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground ${toneMap[n.kind] ?? "bg-muted"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.unread ? "font-semibold text-foreground" : "text-foreground/80"}`}>{n.text}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                </div>
                {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-magenta" />}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
