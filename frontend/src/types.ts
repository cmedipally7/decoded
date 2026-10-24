// Shared types — mirrors 1_API_CONTRACT.md exactly. Do not rename fields without telling the backend.
export type Level = "beginner" | "amateur" | "pro";
export type Archetype = "researcher" | "builder" | "investor" | "operator";
export type Source = "x" | "linkedin" | "substack" | "user";
export type Goal = "work" | "invest" | "switch" | "curious"; // legacy, replaced by lens
export type Lens = Archetype; // the user's area of focus: research / building / investing / operating
export type HomeTab = "learn" | "today" | "pulse";

export interface DailyGoal {
  label: string;      // "1 lesson" | "1 lesson or 3 posts" | "5 posts + 1 deep dive"
  progress: number;   // units done
  target: number;     // units needed
  met: boolean;
}

export interface Quest {
  id: string;
  kind: "streak" | "bonus";   // the streak quest keeps the streak; bonus quests earn XP
  title: string;
  progress: number;
  target: number;
  xp: number;
  done: boolean;
  action: "lesson" | "pulse" | "decode" | "people"; // where the quest sends the user
}

export interface User {
  id: string;
  name: string;
  goal?: Goal | null;
  lens: Lens | null;
  level: Level;
  homeTab: HomeTab;         // beginner→learn, amateur→today, pro→pulse
  dailyGoal: DailyGoal;
  lessonDoneToday: boolean;
  lessonsCompleted: number;
  quests: Quest[];         // today's 3 quests (first one is the streak quest) // all-time; beginners unlock 3 more feed posts per lesson
  xp: number;
  streak: number;
  wordsKnown: number;
  feedFluency: number;
  queuedTermsCount: number;
  onboarded: boolean;
}

export interface Author {
  id: string;
  name: string;
  handle: string;
  archetype: Archetype;
  avatarUrl: string | null;
  bio: string;
  whyFollow: string;
  difficulty: Level;
  following: boolean;
}

export interface TermRef {
  id: string;
  term: string;
  status?: "new" | "queued" | "learning" | "known"; // this user's status for the term (optional)
}

export interface Post {
  id: string;
  source: Source;
  url: string | null;
  author: Pick<Author, "id" | "name" | "handle" | "archetype" | "avatarUrl">;
  publishedAt: string;
  text: string;
  tldr: Record<Level, string>;
  whyItMatters: string;
  whyItMattersByLens?: Partial<Record<Lens, string>>; // lens-specific framing; falls back to whyItMatters
  debate?: string;                                     // the strongest counter-argument
  terms: TermRef[];
  topic: string | null;
  fresh?: boolean;
}

export interface Term {
  id: string;
  term: string;
  category: string;
  definitions: Record<Level, string>;
  analogy: string;
  status: "new" | "queued" | "learning" | "known";
}

export type Card =
  | { id: string; type: "concept"; termId: string; term: string; explanation: string; analogy: string; fromFeed: boolean }
  | { id: string; type: "mcq"; question: string; options: string[]; answerIndex: number; explanation: string }
  | { id: string; type: "match"; pairs: { left: string; right: string }[] }
  | { id: string; type: "real_post"; author: string; postSnippet: string; question: string; options: string[]; answerIndex: number; explanation: string }
  | { id: string; type: "fill_blank"; sentence: string; options: string[]; answerIndex: number; explanation: string };

export interface Lesson {
  id: string;
  date: string;
  unitTitle: string;
  cards: Card[];
  completed: boolean;
}

export interface PathDay {
  id: string;
  n: number;                 // day number within the chapter
  title: string;             // "What is an LLM?"
  terms: TermRef[];          // words taught that day (preview for upcoming days)
  status: "done" | "today" | "upcoming";
  inDays: number;            // 0 = today, 1 = tomorrow, ...
}

export interface PathUnit {
  id: string;
  title: string;
  emoji: string;
  status: "done" | "current" | "locked";
  progress: number;
  days: PathDay[];           // a chapter is a few days of lessons
}

export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompleteResult {
  xpAwarded: number;
  streak: number;
  wordsLearned: string[];
  feedFluencyBefore: number;
  feedFluencyAfter: number;
  user: User;
}

export type DecodeResult =
  | { ok: true; post: Post; method: string }
  | { ok: false; needsText: true; url: string; reason: string };
