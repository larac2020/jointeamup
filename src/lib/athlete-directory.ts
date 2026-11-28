// Browser-safe choices and rules for the "Find athletes" directory.
export const DIRECTORY_COMPETITIONS = ["HYROX", "HYROX Doubles", "Turf Games", "CrossFit", "DEKA", "Spartan", "Running", "Rowing", "Triathlon"] as const;
export const OPEN_FORMATS = ["Doubles", "Relay", "Team", "Pairs", "Individual"] as const;
export const COMPETE_CATEGORIES = [{ value: "Men", label: "Men's" }, { value: "Women", label: "Women's" }] as const;
export const TURF_DIVISIONS = ["Everyday", "Intermediate", "Elite"] as const;
export const HYROX_DIVISIONS = ["Open", "Pro"] as const;
export const ALL_DIVISIONS = [...TURF_DIVISIONS, ...HYROX_DIVISIONS] as const;
export const TRAVEL_OPTIONS = ["Local only", "Anywhere in the UK", "Europe", "Anywhere"] as const;
export const STRENGTHS = ["Running", "Strength", "Engine", "Gymnastics", "Rowing", "Sled work"] as const;
export const AVAILABLE_FOR_MAX = 80;

/** Level/division filter options depend on the chosen competition, like listing filters. */
export function divisionOptions(competition: string): { field: "divisions" | "experience"; label: string; options: string[] } {
  const c = competition.toLowerCase();
  if (c.startsWith("hyrox")) return { field: "divisions", label: "Division", options: [...HYROX_DIVISIONS] };
  if (c === "turf games") return { field: "divisions", label: "Division", options: [...TURF_DIVISIONS] };
  if (!c) return { field: "divisions", label: "Level / division", options: [...ALL_DIVISIONS] };
  return { field: "experience", label: "Level", options: ["Beginner", "Intermediate", "Advanced", "Elite", "Pro"] };
}

export const categoryText = (v: string | null | undefined) => (v === "Men" ? "Men's" : v === "Women" ? "Women's" : null);
export const athleteCount = (n: number) => `${n} ${n === 1 ? "athlete" : "athletes"}`;
