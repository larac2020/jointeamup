## Add dummy conversations

Seed 4 conversations between **Lara** (real user) and demo athletes, with 3–5 messages each. Tied to existing listings to feel realistic.

### Conversations

1. **Lara ↔ Mara** — about `HYROX Berlin 2026 / need-teammate` listing
   - Mara: "Hey! Saw you're into HYROX too — still looking for a Doubles partner for Berlin?"
   - Lara: "Yes! What's your target time?"
   - Mara: "Sub 1:10. You?"
   - Lara: "Same range. Let's do a trial session next week."

2. **Lara ↔ Liam** — about `HYROX Amsterdam / selling-ticket`
   - Lara: "Hi, is the Amsterdam ticket still available?"
   - Liam: "Yes, women's open. €95, transfer via official portal."
   - Lara: "Perfect, I'll take it. Send the transfer link?"

3. **Lara ↔ Sofia** — about `HYROX Milan / join-team`
   - Sofia: "Hey Lara — saw your profile, would you consider joining our Milan team?"
   - Lara: "Tell me more — what format and level?"
   - Sofia: "Mixed Doubles, sub 1:15 target. We train 4x/week."

4. **Lara ↔ Nora** — about `Turf Games Copenhagen / join-team`
   - Nora: "Hi! Looking for a 4th for Turf Games Copenhagen — interested?"
   - Lara: "Maybe! What's the experience level of the team?"
   - Nora: "All sub-elite, 2 RX finishers. You'd fit perfectly."
   - Lara: "Sounds great. Let's chat on a call this week."

### Technical

- Insert into `conversations` (user_a = Lara, user_b = demo, listing_id set).
- Insert messages with `sender_id`, `recipient_id`, `conversation_id`, staggered `created_at` timestamps (oldest first, last message within past 24h).
- Update `conversations.last_message_at` to match the latest message per thread (trigger handles this on insert, but we set explicitly to be safe).
- All marked unread (no `read_at`) on the last 1–2 incoming messages so Lara sees unread badges.

Uses `supabase--insert`. No schema changes.