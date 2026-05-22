import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, MessageSquare, Sparkles, Ticket, UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications.functions";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TeamUp" }] }),
  component: Notifications,
});

const iconMap = { message: MessageSquare, application: UserPlus, match: Sparkles, system: Bell, listing: Ticket } as const;
const toneMap: Record<string, string> = {
  message: "bg-primary text-primary-foreground",
  application: "bg-secondary text-secondary-foreground",
  match: "bg-accent text-accent-foreground",
  system: "bg-muted text-foreground",
  listing: "bg-primary text-primary-foreground",
};

function Notifications() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listMyNotifications);
  const markFn = useServerFn(markNotificationRead);
  const markAllFn = useServerFn(markAllNotificationsRead);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listFn(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("notif-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
          qc.invalidateQueries({ queryKey: ["unread-notifications"] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const markAll = useMutation({
    mutationFn: () => markAllFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });
  const markOne = useMutation({
    mutationFn: (id: string) => markFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const items = q.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Inbox</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">Notifications</h1>
          </div>
          <button onClick={() => markAll.mutate()} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Mark all read
          </button>
        </div>
        {q.isLoading ? (
          <div className="mt-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-2xl">All caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">You'll hear from us when someone messages or matches with you.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {items.map((n, i) => {
              const Icon = iconMap[n.kind as keyof typeof iconMap] ?? Bell;
              const unread = !n.read_at;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (unread) markOne.mutate(n.id);
                    if (n.link) navigate({ to: n.link as any });
                  }}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left ${i !== items.length - 1 ? "border-b border-border" : ""} ${unread ? "bg-muted/30" : ""}`}
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneMap[n.kind] ?? "bg-muted text-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${unread ? "font-semibold text-foreground" : "text-foreground/80"}`}>{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                  </div>
                  {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
