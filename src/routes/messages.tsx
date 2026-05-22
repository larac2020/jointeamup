import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { conversations, getAthlete } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — TeamUp" }] }),
  component: Messages,
});

function Messages() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId)!;
  const athlete = getAthlete(active.withAthleteId)!;
  const [draft, setDraft] = useState("");
  const [liveTick, setLiveTick] = useState(0);

  // Live subscribe to new messages for current user (real DB)
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("messages-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` }, () => {
        setLiveTick((n) => n + 1);
        toast("New message", { description: "Check your inbox" });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-5xl tracking-wide">Messages {liveTick > 0 && <span className="ml-2 text-xs text-magenta">● live</span>}</h1>
        <div className="mt-6 grid h-[70vh] gap-4 overflow-hidden rounded-3xl border border-border bg-card shadow-card md:grid-cols-[280px_1fr]">
          <aside className="overflow-y-auto border-r border-border bg-muted/30">
            {conversations.map((c) => {
              const a = getAthlete(c.withAthleteId)!;
              const isActive = c.id === activeId;
              return (
                <button key={c.id} onClick={() => setActiveId(c.id)} className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition ${isActive ? "bg-background" : "hover:bg-background/60"}`}>
                  <img src={a.avatar} alt={a.firstName} className="h-11 w-11 rounded-full bg-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{a.firstName}</p>
                      <span className="text-[10px] font-medium text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-magenta px-1.5 text-[10px] font-bold text-magenta-foreground">{c.unread}</span>}
                </button>
              );
            })}
          </aside>
          <section className="flex flex-col">
            <header className="flex items-center gap-3 border-b border-border px-5 py-3">
              <img src={athlete.avatar} alt={athlete.firstName} className="h-10 w-10 rounded-full bg-muted" />
              <div>
                <p className="font-display text-xl tracking-wide">{athlete.firstName}</p>
                <p className="text-xs text-muted-foreground">{athlete.livesIn} · {athlete.sports[0]}</p>
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {active.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "bg-warm text-primary-foreground" : "bg-muted text-foreground"}`}>
                    <p>{m.text}</p>
                    <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setDraft(""); }} className="flex items-center gap-2 border-t border-border bg-card px-4 py-3">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${athlete.firstName}…`} maxLength={2000} className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40" />
              <button type="submit" className="grid h-10 w-10 place-items-center rounded-full bg-warm text-primary-foreground shadow-blaze hover:opacity-95">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
