import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicSupabaseClient } from "@/lib/supabase-public.server";
import type { AuthorBrief, ListingRow, ListingWithAuthor } from "@/lib/types";

import { isExpired, validRaceDay } from "@/lib/event-dates";
import { validSportValues } from "@/lib/listing-sports";

const LISTING_PUBLIC_COLS =
  "id, author_id, type, competition_id, competition, competition_type, event_date, end_date, race_day, expires_on, location, format, gender, skill_level, spots, description, is_active, created_at";

const today = () => new Date().toISOString().slice(0, 10);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const filterSchema = z.object({
  type: z.enum(["selling-ticket", "need-teammate", "join-team"]).optional(),
  competition_type: z.string().min(1).max(60).optional(),
  format: z.enum(["Individual", "Doubles", "Team", "Relay"]).optional(),
  skill_level: z.string().min(1).max(40).optional(),
  gender: z.enum(["Men", "Women", "Mixed", "Open"]).optional(),
  location: z.string().min(1).max(80).optional(),
  query: z.string().min(1).max(120).optional(),
  date_from: isoDate.optional(),
  date_to: isoDate.optional(),
  limit: z.number().min(1).max(100).optional(),
}).default({});

const AUTHOR_COLS = "id, first_name, nickname, avatar_url, lives_in, sports, age, experience, bio";

