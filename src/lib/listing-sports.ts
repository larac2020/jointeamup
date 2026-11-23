import type { Format, Gender, ListingType } from "./types";

export type SportValues = { format: Format; gender: Gender | null; skill_level: string };
export type SportField = { key: keyof SportValues; label: string; options: { value: string; label: string }[] };
const options = (...values: string[]) => values.map((value) => ({ value, label: value }));

export function sportFields(sport: string, format?: string): SportField[] {
  sport = sport.toLowerCase() === "hyrox" ? "HYROX" : sport.toLowerCase() === "turf games" ? "Turf Games" : sport;
  if (sport === "Turf Games") return [
    { key: "gender", label: "Team", options: options("Mixed", "Men", "Women") },
    { key: "skill_level", label: "Division", options: options("Everyday", "Intermediate", "Elite") },
  ];
  if (sport === "HYROX") return [
    { key: "format", label: "Format", options: [{ value: "Individual", label: "Singles" }, { value: "Doubles", label: "Doubles" }, { value: "Relay", label: "Relay" }] },
    { key: "skill_level", label: "Division", options: format === "Relay" ? options("Open") : options("Open", "Pro") },
    { key: "gender", label: "Gender", options: options("Men", "Women", "Mixed") },
  ];
  return [
    { key: "format", label: "Format", options: [{ value: "Individual", label: "Individual" }, { value: "Doubles", label: "Pairs" }, { value: "Team", label: "Team" }] },
    { key: "skill_level", label: "Level", options: options("Beginner", "Intermediate", "Advanced", "Elite") },
  ];
}

export function defaultSportValues(sport: string): SportValues & { gender: Gender } {
  sport = sport.toLowerCase() === "hyrox" ? "HYROX" : sport.toLowerCase() === "turf games" ? "Turf Games" : sport;
  if (sport === "Turf Games") return { format: "Team", gender: "Mixed", skill_level: "Everyday" };
  if (sport === "HYROX") return { format: "Doubles", gender: "Mixed", skill_level: "Open" };
  return { format: "Individual", gender: "Open", skill_level: "Beginner" };
}

export function changeSportValue(sport: string, current: SportValues, key: keyof SportValues, value: string): SportValues {
  sport = sport.toLowerCase() === "hyrox" ? "HYROX" : sport.toLowerCase() === "turf games" ? "Turf Games" : sport;
  const next = { ...current, [key]: value } as SportValues;
  if (sport === "Turf Games") next.format = "Team";
  if (sport === "HYROX" && next.format === "Relay") next.skill_level = "Open";
  return next;
}

export function validSportValues(sport: string, values: SportValues): boolean {
  sport = sport.toLowerCase() === "hyrox" ? "HYROX" : sport.toLowerCase() === "turf games" ? "Turf Games" : sport;
  if (sport === "Turf Games" && values.format !== "Team") return false;
  return sportFields(sport, values.format).every((field) => field.options.some((option) => option.value === values[field.key]));
}

export function categoryLabel(values: SportValues, sport: string | null | undefined): string {
  sport = sport?.toLowerCase() === "hyrox" ? "HYROX" : sport?.toLowerCase() === "turf games" ? "Turf Games" : sport;
  const fields = sportFields(sport ?? "Other", values.format);
  const label = (key: keyof SportValues) => fields.find((field) => field.key === key)?.options.find((option) => option.value === values[key])?.label ?? values[key];
  return (sport === "Turf Games" ? ["Team", label("gender"), label("skill_level")]
    : sport === "HYROX" ? [label("format"), label("gender"), label("skill_level")]
    : [label("format"), label("skill_level")]).filter(Boolean).join(" · ");
}

export function spotsLabel(type: ListingType): string {
  return type === "need-teammate" ? "Teammates needed" : type === "selling-ticket" ? "Tickets available" : "Spots available";
}