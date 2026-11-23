import { test } from "node:test";
import assert from "node:assert/strict";
import { eventEnd, listingExpiry, isExpired, dateRangesNearby } from "./event-dates";

test("single-day events use their own date", () => {
  assert.equal(eventEnd({ event_date: "2026-12-03" }), "2026-12-03");
});
test("listing expires after its own competition date, not the shared range", () => {
  const listing = { competition_date: "2026-12-05", event_date: "2026-12-03", end_date: "2026-12-06" };
  assert.equal(listingExpiry(listing), "2026-12-05");
  assert.equal(isExpired(listing, "2026-12-05"), false);
  assert.equal(isExpired(listing, "2026-12-06"), true);
});
test("existing Hyrox London and Winter TurfGames retain their dates", () => {
  assert.equal(listingExpiry({ event_date: "2026-12-03" }), "2026-12-03");
  assert.equal(listingExpiry({ event_date: "2027-02-06" }), "2027-02-06");
});
test("duplicate suggestions use event ranges with an inclusive seven-day gap", () => {
  const event = { event_date: "2026-12-03", end_date: "2026-12-06" };
  assert.equal(dateRangesNearby(event, { event_date: "2026-12-13" }), true);
  assert.equal(dateRangesNearby(event, { event_date: "2026-12-14" }), false);
  assert.equal(dateRangesNearby(event, { event_date: "2026-11-26" }), true);
  assert.equal(dateRangesNearby(event, { event_date: "2026-11-25" }), false);
});
