import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicSupabaseClient } from "@/lib/supabase-public.server";

export type CompetitionOption = {
  id: string;
  name: string;
  city: string | null;
  event_date: string;
  end_date: string;
  listing_count: number;
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const today = () => new Date().toISOString().slice(0, 10);

/** Public: upcoming user-created events for a competition type. */
export const listCompetitions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ competition_type: z.string().min(1).max(60), q: z.string().max(120).optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<CompetitionOption[]> => {
    const supabase = createPublicSupabaseClient();
    const { data: rows, error } = await supabase.rpc("search_competition_ranges", {
      _type: data.competition_type,
      _q: data.q ?? "",
    });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({ ...r, listing_count: Number(r.listing_count) }));
  });

const newEventSchema = z.object({
  competition_type: z.string().min(1).max(60),
  name: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(120),
  event_date: isoDate,
  end_date: isoDate.optional().nullable(),
}).refine((data) => !data.end_date || data.end_date >= data.event_date, { message: "End date must be on or after start date." });

/** Likely duplicates: similar name, same city, date within ±7 days. Suggestion only. */
export const findCompetitionMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => newEventSchema.parse(input))
  .handler(async ({ data, context }): Promise<CompetitionOption[]> => {
    const { data: rows, error } = await context.supabase.rpc("match_competition_ranges", {
      _type: data.competition_type,
      _name: data.name,
      _city: data.city,
      _date: data.event_date,
      _end_date: data.end_date || data.event_date,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id, name: r.name, city: r.city, event_date: r.event_date, end_date: r.end_date, listing_count: Number(r.listing_count),
    }));
  });

export const createCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => newEventSchema.parse(input))
  .handler(async ({ data, context }): Promise<CompetitionOption> => {
    if ((data.end_date || data.event_date) < today()) throw new Error("The event must end today or later.");
    const { data: row, error } = await context.supabase
      .from("competitions")
      .insert({ ...data, end_date: data.end_date || data.event_date, created_by: context.userId })
      .select("id, name, city, event_date, end_date")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("This event already exists — pick it from the list.");
      throw new Error(error.message);
    }
    return { ...row, end_date: row.end_date ?? row.event_date, listing_count: 0 };
  });
