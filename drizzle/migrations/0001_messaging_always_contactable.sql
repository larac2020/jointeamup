ALTER TABLE public.user_consents ALTER COLUMN contactable_by_athletes SET DEFAULT true;
UPDATE public.user_consents SET contactable_by_athletes = true, contactable_consent_at = coalesce(contactable_consent_at, now());
DROP POLICY IF EXISTS "Participants insert conversations" ON public.conversations;
CREATE POLICY "Participants insert conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_a) OR (auth.uid() = user_b));
DROP POLICY IF EXISTS "Sender inserts message if recipient contactable" ON public.messages;
CREATE POLICY "Sender inserts message" ON public.messages FOR INSERT TO authenticated
  WITH CHECK ((sender_id = auth.uid()) AND EXISTS (SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
      AND (c.user_a = messages.recipient_id OR c.user_b = messages.recipient_id)));
DROP FUNCTION IF EXISTS public.is_user_contactable(uuid);