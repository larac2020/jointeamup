export type ListingType = "selling-ticket" | "need-teammate" | "join-team";
export type Format = "Individual" | "Doubles" | "Team" | "Relay";
export type Gender = "Men" | "Women" | "Mixed" | "Open";
export type SkillLevel = string;

export type AuthorBrief = {
  id: string;
  first_name: string;
  nickname: string | null;
  avatar_url: string | null;
  lives_in: string | null;
  sports: string[];
  age: number | null;
  experience: string | null;
  bio: string | null;
};

export type ListingRow = {
  id: string;
  author_id: string;
  type: ListingType;
  competition: string;
  competition_type: string;
  event_date: string; // YYYY-MM-DD
  location: string;
  format: Format;
  gender: Gender | null;
  skill_level: SkillLevel;
  spots: number;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type ListingWithAuthor = ListingRow & { author: AuthorBrief | null };

export type ProfilePublic = AuthorBrief & {
  age: number | null;
  from_location: string | null;
  gyms: string[];
  competitions: string[];
  prs: { name: string; value: string }[];
  superpower: string | null;
  kryptonite: string | null;
  bio: string | null;
  experience: string | null;
  looking_for: string | null;
  photos: string[];
};

export const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Elite", "Pro"] as const;

export const prPresets = [
  "Back Squat", "Front Squat", "Deadlift", "Bench Press", "Strict Press",
  "Snatch", "Clean & Jerk", "Pull-ups (max)", "Burpees (1 min)",
  "Wall Balls (1 min)", "Sled Push", "Sled Pull", "Farmer's Carry",
  "500m Row", "1k Row", "2k Row", "1k Ski-erg",
  "5k Run", "10k Run", "Half Marathon", "Marathon", "HYROX time",
] as const;

export type ConversationListItem = {
  id: string;
  other: AuthorBrief;
  last_message: { body: string; created_at: string; sender_id: string } | null;
  unread_count: number;
  last_message_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export const listingTypeMeta: Record<ListingType, { label: string; tone: string }> = {
  "selling-ticket": { label: "Ticket for sale", tone: "bg-warm text-primary-foreground" },
  "need-teammate": { label: "Need teammate", tone: "bg-cool text-primary-foreground" },
  "join-team": { label: "Looking for team", tone: "bg-secondary text-secondary-foreground" },
};

export const competitionTypes = ["HYROX", "Turf Games", "DEKA", "CrossFit", "Spartan", "Other"] as const;
export const formats: Format[] = ["Individual", "Doubles", "Team", "Relay"];
export const genders: Gender[] = ["Men", "Women", "Mixed", "Open"];

export type Category = {
  label: string;
  format: Format;
  gender: Gender;
  skill_level: string;
};

export const categoriesByType: Record<string, Category[]> = {
  HYROX: [
    { label: "Mixed Doubles", format: "Doubles", gender: "Mixed", skill_level: "Open" },
    { label: "W Open", format: "Individual", gender: "Women", skill_level: "Open" },
    { label: "W Pro", format: "Individual", gender: "Women", skill_level: "Pro" },
    { label: "M Open", format: "Individual", gender: "Men", skill_level: "Open" },
    { label: "M Pro", format: "Individual", gender: "Men", skill_level: "Pro" },
    { label: "Doubles W Open", format: "Doubles", gender: "Women", skill_level: "Open" },
    { label: "Doubles W Pro", format: "Doubles", gender: "Women", skill_level: "Pro" },
    { label: "Doubles M Open", format: "Doubles", gender: "Men", skill_level: "Open" },
    { label: "Doubles M Pro", format: "Doubles", gender: "Men", skill_level: "Pro" },
    { label: "Relay Women", format: "Relay", gender: "Women", skill_level: "Open" },
    { label: "Relay Men", format: "Relay", gender: "Men", skill_level: "Open" },
    { label: "Relay Mixed", format: "Relay", gender: "Mixed", skill_level: "Open" },
  ],
  CrossFit: [
    { label: "RX Men", format: "Individual", gender: "Men", skill_level: "RX" },
    { label: "RX Women", format: "Individual", gender: "Women", skill_level: "RX" },
    { label: "Scaled Men", format: "Individual", gender: "Men", skill_level: "Scaled" },
    { label: "Scaled Women", format: "Individual", gender: "Women", skill_level: "Scaled" },
    { label: "Masters Men", format: "Individual", gender: "Men", skill_level: "Masters" },
    { label: "Masters Women", format: "Individual", gender: "Women", skill_level: "Masters" },
    { label: "Teens", format: "Individual", gender: "Open", skill_level: "Teens" },
    { label: "Team RX", format: "Team", gender: "Mixed", skill_level: "RX" },
    { label: "Team Scaled", format: "Team", gender: "Mixed", skill_level: "Scaled" },
    { label: "Team Elite", format: "Team", gender: "Mixed", skill_level: "Elite" },
  ],
  DEKA: [
    { label: "Solo Open Men", format: "Individual", gender: "Men", skill_level: "Open" },
    { label: "Solo Open Women", format: "Individual", gender: "Women", skill_level: "Open" },
    { label: "Solo Pro Men", format: "Individual", gender: "Men", skill_level: "Pro" },
    { label: "Solo Pro Women", format: "Individual", gender: "Women", skill_level: "Pro" },
    { label: "Doubles Men", format: "Doubles", gender: "Men", skill_level: "Open" },
    { label: "Doubles Women", format: "Doubles", gender: "Women", skill_level: "Open" },
    { label: "Doubles Mixed", format: "Doubles", gender: "Mixed", skill_level: "Open" },
    { label: "Team", format: "Team", gender: "Mixed", skill_level: "Open" },
    { label: "Relay", format: "Relay", gender: "Mixed", skill_level: "Open" },
  ],
  "Turf Games": [
    { label: "Solo Men", format: "Individual", gender: "Men", skill_level: "Open" },
    { label: "Solo Women", format: "Individual", gender: "Women", skill_level: "Open" },
    { label: "Pairs Men", format: "Doubles", gender: "Men", skill_level: "Open" },
    { label: "Pairs Women", format: "Doubles", gender: "Women", skill_level: "Open" },
    { label: "Pairs Mixed", format: "Doubles", gender: "Mixed", skill_level: "Open" },
    { label: "Team", format: "Team", gender: "Mixed", skill_level: "Open" },
  ],
  Spartan: [
    { label: "Open Men", format: "Individual", gender: "Men", skill_level: "Open" },
    { label: "Open Women", format: "Individual", gender: "Women", skill_level: "Open" },
    { label: "Age Group Men", format: "Individual", gender: "Men", skill_level: "Age Group" },
    { label: "Age Group Women", format: "Individual", gender: "Women", skill_level: "Age Group" },
    { label: "Elite Men", format: "Individual", gender: "Men", skill_level: "Elite" },
    { label: "Elite Women", format: "Individual", gender: "Women", skill_level: "Elite" },
    { label: "Team", format: "Team", gender: "Mixed", skill_level: "Open" },
    { label: "Hurricane Heat", format: "Team", gender: "Mixed", skill_level: "Hurricane" },
  ],
  Other: [
    { label: "Individual Men", format: "Individual", gender: "Men", skill_level: "Open" },
    { label: "Individual Women", format: "Individual", gender: "Women", skill_level: "Open" },
    { label: "Individual Mixed", format: "Individual", gender: "Mixed", skill_level: "Open" },
    { label: "Pairs", format: "Doubles", gender: "Mixed", skill_level: "Open" },
    { label: "Team", format: "Team", gender: "Mixed", skill_level: "Open" },
    { label: "Relay", format: "Relay", gender: "Mixed", skill_level: "Open" },
  ],
};

export function getCategories(competitionType: string | undefined | null): Category[] {
  if (!competitionType) return categoriesByType.Other;
  return categoriesByType[competitionType] ?? categoriesByType.Other;
}

export function findCategory(
  tuple: { format: Format; gender: Gender | null; skill_level: string },
  competitionType: string | undefined | null,
): Category | null {
  const list = getCategories(competitionType);
  const g = (tuple.gender ?? "Open") as Gender;
  return (
    list.find(
      (c) =>
        c.format === tuple.format &&
        c.gender === g &&
        c.skill_level.toLowerCase() === tuple.skill_level.toLowerCase(),
    ) ?? null
  );
}

export function categoryLabel(
  tuple: { format: Format; gender: Gender | null; skill_level: string },
  competitionType: string | undefined | null,
): string {
  const found = findCategory(tuple, competitionType);
  if (found) return found.label;
  const parts = [tuple.format, tuple.gender, tuple.skill_level].filter(Boolean) as string[];
  return parts.join(" · ");
}

/** @deprecated kept for back-compat; prefer getCategories(competition_type) */
export const skillLevelsByType: Record<string, string[]> = {
  HYROX: ["Open", "Pro"],
  CrossFit: ["Scaled", "RX", "Masters", "Teens", "Elite"],
  DEKA: ["Open", "Pro"],
  "Turf Games": ["Open", "Elite"],
  Spartan: ["Open", "Age Group", "Elite", "Hurricane"],
  Other: ["Open"],
};

const defaultSkillLevels = ["Open"];

/** @deprecated use getCategories(competition_type) */
export function getSkillLevels(competitionType: string | undefined | null): string[] {
  if (!competitionType) return defaultSkillLevels;
  return skillLevelsByType[competitionType] ?? defaultSkillLevels;
}

/** @deprecated */
export const skillLevels: string[] = ["Open", "Pro", "Scaled", "RX", "Elite", "Fit", "Strong", "Age Group"];

export const fallbackAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0ea5b7,0b3b4a,f59e0b&backgroundType=gradientLinear`;
