import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ProfilePublic } from "@/lib/types";

const COLS =
  "id, first_name, nickname, avatar_url, lives_in, sports, age, from_location, gyms, competitions, prs, superpower, kryptonite";

export const getProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<ProfilePublic | null> => {
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .select(COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as ProfilePublic | null) ?? null;
  });

export const listProfiles = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      query: z.string().min(1).max(120).optional(),
      sport: z.string().min(1).max(60).optional(),
      location: z.string().min(1).max(80).optional(),
      limit: z.number().min(1).max(100).optional(),
    }).default({}).parse(input),
  )
  .handler(async ({ data }): Promise<ProfilePublic[]> => {
    let q = supabaseAdmin
      .from("profiles")
      .select(COLS)
      .eq("onboarded", true)
      .order("updated_at", { ascending: false })
      .limit(data.limit ?? 60);
    if (data.query) q = q.or(`first_name.ilike.%${data.query}%,nickname.ilike.%${data.query}%,superpower.ilike.%${data.query}%`);
    if (data.location) q = q.ilike("lives_in", `%${data.location}%`);
    if (data.sport) q = q.contains("sports", [data.sport]);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as ProfilePublic[];
  });
