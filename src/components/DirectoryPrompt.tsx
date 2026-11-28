import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { setDirectoryVisibility } from "@/lib/profiles.functions";

/** One-time "Want teams to find you?" card. Either answer marks the prompt as seen. */
export function DirectoryPrompt({ onDone }: { onDone: () => void }) {
  const { refresh } = useAuth();
  const qc = useQueryClient();
  const setFn = useServerFn(setDirectoryVisibility);
  const [busy, setBusy] = useState<"yes" | "no" | null>(null);
  const answer = async (visible: boolean) => {
    setBusy(visible ? "yes" : "no");
    try {
      await setFn({ data: { visible } });
      await refresh();
      qc.invalidateQueries({ queryKey: ["athletes"] });
      if (visible) toast.success("You're now in Find athletes");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(null);
      onDone();
    }
  };
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card" role="dialog" aria-label="Want teams to find you?">
      <div className="flex items-center gap-2 text-primary"><Users className="h-5 w-5" /><p className="text-xs font-bold uppercase tracking-[0.25em]">Find athletes</p></div>
      <h2 className="mt-2 font-display text-3xl tracking-wide">Want teams to find you?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Teams looking for teammates can find you and message you. You can change this anytime in Settings.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button disabled={!!busy} onClick={() => answer(true)} className="inline-flex items-center gap-2 rounded-full bg-warm px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-blaze disabled:opacity-60">
          {busy === "yes" && <Loader2 className="h-4 w-4 animate-spin" />} Show me in Find athletes
        </button>
        <button disabled={!!busy} onClick={() => answer(false)} className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-60">
          Not now
        </button>
      </div>
    </div>
  );
}

export function DirectoryPromptOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
      <div className="w-full max-w-md"><DirectoryPrompt onDone={onDone} /></div>
    </div>
  );
}
