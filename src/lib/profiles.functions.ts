import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ProfilePublic } from "@/lib/types";

const COLS =
  "id, first_name, nickname, avatar_url, lives_in, sports, age, from_location, gyms, competitions, prs, superpower, kryptonite, bio, experience, looking_for, photos";

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

const prSchema = z.object({ name: z.string().min(1).max(60), value: z.string().min(1).max(60) });

const updateSchema = z.object({
  first_name: z.string().trim().min(1).max(60),
  nickname: z.string().trim().max(40).nullable().optional(),
  age: z.number().int().min(13).max(120).nullable().optional(),
  from_location: z.string().trim().max(80).nullable().optional(),
  lives_in: z.string().trim().max(80).nullable().optional(),
  sports: z.array(z.string().min(1).max(40)).max(20),
  gyms: z.array(z.string().min(1).max(80)).max(20),
  competitions: z.array(z.string().min(1).max(120)).max(40),
  prs: z.array(prSchema).max(20),
  superpower: z.string().trim().max(80).nullable().optional(),
  kryptonite: z.string().trim().max(80).nullable().optional(),
  avatar_url: z.string().url().max(500).nullable().optional(),
  onboarded: z.boolean().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        first_name: data.first_name,
        nickname: data.nickname ?? null,
        age: data.age ?? null,
        from_location: data.from_location ?? null,
        lives_in: data.lives_in ?? null,
        sports: data.sports,
        gyms: data.gyms,
        competitions: data.competitions,
        prs: data.prs,
        superpower: data.superpower ?? null,
        kryptonite: data.kryptonite ?? null,
        avatar_url: data.avatar_url ?? null,
        ...(data.onboarded !== undefined ? { onboarded: data.onboarded } : {}),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markOnboarded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ onboarded: true })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
