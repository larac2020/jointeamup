import { test } from "node:test";
import assert from "node:assert/strict";
import { athleteCount, divisionOptions } from "./athlete-directory";

test("HYROX offers Open and Pro divisions", () => assert.deepEqual(divisionOptions("HYROX Doubles").options, ["Open", "Pro"]));
test("Turf Games offers Everyday, Intermediate and Elite", () => assert.deepEqual(divisionOptions("Turf Games").options, ["Everyday", "Intermediate", "Elite"]));
test("other competitions filter on general level", () => assert.equal(divisionOptions("DEKA").field, "experience"));
test("result count is singular for one athlete", () => { assert.equal(athleteCount(1), "1 athlete"); assert.equal(athleteCount(5), "5 athletes"); });
