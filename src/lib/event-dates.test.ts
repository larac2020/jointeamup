import { test } from "node:test";
import assert from "node:assert/strict";
import { eventEnd, listingExpiry, isExpired, validRaceDay, dateRangesNearby } from "./event-dates";

test("existing single-day events end on their start date", () => {
  assert.equal(eventEnd({ event_date: "2026-12-04" }), "2026-12-04");
});
test("multi-day listings expire after the end date, not the start date", () => {
  const event = { event_date: "2026-12-04", end_date: "2026-12-07" };
  assert.equal(listingExpiry(event), "2026-12-07");
  assert.equal(isExpired(event, "2026-12-07"), false);
  assert.equal(isExpired(event, "2026-12-08"), true);
});
test("race day overrides end date and stays visible on that day", () => {
  const listing = { event_date: "2026-12-04", end_date: "2026-12-07", race_day: "2026-12-05" };
  assert.equal(isExpired(listing, "2026-12-05"), false);
  assert.equal(isExpired(listing, "2026-12-06"), true);
});
test("race day must fall inside the inclusive event range", () => {
  const event = { event_date: "2026-12-04", end_date: "2026-12-07" };
  assert.equal(validRaceDay(event, "2026-12-04"), true);
  assert.equal(validRaceDay(event, "2026-12-07"), true);
  assert.equal(validRaceDay(event, "2026-12-03"), false);
  assert.equal(validRaceDay(event, "2026-12-08"), false);
  assert.equal(validRaceDay(event, null), true);
});
test("duplicate suggestions include overlaps and gaps up to seven days only", () => {
  const event = { event_date: "2026-12-04", end_date: "2026-12-07" };
  assert.equal(dateRangesNearby(event, { event_date: "2026-12-06", end_date: "2026-12-10" }), true);
  assert.equal(dateRangesNearby(event, { event_date: "2026-12-14" }), true);
  assert.equal(dateRangesNearby(event, { event_date: "2026-12-15" }), false);
  assert.equal(dateRangesNearby(event, { event_date: "2026-11-27" }), true);
  assert.equal(dateRangesNearby(event, { event_date: "2026-11-26" }), false);
});