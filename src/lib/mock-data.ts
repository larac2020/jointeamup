export type Athlete = {
  id: string;
  firstName: string;
  nickname?: string;
  age: number;
  from: string;
  livesIn: string;
  sports: string[];
  gyms: string[];
  competitions: string[];
  prs: { name: string; value: string }[];
  superpower: string;
  kryptonite: string;
  avatar: string;
};

export type Listing = {
  id: string;
  type: "selling-ticket" | "need-teammate" | "join-team";
  competition: string;
  competitionType: string;
  date: string;
  location: string;
  format: "Individual" | "Doubles" | "Team";
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Elite";
  gender?: "Men" | "Women" | "Mixed" | "Open";
  spots: number;
  description: string;
  authorId: string;
  postedAt: string;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=ff6b35,f7931e,e84393,6c5ce7&backgroundType=gradientLinear`;

export const athletes: Athlete[] = [
  {
    id: "a1",
    firstName: "Maya",
    nickname: "Sledgehammer",
    age: 28,
    from: "Lisbon, PT",
    livesIn: "Berlin, DE",
    sports: ["HYROX", "CrossFit", "Running"],
    gyms: ["Urban Forge Berlin", "PerformX"],
    competitions: ["HYROX Berlin 2024", "Turf Games London 2023"],
    prs: [
      { name: "HYROX Singles", value: "1:08:42" },
      { name: "5K", value: "19:24" },
      { name: "Deadlift", value: "150 kg" },
    ],
    superpower: "Sled Push",
    kryptonite: "Wall Balls",
    avatar: avatar("maya"),
  },
  {
    id: "a2",
    firstName: "Theo",
    nickname: "Cardio Killer",
    age: 32,
    from: "Manchester, UK",
    livesIn: "Amsterdam, NL",
    sports: ["HYROX", "Hyrox Doubles", "Rowing"],
    gyms: ["Vondel Gym"],
    competitions: ["HYROX Amsterdam 2024", "DEKA STRONG Rotterdam"],
    prs: [
      { name: "HYROX Doubles", value: "1:02:11" },
      { name: "2K Row", value: "6:38" },
    ],
    superpower: "Rowing",
    kryptonite: "Burpee Broad Jumps",
    avatar: avatar("theo"),
  },
  {
    id: "a3",
    firstName: "Aïcha",
    age: 26,
    from: "Casablanca, MA",
    livesIn: "Paris, FR",
    sports: ["Turf Games", "CrossFit"],
    gyms: ["CrossFit République"],
    competitions: ["Turf Games Paris 2024"],
    prs: [
      { name: "Snatch", value: "65 kg" },
      { name: "Fran", value: "3:12" },
    ],
    superpower: "Gymnastics",
    kryptonite: "Sled Pull",
    avatar: avatar("aicha"),
  },
  {
    id: "a4",
    firstName: "Jonas",
    nickname: "The Engine",
    age: 35,
    from: "Copenhagen, DK",
    livesIn: "Copenhagen, DK",
    sports: ["HYROX", "Triathlon"],
    gyms: ["Nordic Strength"],
    competitions: ["HYROX World Champs Nice 2024"],
    prs: [
      { name: "HYROX Singles", value: "1:04:55" },
      { name: "Half Marathon", value: "1:21" },
    ],
    superpower: "Running",
    kryptonite: "Lunges",
    avatar: avatar("jonas"),
  },
  {
    id: "a5",
    firstName: "Priya",
    nickname: "Pocket Rocket",
    age: 24,
    from: "Mumbai, IN",
    livesIn: "London, UK",
    sports: ["HYROX", "Running"],
    gyms: ["BLOK Shoreditch"],
    competitions: ["HYROX London 2024"],
    prs: [
      { name: "HYROX Singles", value: "1:14:30" },
      { name: "1K Row", value: "3:42" },
    ],
    superpower: "Burpees",
    kryptonite: "Farmers Carry",
    avatar: avatar("priya"),
  },
  {
    id: "a6",
    firstName: "Marco",
    age: 30,
    from: "Milan, IT",
    livesIn: "Barcelona, ES",
    sports: ["HYROX Doubles", "Functional Fitness"],
    gyms: ["CrossFit Eixample"],
    competitions: ["HYROX Barcelona 2024", "HYROX Madrid 2023"],
    prs: [
      { name: "HYROX Doubles", value: "1:05:20" },
      { name: "Clean", value: "110 kg" },
    ],
    superpower: "Wall Balls",
    kryptonite: "Ski Erg",
    avatar: avatar("marco"),
  },
];

export const listings: Listing[] = [
  {
    id: "l1",
    type: "selling-ticket",
    competition: "HYROX Berlin",
    competitionType: "HYROX",
    date: "2026-06-14",
    location: "Berlin, DE",
    format: "Individual",
    skillLevel: "Intermediate",
    gender: "Men",
    spots: 1,
    description: "Injured my knee — gutted to miss it. Pro Men ticket, ready to transfer at face value.",
    authorId: "a2",
    postedAt: "2026-05-19",
  },
  {
    id: "l2",
    type: "need-teammate",
    competition: "HYROX Amsterdam Doubles",
    competitionType: "HYROX",
    date: "2026-07-05",
    location: "Amsterdam, NL",
    format: "Doubles",
    skillLevel: "Advanced",
    gender: "Mixed",
    spots: 1,
    description: "Partner pulled out 6 weeks before. Aiming for sub-1:05. Looking for a strong runner.",
    authorId: "a4",
    postedAt: "2026-05-21",
  },
  {
    id: "l3",
    type: "join-team",
    competition: "Turf Games Paris",
    competitionType: "Turf Games",
    date: "2026-09-12",
    location: "Paris, FR",
    format: "Team",
    skillLevel: "Intermediate",
    gender: "Mixed",
    spots: 1,
    description: "Looking to join a 4-person mixed team. Gymnastics + barbell are my strengths.",
    authorId: "a3",
    postedAt: "2026-05-18",
  },
  {
    id: "l4",
    type: "selling-ticket",
    competition: "HYROX London",
    competitionType: "HYROX",
    date: "2026-11-08",
    location: "London, UK",
    format: "Individual",
    skillLevel: "Beginner",
    gender: "Women",
    spots: 1,
    description: "Work trip clash. Open Women — first wave Saturday morning.",
    authorId: "a5",
    postedAt: "2026-05-20",
  },
  {
    id: "l5",
    type: "need-teammate",
    competition: "HYROX Barcelona Doubles",
    competitionType: "HYROX",
    date: "2026-10-18",
    location: "Barcelona, ES",
    format: "Doubles",
    skillLevel: "Elite",
    gender: "Men",
    spots: 1,
    description: "Targeting podium. Partner moved abroad. Need someone sub-1:05 doubles.",
    authorId: "a6",
    postedAt: "2026-05-22",
  },
  {
    id: "l6",
    type: "selling-ticket",
    competition: "DEKA STRONG Rotterdam",
    competitionType: "DEKA",
    date: "2026-08-23",
    location: "Rotterdam, NL",
    format: "Individual",
    skillLevel: "Intermediate",
    gender: "Open",
    spots: 1,
    description: "Travel plans changed. Transferable bib, paid €95.",
    authorId: "a2",
    postedAt: "2026-05-17",
  },
];

export const conversations = [
  {
    id: "c1",
    withAthleteId: "a2",
    lastMessage: "Yes still available — when can you collect the bib?",
    time: "2m",
    unread: 2,
    messages: [
      { from: "them", text: "Hey! Saw your HYROX Berlin ticket — still available?", time: "10:02" },
      { from: "me", text: "Hi! Yes, looking to transfer at face value.", time: "10:04" },
      { from: "them", text: "Perfect. I'm Pro Men level — sub 1:10.", time: "10:05" },
      { from: "me", text: "Yes still available — when can you collect the bib?", time: "10:08" },
    ],
  },
  {
    id: "c2",
    withAthleteId: "a4",
    lastMessage: "Sounds good, let's do a session this weekend.",
    time: "1h",
    unread: 0,
    messages: [
      { from: "them", text: "Interested in the Doubles spot — I run a 19:30 5K.", time: "Yesterday" },
      { from: "me", text: "Sounds good, let's do a session this weekend.", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    withAthleteId: "a3",
    lastMessage: "Applied to your team — gymnastics is my superpower 💪",
    time: "3h",
    unread: 1,
    messages: [
      { from: "them", text: "Applied to your team — gymnastics is my superpower 💪", time: "08:14" },
    ],
  },
];

export const notifications = [
  { id: "n1", kind: "message", text: "Theo replied to your HYROX Berlin listing", time: "2m", unread: true },
  { id: "n2", kind: "application", text: "Aïcha applied to join your Turf Games team", time: "3h", unread: true },
  { id: "n3", kind: "match", text: "New match: HYROX Doubles partner near Amsterdam", time: "1d", unread: false },
  { id: "n4", kind: "system", text: "Your profile got 24 views this week 🔥", time: "2d", unread: false },
  { id: "n5", kind: "listing", text: "A new HYROX London ticket just dropped", time: "3d", unread: false },
];

export const getAthlete = (id: string) => athletes.find((a) => a.id === id);
export const getListing = (id: string) => listings.find((l) => l.id === id);

export const competitionTypes = ["HYROX", "Turf Games", "DEKA", "CrossFit", "Spartan"];
export const skillLevels = ["Beginner", "Intermediate", "Advanced", "Elite"] as const;
export const formats = ["Individual", "Doubles", "Team"] as const;

export const listingTypeMeta: Record<Listing["type"], { label: string; tone: string }> = {
  "selling-ticket": { label: "Ticket for sale", tone: "bg-warm text-primary-foreground" },
  "need-teammate": { label: "Need teammate", tone: "bg-cool text-primary-foreground" },
  "join-team": { label: "Looking for team", tone: "bg-secondary text-secondary-foreground" },
};
