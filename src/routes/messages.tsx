import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyConversations,
  listMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/messages.functions";
import { fallbackAvatar } from "@/lib/types";

const searchSchema = z.object({ c: z.string().uuid().optional() });

export const Route = createFileRoute("/messages")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Messages — TeamUp" }] }),
  component: Messages,
});

function Messages() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const qc = useQueryClient();
  const listConvFn = useServerFn(listMyConversations);
  const listMsgFn = useServerFn(listMessages);
  const sendFn = useServerFn(sendMessage);
  const markReadFn = useServerFn(markConversationRead);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const convQ = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConvFn(),
    enabled: !!user,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (search.c) setActiveId(search.c);
    else if (!activeId && convQ.data?.length) setActiveId(convQ.data[0].id);
  }, [search.c, convQ.data, activeId]);

  const msgQ = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => listMsgFn({ data: { conversation_id: activeId! } }),
    enabled: !!activeId,
  });

  // Mark active conversation read on open + when new messages arrive
  useEffect(() => {
    if (!activeId || !user) return;
    markReadFn({ data: { conversation_id: activeId } }).then(() => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["unread-messages"] });
    });
  }, [activeId, msgQ.data?.length, user, markReadFn, qc]);

  // Realtime: refresh on any new message for me
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("messages-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        (p: any) => {
          qc.invalidateQueries({ queryKey: ["conversations"] });
          qc.invalidateQueries({ queryKey: ["unread-messages"] });
          if (p.new?.conversation_id === activeId) {
            qc.invalidateQueries({ queryKey: ["messages", activeId] });
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc, activeId]);

  // Realtime: also refresh thread when I send (insertions where I'm sender)
  useEffect(() => {
    if (!activeId) return;
    const ch = supabase
      .channel(`thread-${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        () => qc.invalidateQueries({ queryKey: ["messages", activeId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId, qc]);

  const [draft, setDraft] = useState("");
  const sendMut = useMutation({
    mutationFn: (body: string) => sendFn({ data: { conversation_id: activeId!, body } }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: any) => toast.error("Couldn't send", { description: e?.message }),
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgQ.data?.length, activeId]);

  const active = convQ.data?.find((c) => c.id === activeId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-5xl tracking-wide">Messages</h1>

        {convQ.isLoading ? (
          <div className="mt-10 text-center text-sm text-muted-foreground">Loading conversations…</div>
        ) : !convQ.data?.length ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-2xl">No conversations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a listing and tap “Message” to start one.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid h-[70vh] gap-4 overflow-hidden rounded-3xl border border-border bg-card shadow-card md:grid-cols-[280px_1fr]">
            <aside className="overflow-y-auto border-r border-border bg-muted/30">
              {convQ.data.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition ${isActive ? "bg-background" : "hover:bg-background/60"}`}
                  >
                    <img src={c.other.avatar_url ?? fallbackAvatar(c.other.id)} alt={c.other.first_name} className="h-11 w-11 rounded-full bg-muted" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold">{c.other.first_name}</p>
                        <span className="text-[10px] font-medium text-muted-foreground">{timeAgo(c.last_message_at)}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{c.last_message?.body ?? "Say hi 👋"}</p>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {c.unread_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            <section className="flex flex-col">
              {active && (
                <header className="flex items-center gap-3 border-b border-border px-5 py-3">
                  <img src={active.other.avatar_url ?? fallbackAvatar(active.other.id)} alt={active.other.first_name} className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-display text-xl tracking-wide">{active.other.first_name}</p>
                    <p className="text-xs text-muted-foreground">{active.other.lives_in ?? "—"}{active.other.sports[0] ? ` · ${active.other.sports[0]}` : ""}</p>
                  </div>
                </header>
              )}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {msgQ.isLoading && <div className="text-center text-xs text-muted-foreground">Loading…</div>}
                {msgQ.data?.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); if (draft.trim() && activeId) sendMut.mutate(draft.trim()); }}
                className="flex items-center gap-2 border-t border-border bg-card px-4 py-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={active ? `Message ${active.other.first_name}…` : "Pick a conversation"}
                  maxLength={2000}
                  disabled={!activeId || sendMut.isPending}
                  className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 ring-ring/40 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!activeId || !draft.trim() || sendMut.isPending}
                  className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-95 disabled:opacity-50"
                >
                  {sendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
