// The ONLY place the UI talks to data. Every function either calls the real backend
// or returns mock data, per endpoint.
//
// HOW TO GO LIVE:
//   1. Set VITE_API_BASE_URL (Replit Secrets) to the backend's published URL, restart.
//   2. Add function names to LIVE below as the backend ships each endpoint.
//   3. When everything is live, set VITE_USE_MOCKS=false.
// If a live call fails, we log it and fall back to the mock so the demo never breaks.

import { mock } from "./mocks";
import type {
  Archetype, ChatMessage, Lens, CompleteResult, DecodeResult, Goal, Lesson, Level,
  PathUnit, PlacementQuestion, Post, Source, Term, User, Author,
} from "./types";

const LIVE = new Set<string>([
  // "getMe", "getFeed", "getTerm", "getAuthors", "getPath",
  // "getTodayLesson", "answerCard", "completeLesson", "queueTerm", "devNextDay", "devReset",
  // "decode", "chat", "onboard", "markRead", "updateMe", "follow", "devSetPersona",
]);

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";
const MOCKS_ON = (import.meta.env.VITE_USE_MOCKS as string | undefined) !== "false";
const FALLBACK_TO_MOCK_ON_ERROR = true;

function isLive(name: string) {
  if (!MOCKS_ON) return true;
  if (!BASE || !LIVE.has(name)) return false;
  return true;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-User-Id": "demo", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function call<T>(name: string, live: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (!isLive(name)) return fallback();
  try {
    return await live();
  } catch (e) {
    console.error(`[api] ${name} failed live:`, e);
    if (FALLBACK_TO_MOCK_ON_ERROR) return fallback();
    throw e;
  }
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  getMe: () => call<User>("getMe", () => http("/me"), mock.getMe),
  updateMe: (b: Partial<Pick<User, "level" | "name" | "lens">>) =>
    call<User>("updateMe", () => http("/me", { method: "PATCH", body: json(b) }), () => mock.updateMe(b)),
  getPath: () => call<{ units: PathUnit[] }>("getPath", () => http("/path"), mock.getPath),

  // Onboarding: self-reported level + lens (area of focus)
  onboard: (level: Level, lens: Lens, name: string) =>
    call<{ user: User }>("onboard", () => http("/onboarding", { method: "POST", body: json({ level, lens, name }) }), () => mock.onboard(level, lens, name)),
  // Counts toward the daily goal (amateur: 3 posts, pro: 5 posts)
  markRead: (postId: string) =>
    call<{ user: User }>("markRead", () => http(`/feed/${postId}/read`, { method: "POST" }), () => mock.markRead(postId)),

  getPlacementQs: () =>
    call<{ questions: PlacementQuestion[] }>("getPlacementQs", () => http("/placement/questions"), mock.getPlacementQs),
  submitPlacement: (goal: Goal, answers: number[]) =>
    call<{ level: Level; score: number; user: User }>(
      "submitPlacement",
      () => http("/placement", { method: "POST", body: json({ goal, answers }) }),
      () => mock.submitPlacement(goal, answers),
    ),

  getTodayLesson: () => call<Lesson>("getTodayLesson", () => http("/lesson/today"), mock.getTodayLesson),
  answerCard: (lessonId: string, cardId: string, correct: boolean) =>
    call<{ xpAwarded: number; user: User }>(
      "answerCard",
      () => http(`/lesson/${lessonId}/answer`, { method: "POST", body: json({ cardId, correct }) }),
      () => mock.answerCard(lessonId, cardId, correct),
    ),
  completeLesson: (lessonId: string) =>
    call<CompleteResult>(
      "completeLesson",
      () => http(`/lesson/${lessonId}/complete`, { method: "POST" }),
      () => mock.completeLesson(lessonId),
    ),

  refreshFeed: () =>
    call<{ added: number; removed: number }>(
      "refreshFeed",
      () => http("/feed/refresh", { method: "POST" }),
      async () => ({ added: 0, removed: 0 }),
    ),

  getFeed: (f?: { archetype?: Archetype; source?: Source }) => {
    const q = new URLSearchParams();
    if (f?.archetype) q.set("archetype", f.archetype);
    if (f?.source) q.set("source", f.source);
    const qs = q.toString() ? `?${q}` : "";
    return call<{ posts: Post[] }>("getFeed", () => http(`/feed${qs}`), () => mock.getFeed(f));
  },
  getMyWords: () => call<{ terms: Term[] }>("getMyWords", () => http("/me/words"), mock.getMyWords),
  getTerm: (id: string) => call<Term>("getTerm", () => http(`/terms/${id}`), () => mock.getTerm(id)),
  queueTerm: (id: string) =>
    call<{ queued: boolean; queuedTermsCount: number }>(
      "queueTerm",
      () => http(`/terms/${id}/queue`, { method: "POST" }),
      () => mock.queueTerm(id),
    ),

  decode: (b: { url?: string; text?: string }) =>
    call<DecodeResult>("decode", () => http("/decode", { method: "POST", body: json(b) }), () => mock.decode(b)),
  chat: (postId: string, messages: ChatMessage[]) =>
    call<{ reply: string; suggestions: string[] }>(
      "chat",
      () => http("/chat", { method: "POST", body: json({ postId, messages }) }),
      () => mock.chat(postId, messages),
    ),

  getAuthors: () => call<{ authors: Author[] }>("getAuthors", () => http("/authors"), mock.getAuthors),
  follow: (id: string, follow: boolean) =>
    call<{ following: boolean }>(
      "follow",
      () => http(`/authors/${id}/follow`, { method: "POST", body: json({ follow }) }),
      () => mock.follow(id, follow),
    ),

  devNextDay: () => call<{ user: User }>("devNextDay", () => http("/dev/next-day", { method: "POST" }), mock.devNextDay),
  devSetPersona: (level: Level) =>
    call<{ user: User }>("devSetPersona", () => http("/dev/persona", { method: "POST", body: json({ level }) }), () => mock.devSetPersona(level)),
  devReset: () => call<{ user: User }>("devReset", () => http("/dev/reset", { method: "POST" }), mock.devReset),
};

export const apiMode = () => (BASE ? (MOCKS_ON ? `mixed (${LIVE.size} live)` : "live") : "mocks");
