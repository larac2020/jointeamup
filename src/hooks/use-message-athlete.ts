import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { startDirectConversation } from "@/lib/messages.functions";

/** Opens a chat with an athlete; logged-out visitors go to login and come back to the profile. */
export function useMessageAthlete() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startFn = useServerFn(startDirectConversation);
  const mut = useMutation({
    mutationFn: (otherId: string) => startFn({ data: { other_id: otherId } }),
    onSuccess: ({ conversation_id }) => navigate({ to: "/messages", search: { c: conversation_id } }),
    onError: (e: any) => toast.error("Couldn't start conversation", { description: e?.message }),
  });
  const message = (otherId: string) => {
    if (!user) { void navigate({ to: "/login", search: { redirect: `/profile/${otherId}` } }); return; }
    mut.mutate(otherId);
  };
  return { message, pending: mut.isPending };
}
