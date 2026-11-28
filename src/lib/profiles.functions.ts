import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicSupabaseClient } from "@/lib/supabase-public.server";
import type { ProfilePublic } from "@/lib/types";
import { ALL_DIVISIONS, AVAILABLE_FOR_MAX, OPEN_FORMATS, STRENGTHS, TRAVEL_OPTIONS, divisionOptions } from "@/lib/athlete-directory";

// Public-facing columns only. Excludes `onboarded` and timestamps.
// Owner-side edit flows fetch the full row through the authenticated Supabase client,
// which sees all columns via RLS as the row owner.
const COLS =
  "id, first_name, nickname, avatar_url, lives_in, from_location, sports, age, gyms, competitions, prs, superpower, kryptonite, bio, experience, looking_for, photos, show_in_directory, open_formats, compete_category, divisions, travel, strengths, available_for";

// "Looking to team up" details are only public while the athlete is opted in.
function publicShape(row: ProfilePublic): ProfilePublic {
  if (row.show_in_directory) return row;
  return { ...row, open_formats: [], compete_category: null, divisions: [], travel: null, strengths: [], available_for: null };
}

export const getProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<ProfilePublic | null> => {
    const supabase = createPublicSupabaseClient();
    const { data: row, error } = await supabase
      .from("profiles")
      .select(COLS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? publicShape(row as unknown as ProfilePublic) : null;
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
    const supabase = createPublicSupabaseClient();
    let q = supabase
      .from("profiles")
      .select(COLS)
      .order("updated_at", { ascending: false })
      .limit(data.limit ?? 60);
    if (data.query) q = q.or(`first_name.ilike.%${data.query}%,nickname.ilike.%${data.query}%,superpower.ilike.%${data.query}%`);
    if (data.location) q = q.ilike("lives_in", `%${data.location}%`);
    if (data.sport) q = q.contains("sports", [data.sport]);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as ProfilePublic[];
  });

const directorySchema = z.object({
  query: z.string().trim().max(120).optional(),
  competition: z.string().max(60).optional(),
  format: z.enum(OPEN_FORMATS).optional(),
  category: z.enum(["Men", "Women"]).optional(),
  division: z.string().max(40).optional(),
  location: z.string().trim().max(80).optional(),
  travel: z.enum(TRAVEL_OPTIONS).optional(),
  strengths: z.array(z.enum(STRENGTHS)).max(6).optional(),
  exclude_id: z.string().uuid().optional(),
}).default({});

// Clean free text before it goes into a PostgREST or() filter.
const safeText = (v: string) => v.replace(/[%,()*\\]/g, " ").trim();

/** Directory: only onboarded athletes who opted in are ever returned. */
export const listDirectoryAthletes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => directorySchema.parse(input))
  .handler(async ({ data }): Promise<ProfilePublic[]> => {
    const supabase = createPublicSupabaseClient();
    let q = supabase.from("profiles").select(COLS)
      .eq("onboarded", true).eq("show_in_directory", true)
      .order("updated_at", { ascending: false }).limit(100);
    if (data.exclude_id) q = q.neq("id", data.exclude_id);
    const text = data.query ? safeText(data.query) : "";
    if (text) q = q.or(`first_name.ilike.%${text}%,nickname.ilike.%${text}%,lives_in.ilike.%${text}%`);
    const loc = data.location ? safeText(data.location) : "";
    if (loc) q = q.ilike("lives_in", `%${loc}%`);
    if (data.competition) q = q.contains("sports", [data.competition]);
    if (data.format) q = q.contains("open_formats", [data.format]);
    if (data.category) q = q.eq("compete_category", data.category);
    if (data.travel) q = q.eq("travel", data.travel);
    if (data.strengths?.length) q = q.contains("strengths", data.strengths);
    if (data.division) {
      const d = divisionOptions(data.competition ?? "");
      if (d.options.includes(data.division)) q = d.field === "experience" ? q.eq("experience", data.division) : q.contains("divisions", [data.division]);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as ProfilePublic[];
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
  prs: z.array(prSchema).max(30),
  superpower: z.string().trim().max(80).nullable().optional(),
  kryptonite: z.string().trim().max(80).nullable().optional(),
  avatar_url: z.string().url().max(500).nullable().optional(),
  bio: z.string().trim().max(600).nullable().optional(),
  experience: z.string().trim().max(40).nullable().optional(),
  looking_for: z.string().trim().max(280).nullable().optional(),
  photos: z.array(z.string().url().max(500)).max(4),
  show_in_directory: z.boolean(),
  open_formats: z.array(z.enum(OPEN_FORMATS)).max(5),
  compete_category: z.enum(["Men", "Women"]).nullable(),
  divisions: z.array(z.enum(ALL_DIVISIONS)).max(5),
  travel: z.enum(TRAVEL_OPTIONS).nullable(),
  strengths: z.array(z.enum(STRENGTHS)).max(6),
  available_for: z.string().trim().max(AVAILABLE_FOR_MAX).nullable(),
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
        bio: data.bio ?? null,
        experience: data.experience ?? null,
        looking_for: data.looking_for ?? null,
        photos: data.photos,
        show_in_directory: data.show_in_directory,
        open_formats: data.open_formats,
        compete_category: data.compete_category,
        divisions: data.divisions,
        travel: data.travel,
        strengths: data.strengths,
        available_for: data.available_for || null,
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

/** Turn directory visibility on/off; any answer also marks the one-time prompt as seen. */
export const setDirectoryVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ visible: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles")
      .update({ show_in_directory: data.visible, directory_prompted: true }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
