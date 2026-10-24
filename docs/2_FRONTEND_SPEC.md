# Decoded: Frontend Spec (owner: Chaitanya)

**Goal:** a polished, mobile-first app that runs entirely on **mock data** until the backend is ready. Then you switch to the real backend one endpoint at a time, without changing any UI code.

## 1. Setup
- Separate Replit: **React + Vite + TypeScript + Tailwind**. Add `framer-motion` (animations), `canvas-confetti`, `lucide-react` (icons), `react-router-dom`.
- Copy `types.ts` from the API Contract into `src/types.ts`.
- Env vars (Replit Secrets):
  - `VITE_API_BASE_URL`: backend URL (empty for now)
  - `VITE_USE_MOCKS`: `true` (switch to `false` at integration)

## 2. The most important file: `src/api.ts`
Every screen calls **only** these functions. Each one checks a per-endpoint mock flag, so you can switch one endpoint to live while the rest stay mocked.

```ts
const LIVE = new Set<string>([/* add names as backend ships: "getMe", "getFeed", ... */]);
const useMock = (name: string) => import.meta.env.VITE_USE_MOCKS === "true" && !LIVE.has(name);

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api${path}`, {
    ...init, headers: { "Content-Type": "application/json", "X-User-Id": "demo", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error?.message || res.statusText);
  return res.json();
}

export const api = {
  getMe:            () => useMock("getMe") ? mock.getMe() : http<User>("/me"),
  updateMe:         (b: Partial<Pick<User,"level"|"name">>) => ...,           // PATCH /me
  getPath:          () => ...,                                                 // GET /path
  getPlacementQs:   () => ...,                                                 // GET /placement/questions
  submitPlacement:  (goal: Goal, answers: number[]) => ...,                    // POST /placement
  getTodayLesson:   () => ...,                                                 // GET /lesson/today
  answerCard:       (lessonId: string, cardId: string, correct: boolean) => ...,
  completeLesson:   (lessonId: string) => ...,
  getFeed:          (f?: { archetype?: Archetype; source?: Source }) => ...,
  getTerm:          (id: string) => ...,
  queueTerm:        (id: string) => ...,
  decode:           (b: { url?: string; text?: string }) => ...,
  chat:             (postId: string, messages: ChatMessage[]) => ...,
  getAuthors:       () => ...,
  follow:           (id: string, follow: boolean) => ...,
  devNextDay:       () => ..., devReset: () => ...,
};
```

**`src/mocks.ts`:** returns the example payloads from the contract (§3), with a fake 400ms delay. `decode` mock should wait 2.5s and return `needsText` for LinkedIn URLs so you can build the fallback UI. Mocks should keep simple in-memory state (XP increases, queued terms show up in the next lesson) so the full demo loop works on mocks alone.

**Mock data you need:** 1 user, 5 path units, 5 placement questions, 8–10 posts (mixed sources and archetypes), 15 terms, 1 lesson of 6 cards, 8 authors, a canned chat reply. (Ask Claude or ChatGPT to generate `mocks.ts` from the contract. It takes about 5 minutes.)

## 3. Global state (React context, keep it simple)
`AppContext`: `user`, `refreshUser()`, `viewLevel` (Pulse toggle, defaults to `user.level`), `toast(msg)`.
After any call that returns `user`, update the context so the streak and XP in the header update everywhere.

## 4. Screens & components

| # | Route | Screen | Calls | Must-have details |
|---|---|---|---|---|
| 1 | `/welcome` | Welcome + Goal | | Logo, tagline, 4 goal tiles (`work`/`invest`/`switch`/`curious`) |
| 2 | `/placement` | Placement quiz | `getPlacementQs`, `submitPlacement` | Progress bar, 5 questions, auto-advance |
| 3 | `/result` | Level result | | Badge animation (🌱/🌿/🌳), "Daily goal: 5 min", CTA → `/learn` |
| 4 | `/learn` | **Home** | `getMe`, `getPath`, `getTodayLesson` | Header: 🔥 streak, XP bar, level chip. "Today's lesson" card with a "✨ N words from your feed" badge when any card has `fromFeed`. Skill path as zig-zag circular nodes |
| 5 | `/lesson/:id` | **Lesson player** | `answerCard`, `completeLesson` | One card at a time, top progress bar, "Check" button, green or red bottom banner with the explanation, wrong cards go back into the queue at the end |
| 6 | `/lesson/:id/done` | Complete | | Confetti, +XP count-up, streak 🔥 bump animation, **big "You can now read 62% → 78% of today's feed"**, list of words learned |
| 7 | `/pulse` | **Feed** | `getFeed` | Filter chips: All / Researchers / Builders / Investors / Operators / **My Decodes**. **Level toggle** (🌱/🌿/🌳) at the top switches `tldr[viewLevel]` instantly. Floating **+ Decode** button |
| 8 | (sheet) | **Term sheet** | `getTerm`, `queueTerm` | Bottom sheet: term, definition at level, analogy, button "Add to tomorrow's lesson" → toast ✓ |
| 9 | `/chat/:postId` | **Deep Dive** | `chat` | Post pinned at the top (collapsible), chat bubbles, typing dots, starter chips: *Explain like I'm new · Who is this person? · What's the counter-argument? · How would I mention this in a meeting?*, then `suggestions` from each reply |
| 10 | `/people` | People | `getAuthors`, `follow` | Grouped by archetype, why-follow line, difficulty badge, follow toggle |
| 11 | (sheet) | **Decode sheet** | `decode` | See §5 |
| 12 | `/me` | Me | `updateMe`, `devNextDay`, `devReset` | Level switcher, stats, **hidden dev buttons** (tap the avatar 3×): Simulate next day, Reset demo |

**Reusable components:** `PhoneFrame` (max-w-[420px], centered, rounded, shadow on desktop), `TabBar`, `StreakHeader`, `PostCard`, `TermHighlighter`, `BottomSheet`, `LevelToggle`, `ProgressBar`, `Toast`, `LoadingSteps`.

## 5. Tricky components (spec these carefully)

**`TermHighlighter`:** takes `text` and `terms: TermRef[]`. For each term, find case-insensitive matches in the text, longest terms first (so "inference costs" matches before "inference"), and wrap them in a dotted-underline button that opens the Term sheet. Apply it to both `tldr[viewLevel]` and the expandable original `text`. If a term isn't found in the TL;DR, show it as a chip under the card ("Terms in this post: RAG · Agents").

**`PostCard`:** avatar (initials fallback), name, handle, archetype pill (color per archetype), source icon, relative time → TL;DR (highlighted) → "💡 Why it matters: …" → "Show original" expander → actions: **Dive deeper** · Open source ↗.

**Decode sheet states:**
1. `idle`: text area (accepts a URL or text) + "Paste" button (`navigator.clipboard.readText()`) + 3 sample-link chips (your rehearsed demo links)
2. `loading`: `LoadingSteps`: *Fetching post → Spotting jargon → Writing your TL;DR* (advance on a timer: 0s, 1.5s, 3s; the last step stays until the response arrives)
3. `success`: render `PostCard` in the sheet + "Saved to My Decodes" + Dive deeper
4. `needsText`: yellow notice "This site hides its posts from us. Paste the text instead 👇", text area expands, URL kept, then resubmit `{ url, text }`
5. `error`: "Something went wrong. Try pasting the text." Same as the `needsText` UI.

**Lesson card types:** concept (big term, explanation, analogy, "Got it"), mcq (4 tappable options), match (two columns, tap left then right; a pair turns green when matched), real_post (quoted post block + mcq), fill_blank (sentence with a gap + option chips).

## 6. Visual spec
- Brand violet `#7C3AED`, success `#22C55E`, error `#EF4444`, streak orange `#F97316`, background `#FAFAF9`, text `#1C1917`
- Archetype pills: researcher blue, builder green, investor amber, operator pink
- Cards `rounded-2xl`, generous padding, `font-bold` headings, Inter or Nunito (Nunito feels more like Duolingo)
- Micro-interactions: button press scale 0.97, correct-answer bounce, XP count-up, streak flame wiggle

