import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AuthorBrief, ConversationListItem, MessageRow } from "@/lib/types";

const AUTHOR_COLS = "id, first_name, nickname, avatar_url, lives_in, sports";

export const listMyConversations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConversationListItem[]> => {
    const { supabase, userId } = context;
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    if (!convs?.length) return [];

    const otherIds = Array.from(
      new Set(convs.map((c) => (c.user_a === userId ? c.user_b : c.user_a))),
    );
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select(AUTHOR_COLS)
      .in("id", otherIds);
    const profMap: Record<string, AuthorBrief> = {};
    for (const p of profs ?? []) profMap[p.id] = p as AuthorBrief;

    const convIds = convs.map((c) => c.id);
    const { data: lastMsgs } = await supabase
      .from("messages")
      .select("conversation_id, body, created_at, sender_id, recipient_id, read_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    const lastByConv: Record<string, { body: string; created_at: string; sender_id: string }> = {};
    const unreadByConv: Record<string, number> = {};
    for (const m of lastMsgs ?? []) {
      if (!lastByConv[m.conversation_id]) {
        lastByConv[m.conversation_id] = { body: m.body, created_at: m.created_at, sender_id: m.sender_id };
      }
      if (m.recipient_id === userId && !m.read_at) {
        unreadByConv[m.conversation_id] = (unreadByConv[m.conversation_id] ?? 0) + 1;
      }
    }

    return convs.map((c) => {
      const otherId = c.user_a === userId ? c.user_b : c.user_a;
      const other =
        profMap[otherId] ??
        ({ id: otherId, first_name: "Athlete", nickname: null, avatar_url: null, lives_in: null, sports: [] } as AuthorBrief);
      return {
        id: c.id,
        other,
        last_message: lastByConv[c.id] ?? null,
        unread_count: unreadByConv[c.id] ?? 0,
        last_message_at: c.last_message_at,
      };
    });
  });

export const listMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ conversation_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<MessageRow[]> => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", data.conversation_id)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []) as MessageRow[];
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      conversation_id: z.string().uuid(),
      body: z.string().min(1).max(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: conv, error: cErr } = await supabase
      .from("conversations")
      .select("user_a, user_b")
      .eq("id", data.conversation_id)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!conv) throw new Error("Conversation not found");
    const recipient = conv.user_a === userId ? conv.user_b : conv.user_a;
    const { error } = await supabase.from("messages").insert({
      conversation_id: data.conversation_id,
      sender_id: userId,
      recipient_id: recipient,
      body: data.body,
    });
    if (error) {
      if (error.message.toLowerCase().includes("row-level security")) {
        throw new Error("This athlete hasn't opted in to be contacted.");
      }
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const markConversationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ conversation_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", data.conversation_id)
      .eq("recipient_id", userId)
      .is("read_at", null);
    return { ok: true };
  });

export const startConversationFromListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ listing_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: listing, error: lErr } = await supabase
      .from("listings")
      .select("id, author_id")
      .eq("id", data.listing_id)
      .maybeSingle();
    if (lErr) throw new Error(lErr.message);
    if (!listing) throw new Error("Listing not found");
    if (listing.author_id === userId) {
      throw new Error("You can't message yourself about your own listing.");
    }
    const a = userId < listing.author_id ? userId : listing.author_id;
    const b = userId < listing.author_id ? listing.author_id : userId;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_a", a)
      .eq("user_b", b)
      .eq("listing_id", listing.id)
      .maybeSingle();
    if (existing) return { conversation_id: existing.id as string };

    const { data: inserted, error: iErr } = await supabase
      .from("conversations")
      .insert({ user_a: a, user_b: b, listing_id: listing.id })
      .select("id")
      .single();
    if (iErr) {
      if (iErr.message.toLowerCase().includes("row-level security")) {
        throw new Error("This athlete hasn't opted in to be contacted yet.");
      }
      throw new Error(iErr.message);
    }
    return { conversation_id: inserted.id as string };
  });

export const unreadMessageCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<number> => {
    const { supabase, userId } = context;
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null);
    return count ?? 0;
  });