export const listListings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => filterSchema.parse(input))
  .handler(async ({ data }): Promise<ListingWithAuthor[]> => {
    const supabase = createPublicSupabaseClient();
    let q = supabase
      .from("listings")
      .select(LISTING_PUBLIC_COLS)
      .eq("is_active", true)
      .gte("expires_on", today())
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 60);

    if (data.type) q = q.eq("type", data.type);
    if (data.competition_type) q = q.ilike("competition_type", data.competition_type);
    if (data.format) q = q.eq("format", data.format);
    if (data.skill_level) q = q.eq("skill_level", data.skill_level);
    if (data.gender) q = q.eq("gender", data.gender);
    if (data.location) q = q.ilike("location", `%${data.location}%`);
    if (data.date_from) q = q.gte("event_date", data.date_from);
    if (data.date_to) q = q.lte("event_date", data.date_to);
    if (data.query) q = q.or(`competition.ilike.%${data.query}%,description.ilike.%${data.query}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    const authors: Record<string, AuthorBrief> = {};
    if (authorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select(AUTHOR_COLS)
        .in("id", authorIds);
      for (const p of profs ?? []) authors[p.id] = p as AuthorBrief;
    }

    return (rows ?? []).map((r) => ({ ...(r as ListingRow), author: authors[r.author_id] ?? null }));
  });

export const getListing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<ListingWithAuthor | null> => {
    const supabase = createPublicSupabaseClient();
    const { data: row, error } = await supabase
      .from("listings")
      .select(LISTING_PUBLIC_COLS)
      .eq("id", data.id)
      .eq("is_active", true)
      .gte("expires_on", today())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: author } = await supabase
      .from("profiles")
      .select(AUTHOR_COLS)
      .eq("id", row.author_id)
      .maybeSingle();
    return { ...(row as ListingRow), author: (author as AuthorBrief | null) ?? null };
  });

export const listListingsByAuthor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ author_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<ListingRow[]> => {
    const supabase = createPublicSupabaseClient();
    const { data: rows, error } = await supabase
      .from("listings")
      .select(LISTING_PUBLIC_COLS)
      .eq("author_id", data.author_id)
      .eq("is_active", true)
      .gte("expires_on", today())
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as ListingRow[];
  });

export const listMyListings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ListingRow[]> => {
    const { data: rows, error } = await context.supabase
      .from("listings")
      .select("*")
      .eq("author_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as ListingRow[];
  });

const createSchema = z.object({
  type: z.enum(["selling-ticket", "need-teammate", "join-team"]),
  competition_id: z.string().uuid(),
  competition: z.string().min(2).max(200),
  competition_type: z.string().min(1).max(60),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  race_day: isoDate.optional().nullable(),
  location: z.string().max(120).optional().default(""),
  format: z.enum(["Individual", "Doubles", "Team", "Relay"]),
  skill_level: z.string().min(1).max(40),
  gender: z.enum(["Men", "Women", "Mixed", "Open"]).optional().nullable(),
  spots: z.number().int().min(1).max(20),
  description: z.string().max(2000).optional().default(""),
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!validSportValues(data.competition_type, { ...data, gender: data.gender ?? null })) throw new Error("Choose valid competition-specific fields.");
    const ev = await resolveCompetition(supabase, data.competition_id, data.competition_type, data.race_day);
    const { data: row, error } = await supabase
      .from("listings")
      .insert({ ...data, ...ev, author_id: userId, gender: data.gender ?? null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deactivateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("listings")
      .update({ is_active: false })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateSchema = createSchema.extend({ id: z.string().uuid(), is_active: z.boolean().optional() });

export const updateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    await assertNotExpired(context.supabase, id);
    if (!validSportValues(rest.competition_type, { ...rest, gender: rest.gender ?? null })) throw new Error("Choose valid competition-specific fields.");
    const ev = await resolveCompetition(context.supabase, rest.competition_id, rest.competition_type, rest.race_day);
    const { error } = await context.supabase
      .from("listings")
      .update({ ...rest, ...ev, gender: rest.gender ?? null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reactivateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertNotExpired(context.supabase, data.id);
    const { error } = await context.supabase
      .from("listings")
      .update({ is_active: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** The linked event is the source of truth for name, date and city. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveCompetition(supabase: any, competitionId: string, competitionType: string, raceDay?: string | null) {
  const { data: c } = await supabase
    .from("competitions")
    .select("id, name, city, event_date, end_date, competition_type")
    .eq("id", competitionId)
    .maybeSingle();
  if (!c) throw new Error("Pick an upcoming event for this listing.");
  if (c.competition_type !== competitionType) throw new Error("The event doesn't match the competition type.");
  if (!validRaceDay(c, raceDay)) throw new Error("Race day must fall within the event dates.");
  if (isExpired({ ...c, race_day: raceDay })) throw new Error("Choose an upcoming race day or event.");
  return { end_date: c.end_date ?? c.event_date, race_day: raceDay || null, competition_id: c.id, competition: c.name, event_date: c.event_date, location: c.city ?? "" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertNotExpired(supabase: any, id: string) {
  const { data: row } = await supabase.from("listings").select("event_date, end_date, race_day").eq("id", id).maybeSingle();
  if (!row) throw new Error("Listing not found");
  if (isExpired(row)) throw new Error("Expired listings can't be edited or reactivated.");
}

/** Owner-only view of a single listing (includes deactivated/expired). */
export const getMyListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<ListingWithAuthor | null> => {
    const { data: row, error } = await context.supabase
      .from("listings")
      .select(LISTING_PUBLIC_COLS)
      .eq("id", data.id)
      .eq("author_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: author } = await context.supabase
      .from("profiles")
      .select(AUTHOR_COLS)
      .eq("id", row.author_id)
      .maybeSingle();
    return { ...(row as ListingRow), author: (author as AuthorBrief | null) ?? null };
  });

/** Permanently delete one of your own expired or deactivated listings. Conversations keep working (their listing link is cleared). */
export const deleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error: rErr } = await context.supabase
      .from("listings")
      .select("id, author_id, is_active, event_date, end_date, race_day")
      .eq("id", data.id)
      .maybeSingle();
    if (rErr) throw new Error(rErr.message);
    if (!row || row.author_id !== context.userId) throw new Error("Listing not found");
    if (row.is_active && !isExpired(row)) {
      throw new Error("Deactivate this listing before deleting it.");
    }
    const { error } = await context.supabase
      .from("listings")
      .delete()
      .eq("id", data.id)
      .eq("author_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
