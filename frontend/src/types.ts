// Shared types — mirrors 1_API_CONTRACT.md exactly. Do not rename fields without telling the backend.
export type Level = "beginner" | "amateur" | "pro";
export type Archetype = "researcher" | "builder" | "investor" | "operator";
export type Source = "x" | "linkedin" | "substack" | "user";
export type Goal = "work" | "invest" | "switch" | "curious";

export interface User {
  id: string;
  name: string;
  goal: Goal | null;
  level: Level;
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
  terms: TermRef[];
  topic: string | null;
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

export interface PathUnit {
  id: string;
  title: string;
  emoji: string;
  status: "done" | "current" | "locked";
  progress: number;
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