## 7. Build order (frontend)
1. Phone frame, tab bar, routing, `api.ts` + `mocks.ts` (**first 45 min**)
2. Pulse: PostCard, TermHighlighter, Term sheet, level toggle
3. Learn home + Lesson player + Complete screen
4. Decode sheet (all 5 states on mocks)
5. Deep Dive chat
6. Onboarding + placement, then People, Me/dev buttons
7. Polish: animations, empty states, loading skeletons

## 8. Replit Agent prompt (frontend)
```
Build ONLY the frontend for "Decoded" — Duolingo for learning AI. React + Vite + TypeScript + Tailwind,
framer-motion, canvas-confetti, lucide-react, react-router-dom. Mobile-first inside a 420px centered phone frame.
Do NOT build a backend. All data goes through src/api.ts, which calls VITE_API_BASE_URL + "/api/..." with header
X-User-Id: demo, but returns data from src/mocks.ts when VITE_USE_MOCKS === "true" (with a per-endpoint LIVE set
override). Use the types and endpoints in the attached API contract exactly.
[paste 1_API_CONTRACT.md sections 1–3 and this spec's sections 4–6]
Start with: phone frame, bottom tabs (Learn, Pulse, People, Me), api.ts + mocks.ts, then the Pulse feed with
PostCard, term highlighting, term bottom sheet, and level toggle.
```
