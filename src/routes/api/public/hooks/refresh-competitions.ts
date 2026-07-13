import { createFileRoute } from "@tanstack/react-router";
import { refreshType } from "@/lib/competitions.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export const Route = createFileRoute("/api/public/hooks/refresh-competitions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.REFRESH_COMPETITIONS_SECRET;
        if (!expected) {
          return new Response("Server not configured", { status: 500 });
        }
        const provided = request.headers.get("x-refresh-secret") ?? "";
        if (!provided || !safeEqual(provided, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { data: sources, error } = await supabaseAdmin
          .from("competition_sources")
          .select("competition_type");
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const results: Record<string, unknown> = {};
        for (const s of sources ?? []) {
          try {
            results[s.competition_type] = await refreshType(s.competition_type);
          } catch (e: any) {
            results[s.competition_type] = { error: String(e?.message ?? e) };
          }
        }

        return new Response(JSON.stringify({ ok: true, results }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
