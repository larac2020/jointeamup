import { test } from "node:test";
import assert from "node:assert/strict";
import { postedAge } from "./posted-time";

const now = new Date(2026, 10, 25, 16, 23);
const age = (days: number) => postedAge(new Date(2026, 10, 25 - days, 23).toISOString(), now);

test("today and yesterday use calendar days rather than elapsed hours", () => {
  assert.equal(age(0).value, 0);
  assert.equal(age(1).value, 1);
  assert.equal(age(1).unit, "days");
});
test("three days stays in days", () => {
  assert.equal(age(3).unit, "days");
  assert.equal(age(3).value, 3);
});
test("whole weeks start after seven days", () => {
  assert.equal(age(6).unit, "days");
  assert.equal(age(7).unit, "weeks");
  assert.equal(age(14).value, 2);
  assert.equal(age(20).value, 2);
});
test("dates older than sixty days switch to an absolute date", () => {
  assert.equal(age(60).unit, "weeks");
  assert.equal(age(61).unit, "date");
  assert.equal(age(61).value, 61);
});