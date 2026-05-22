import { createFileRoute } from "@tanstack/react-router";
import { refreshType } from "@/lib/competitions.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/hooks/refresh-competitions")({
  server: {
    handlers: {
      POST: async () => {
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
