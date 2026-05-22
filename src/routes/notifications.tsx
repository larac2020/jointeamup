import { createFileRoute } from "@tanstack/react-router";
import { Bell, MessageSquare, Sparkles, Ticket, UserPlus } from "lucide-react";
import { Header } from "@/components/Header";
import { notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TeamUp" }] }),
  component: Notifications,
});

const iconMap = {
  message: MessageSquare,
  application: UserPlus,
  match: Sparkles,
  system: Bell,
  listing: Ticket,
} as const;

const toneMap: Record<string, string> = {
  message: "bg-warm",
  application: "bg-cool",
  match: "bg-secondary text-secondary-foreground",
  system: "bg-muted text-foreground",
  listing: "bg-blaze",
};

function Notifications() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-magenta">Inbox</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide">Notifications</h1>
          </div>
          <button className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Mark all read
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {notifications.map((n, i) => {
            const Icon = iconMap[n.kind as keyof typeof iconMap] ?? Bell;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 ${i !== notifications.length - 1 ? "border-b border-border" : ""} ${n.unread ? "bg-muted/30" : ""}`}
              >
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground ${toneMap[n.kind] ?? "bg-muted"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.unread ? "font-semibold text-foreground" : "text-foreground/80"}`}>{n.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.time} ago</p>
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
