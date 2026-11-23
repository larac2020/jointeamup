import { test } from "node:test";
import { strict as assert } from "node:assert";
import { sportFields, changeSportValue, defaultSportValues, validSportValues } from "./listing-sports";

test("Turf Games teams allow Mixed, Men and Women only", () => {
  const fields = sportFields("Turf Games");
  assert.deepEqual(fields.find((field) => field.key === "gender")?.options.map((option) => option.value), ["Mixed", "Men", "Women"]);
  assert.equal(validSportValues("Turf Games", { format: "Team", gender: "Open", skill_level: "Intermediate" }), false);
});

test("Turf Games divisions are Everyday, Intermediate and Elite", () => {
  assert.deepEqual(sportFields("Turf Games").find((field) => field.key === "skill_level")?.options.map((option) => option.value), ["Everyday", "Intermediate", "Elite"]);
  assert.equal(validSportValues("Turf Games", { format: "Team", gender: "Mixed", skill_level: "Intermediate" }), true);
  assert.equal(validSportValues("Turf Games", { format: "Team", gender: "Mixed", skill_level: "Open" }), false);
});

test("Turf Games cannot use Solo or Pairs formats", () => {
  for (const format of ["Individual", "Doubles"] as const) {
    assert.equal(validSportValues("Turf Games", { format, gender: "Mixed", skill_level: "Everyday" }), false);
  }
  assert.equal(defaultSportValues("Turf Games").format, "Team");
});

test("HYROX permits Singles, Doubles and Relay, not Team", () => {
  assert.deepEqual(sportFields("HYROX").find((field) => field.key === "format")?.options.map((option) => option.value), ["Individual", "Doubles", "Relay"]);
  assert.equal(validSportValues("HYROX", { format: "Team", gender: "Mixed", skill_level: "Open" }), false);
});

test("HYROX has Open and Pro divisions for Singles and Doubles", () => {
  for (const format of ["Individual", "Doubles"] as const) {
    assert.equal(validSportValues("HYROX", { format, gender: "Women", skill_level: "Pro" }), true);
    assert.equal(validSportValues("HYROX", { format, gender: "Women", skill_level: "Intermediate" }), false);
  }
});

test("HYROX genders are Men, Women and Mixed", () => {
  assert.deepEqual(sportFields("HYROX").find((field) => field.key === "gender")?.options.map((option) => option.value), ["Men", "Women", "Mixed"]);
  assert.equal(validSportValues("HYROX", { format: "Individual", gender: "Open", skill_level: "Open" }), false);
});

test("HYROX Relay removes Pro and changes a selected Pro division to Open", () => {
  const current = { format: "Doubles", gender: "Mixed", skill_level: "Pro" } as const;
  assert.deepEqual(sportFields("HYROX", "Relay").find((field) => field.key === "skill_level")?.options.map((option) => option.value), ["Open"]);
  assert.equal(changeSportValue("HYROX", current, "format", "Relay").skill_level, "Open");
  assert.equal(validSportValues("HYROX", { ...current, format: "Relay" }), false);
});

test("DEKA, Spartan, CrossFit and Other formats are Individual, Pairs and Team", () => {
  for (const sport of ["DEKA", "Spartan", "CrossFit", "Other"]) {
    assert.deepEqual(sportFields(sport).find((field) => field.key === "format")?.options.map((option) => option.value), ["Individual", "Doubles", "Team"]);
    assert.equal(validSportValues(sport, { format: "Relay", gender: null, skill_level: "Intermediate" }), false);
  }
});

test("DEKA, Spartan, CrossFit and Other levels are Beginner, Intermediate, Advanced and Elite", () => {
  for (const sport of ["DEKA", "Spartan", "CrossFit", "Other"]) {
    assert.deepEqual(sportFields(sport).find((field) => field.key === "skill_level")?.options.map((option) => option.value), ["Beginner", "Intermediate", "Advanced", "Elite"]);
    assert.equal(validSportValues(sport, { format: "Doubles", gender: null, skill_level: "Advanced" }), true);
    assert.equal(validSportValues(sport, { format: "Team", gender: null, skill_level: "RX" }), false);
  }
});