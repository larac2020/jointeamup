import Firecrawl from "@mendable/firecrawl-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ScrapedEvent = {
  name: string;
  event_date?: string | null;
  location?: string | null;
};

const eventSchema = {
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          event_date: { type: "string", description: "ISO date YYYY-MM-DD if available" },
          location: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  required: ["events"],
} as const;

function getClient() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");
  return new Firecrawl({ apiKey });
}

export async function scrapeCompetitionsFor(competitionType: string, url: string): Promise<ScrapedEvent[]> {
  const firecrawl = getClient();
  const result: any = await firecrawl.scrape(url, {
    formats: [
      {
        type: "json",
        schema: eventSchema,
        prompt: `Extract every upcoming ${competitionType} race/event listed on this page for the current and next year. Return name (e.g. "${competitionType} Berlin"), event_date as YYYY-MM-DD when visible, and city/country location when visible.`,
      },
    ],
    onlyMainContent: true,
  });
  const json = result?.json ?? result?.data?.json;
  const events: ScrapedEvent[] = Array.isArray(json?.events) ? json.events : [];
  return events.filter((e) => e?.name && typeof e.name === "string");
}

export async function refreshType(competitionType: string): Promise<{ inserted: number; total: number }> {
  const { data: source, error } = await supabaseAdmin
    .from("competition_sources")
    .select("url")
    .eq("competition_type", competitionType)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!source) throw new Error(`No source for ${competitionType}`);

  try {
    const events = await scrapeCompetitionsFor(competitionType, source.url);
    const year = new Date().getFullYear();
    const rows = events.map((e) => {
      const ed = e.event_date && /^\d{4}-\d{2}-\d{2}$/.test(e.event_date) ? e.event_date : null;
      const y = ed ? Number(ed.slice(0, 4)) : year;
      return {
        competition_type: competitionType,
        name: e.name.trim().slice(0, 200),
        event_date: ed,
        location: e.location?.slice(0, 200) ?? null,
        source_url: source.url,
        year: y,
      };
    });

    if (rows.length) {
      const { error: upErr } = await supabaseAdmin
        .from("competitions")
        .upsert(rows, { onConflict: "competition_type,name,year" });
      if (upErr) throw new Error(upErr.message);
    }

    await supabaseAdmin
      .from("competition_sources")
      .update({ last_scraped_at: new Date().toISOString(), last_error: null })
      .eq("competition_type", competitionType);

    return { inserted: rows.length, total: events.length };
  } catch (e: any) {
    await supabaseAdmin
      .from("competition_sources")
      .update({ last_scraped_at: new Date().toISOString(), last_error: String(e?.message ?? e).slice(0, 500) })
      .eq("competition_type", competitionType);
    throw e;
  }
}
