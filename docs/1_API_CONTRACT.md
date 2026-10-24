# Decoded: API Contract (shared, frontend and backend both build to this)

> **The rule:** neither side changes a field name or shape without telling the other. Adding a new optional field is fine. Renaming or removing one needs a 30-second Slack message first.

## 0. Ground rules
- **Base URL:** frontend reads `VITE_API_BASE_URL` (e.g. `https://decoded-api.<user>.replit.dev`). All routes are prefixed with `/api`.
- **Format:** JSON in, JSON out. camelCase field names. Timestamps are ISO strings.
- **User:** no login. There is a single demo user `id: "demo"`. Frontend sends header `X-User-Id: demo`, and backend defaults to `demo` if the header is missing.
- **CORS:** backend allows `*` (it's a hackathon).
- **Errors:** non-200 status with `{ "error": { "code": "STRING", "message": "Human readable" } }`
- **Levels:** `"beginner" | "amateur" | "pro"`
- **Archetypes:** `"researcher" | "builder" | "investor" | "operator"`
- **Sources:** `"x" | "linkedin" | "substack" | "user"`

---

## 1. Shared types (TypeScript, copy into both projects as `types.ts`)

```ts
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
  wordsKnown: number;          // terms with status learning|known
  feedFluency: number;         // 0–100: % of today's feed terms the user knows
  queuedTermsCount: number;    // terms waiting for the next lesson
  onboarded: boolean;
}

export interface Author {
  id: string;
  name: string;
  handle: string;              // "@karpathy"
  archetype: Archetype;
  avatarUrl: string | null;    // frontend shows initials if null
  bio: string;
  whyFollow: string;
  difficulty: Level;
  following: boolean;
}

export interface TermRef { id: string; term: string; }   // term = exact text as it appears in the post

export interface Post {
  id: string;
  source: Source;
  url: string | null;
  author: Pick<Author, "id" | "name" | "handle" | "archetype" | "avatarUrl">;
  publishedAt: string;
  text: string;                // original post text
  tldr: Record<Level, string>; // all 3 levels are always present, so the level toggle works client-side
  whyItMatters: string;
  terms: TermRef[];
  topic: string | null;
}

export interface Term {
  id: string;
  term: string;
  category: string;            // "Foundations" | "Models" | "Building" | "Business of AI" | "Frontier"
  definitions: Record<Level, string>;
  analogy: string;
  status: "new" | "queued" | "learning" | "known";
}

export type Card =
  | { id: string; type: "concept"; termId: string; term: string; explanation: string; analogy: string; fromFeed: boolean }
  | { id: string; type: "mcq"; question: string; options: string[]; answerIndex: number; explanation: string }
  | { id: string; type: "match"; pairs: { left: string; right: string }[] }
  | { id: string; type: "real_post"; author: string; postSnippet: string; question: string; options: string[]; answerIndex: number; explanation: string }
  | { id: string; type: "fill_blank"; sentence: string; options: string[]; answerIndex: number; explanation: string }; // sentence contains "___"

export interface Lesson {
  id: string;
  date: string;                // "2026-10-24"
  unitTitle: string;
  cards: Card[];               // 5–7 cards
  completed: boolean;
}

export interface PathUnit {
  id: string;
  title: string;
  emoji: string;
  status: "done" | "current" | "locked";
  progress: number;            // 0–1
}

export interface PlacementQuestion { id: string; question: string; options: string[]; }

export interface ChatMessage { role: "user" | "assistant"; content: string; }
```

> **Grading happens on the client.** The answer index comes back with each card, so the UI gives instant feedback, then reports the result to the backend for XP. (In a real product you'd grade on the server; this is fine for the demo.)

---

## 2. Endpoints

### User
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/me` | | `User` |
| PATCH | `/api/me` | `{ level?: Level, name?: string }` | `User` |
| GET | `/api/path` | | `{ units: PathUnit[] }` |

### Onboarding
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/placement/questions` | | `{ questions: PlacementQuestion[] }` (exactly 5) |
| POST | `/api/placement` | `{ goal: Goal, answers: number[] }` | `{ level: Level, score: number, user: User }` |

Scoring: 0–2 correct gives `beginner`, 3–4 gives `amateur`, 5 gives `pro`.

### Learn
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/lesson/today` | | `Lesson` |
| POST | `/api/lesson/:id/answer` | `{ cardId: string, correct: boolean }` | `{ xpAwarded: number, user: User }` |
| POST | `/api/lesson/:id/complete` | | `{ xpAwarded: number, streak: number, wordsLearned: string[], feedFluencyBefore: number, feedFluencyAfter: number, user: User }` |

### Pulse (feed)
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/feed?archetype=&source=` | both optional; `source=user` returns My Decodes | `{ posts: Post[] }` newest first |
| POST | `/api/feed/refresh` | | `{ added: number }` (pulls Substack RSS) |
| GET | `/api/terms/:id` | | `Term` |
| POST | `/api/terms/:id/queue` | | `{ queued: true, queuedTermsCount: number }` (also +5 XP) |

### Decode
| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/decode` | `{ url?: string, text?: string }` (at least one) | **Success:** `{ ok: true, post: Post, method: "oembed"\|"og"\|"readability"\|"apify"\|"text"\|"cache"\|"demo" }` |
| | | | **Couldn't fetch:** `{ ok: false, needsText: true, url: string, reason: string }` (**HTTP 200**, not an error) |

This can take 3–10 seconds. Frontend shows the progress animation. Backend times out at 20s.

### Chat
| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/api/chat` | `{ postId: string, messages: ChatMessage[] }` (full history, stateless) | `{ reply: string, suggestions: string[] }` (up to 3 follow-up chips) |

### People
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/authors` | | `{ authors: Author[] }` |
| POST | `/api/authors/:id/follow` | `{ follow: boolean }` | `{ following: boolean }` |

### Dev (for the demo)
| Method | Path | Response |
|---|---|---|
| POST | `/api/dev/next-day` | Advances the "today" date by 1 so the next lesson includes queued terms. Returns `{ user: User }` |
| POST | `/api/dev/reset` | Resets the demo user to the seeded "mid-journey" state (streak 6, level beginner). Returns `{ user: User }` |
| GET | `/api/health` | `{ ok: true }` |

---

## 3. Canonical example payloads (frontend mocks and backend seed both use these)

**`GET /api/me`**
```json
{ "id": "demo", "name": "John", "goal": "work", "level": "beginner", "xp": 240, "streak": 6,
  "wordsKnown": 18, "feedFluency": 62, "queuedTermsCount": 0, "onboarded": true }
```

**A `Post`**
```json
{
  "id": "p_001", "source": "x", "url": "https://x.com/someone/status/123",
  "author": { "id": "a_01", "name": "Jane Builder", "handle": "@janebuilds", "archetype": "builder", "avatarUrl": null },
  "publishedAt": "2026-10-24T13:05:00Z",
  "text": "Inference costs dropped 10x again this year. Agents with RAG are finally cheap enough to run on every support ticket.",
  "tldr": {
    "beginner": "Running AI got about 10 times cheaper this year, so companies can now afford AI helpers that look up answers for every customer question.",
    "amateur": "Inference got ~10x cheaper, making retrieval-backed agents economical for high-volume work like customer support.",
    "pro": "A ~10x drop in inference cost changes unit economics: RAG-based agents now beat human-handled cost per ticket at scale."
  },
  "whyItMatters": "Cheaper AI is why you're suddenly seeing AI agents in every company's support roadmap.",
  "terms": [ { "id": "t_inference_cost", "term": "Inference costs" }, { "id": "t_agent", "term": "Agents" }, { "id": "t_rag", "term": "RAG" } ],
  "topic": "AI cost curve"
}
```

**A `Term`**
```json
{ "id": "t_rag", "term": "RAG", "category": "Building",
  "definitions": {
    "beginner": "A way for AI to look things up in your documents before answering, like an open-book exam.",
    "amateur": "Retrieval-Augmented Generation: fetch relevant documents and give them to the model alongside the question so answers are grounded.",
    "pro": "Retrieve top-k chunks via embedding similarity and inject them into context; trades latency and retrieval quality against fine-tuning cost."
  },
  "analogy": "An open-book exam instead of answering from memory.", "status": "new" }
```

**A `Lesson`** (short version)
```json
{ "id": "l_2026-10-24", "date": "2026-10-24", "unitTitle": "Building with AI", "completed": false,
  "cards": [
    { "id": "c1", "type": "concept", "termId": "t_inference_cost", "term": "Inference cost", "fromFeed": true,
      "explanation": "What it costs to run an AI model each time someone uses it.", "analogy": "Like the electricity bill for every question you ask." },
    { "id": "c2", "type": "mcq", "question": "What does RAG let an AI do?",
      "options": ["Run faster", "Look up information before answering", "Generate images", "Train itself"], "answerIndex": 1,
      "explanation": "RAG = retrieval: the AI fetches relevant info first." },
    { "id": "c3", "type": "match", "pairs": [ {"left":"Token","right":"A chunk of text the model reads"}, {"left":"Agent","right":"AI that takes actions"},
      {"left":"Inference","right":"Running a trained model"}, {"left":"Hallucination","right":"Confident but wrong output"} ] },
    { "id": "c4", "type": "real_post", "author": "Jane Builder", "postSnippet": "Inference costs dropped 10x again this year...",
      "question": "What is Jane's main point?", "options": ["AI is getting more expensive","AI agents are now affordable at scale","RAG is dead","Support teams are growing"],
      "answerIndex": 1, "explanation": "Cheaper inference makes agents economical." }
  ] }
```

**`POST /api/decode` needs-text response**
```json
{ "ok": false, "needsText": true, "url": "https://www.linkedin.com/posts/...", "reason": "LinkedIn requires login for this post." }
```

**`POST /api/chat` response**
```json
{ "reply": "Think of inference cost like a taxi meter: every question you ask the AI runs the meter a little. ...Quick check: why would cheaper inference mean more AI in customer support?",
  "suggestions": ["What's an agent?", "Who is Jane?", "How would I say this in a meeting?"] }
```
