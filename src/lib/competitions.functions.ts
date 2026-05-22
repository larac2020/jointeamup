import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { refreshType } from "./competitions.server";

export type CompetitionRow = {
  id: string;
  competition_type: string;
  name: string;
  event_date: string | null;
  location: string | null;
  year: number;
};

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export const listCompetitions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ competition_type: z.string().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data }): Promise<CompetitionRow[]> => {
    const { competition_type } = data;

    // Check freshness; if stale, fire-and-forget refresh
    const { data: src } = await supabaseAdmin
      .from("competition_sources")
      .select("last_scraped_at")
      .eq("competition_type", competition_type)
      .maybeSingle();

    const stale =
      !src?.last_scraped_at ||
      Date.now() - new Date(src.last_scraped_at).getTime() > STALE_MS;

    if (stale && src) {
      // Don't await — let it fill cache for next request
      refreshType(competition_type).catch((e) => console.error("refreshType failed:", e));
    }

    const thisYear = new Date().getFullYear();
    const { data: rows, error } = await supabaseAdmin
      .from("competitions")
      .select("id, competition_type, name, event_date, location, year")
      .eq("competition_type", competition_type)
      .gte("year", thisYear)
      .order("event_date", { ascending: true, nullsFirst: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []) as CompetitionRow[];
  });

export const suggestCompetition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        competition_type: z.string().min(1).max(60),
        name: z.string().min(2).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("competition_suggestions").insert({
      competition_type: data.competition_type,
      name: data.name.trim(),
      submitted_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
