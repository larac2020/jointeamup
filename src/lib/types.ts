export type ListingType = "selling-ticket" | "need-teammate" | "join-team";
export type Format = "Individual" | "Doubles" | "Team";
export type Gender = "Men" | "Women" | "Mixed" | "Open";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Elite";

export type AuthorBrief = {
  id: string;
  first_name: string;
  nickname: string | null;
  avatar_url: string | null;
  lives_in: string | null;
  sports: string[];
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
};

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

export const competitionTypes = ["HYROX", "Turf Games", "DEKA", "CrossFit", "Spartan"] as const;
export const formats: Format[] = ["Individual", "Doubles", "Team"];
export const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced", "Elite"];
export const genders: Gender[] = ["Men", "Women", "Mixed", "Open"];

export const fallbackAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0ea5b7,0b3b4a,f59e0b&backgroundType=gradientLinear`;
