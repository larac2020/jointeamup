import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * GDPR Article 15/20 — right of access & data portability.
 * Returns every record the platform holds about the signed-in user,
 * read through their own RLS-scoped client.
 */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profile, consents, listings, conversations, messages, notifications, suggestions] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_consents").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("listings").select("*").eq("author_id", userId),
        supabase.from("conversations").select("*").or(`user_a.eq.${userId},user_b.eq.${userId}`),
        supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
        supabase.from("notifications").select("*").eq("user_id", userId),
        supabase.from("competition_suggestions").select("*").eq("submitted_by", userId),
      ]);

    return {
      exported_at: new Date().toISOString(),
      account: {
        user_id: userId,
        email: (context.claims as { email?: string } | null)?.email ?? null,
      },
      profile: profile.data ?? null,
      consents: consents.data ?? null,
      listings: listings.data ?? [],
      conversations: conversations.data ?? [],
      messages: messages.data ?? [],
      notifications: notifications.data ?? [],
      competition_suggestions: suggestions.data ?? [],
    };
  });

/**
 * GDPR Article 17 — right to erasure.
 * Deletes uploaded photos, the profile row (cascading to listings,
 * conversations, messages, notifications and consents) and finally the
 * auth account itself, so no identifier survives.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Remove uploaded images (stored under a folder named after the user id).
    const { data: files } = await supabaseAdmin.storage.from("avatars").list(userId, { limit: 1000 });
    if (files?.length) {
      await supabaseAdmin.storage
        .from("avatars")
        .remove(files.map((f) => `${userId}/${f.name}`));
    }

    // 2. Remove application data (profiles cascades to everything user-owned).
    const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profileError) throw new Error(profileError.message);
    await supabaseAdmin.from("user_consents").delete().eq("user_id", userId);

    // 3. Remove the login itself.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message);

    return { ok: true };
  });
