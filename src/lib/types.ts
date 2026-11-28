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
  competition_id?: string | null;
  id: string;
  author_id: string;
  type: ListingType;
  competition: string;
  competition_type: string;
  competition_date: string;
  event_date: string; // compatibility mirror of competition_date
  end_date: string | null;
  race_day: string | null;
  expires_on?: string;
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
  show_in_directory: boolean;
  open_formats: string[];
  compete_category: string | null;
  divisions: string[];
  travel: string | null;
  strengths: string[];
  available_for: string | null;
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
  "selling-ticket": { label: "Ticket available", tone: "bg-warm text-primary-foreground" },
  "need-teammate": { label: "Teammates wanted", tone: "bg-cool text-primary-foreground" },
  "join-team": { label: "Looking for a team", tone: "bg-secondary text-secondary-foreground" },
};

export const competitionTypes = ["HYROX", "Turf Games", "DEKA", "CrossFit", "Spartan", "Other"] as const;
export { categoryLabel } from "./listing-sports";

export const fallbackAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0ea5b7,0b3b4a,f59e0b&backgroundType=gradientLinear`;
