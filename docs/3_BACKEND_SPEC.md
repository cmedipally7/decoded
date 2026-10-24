# Decoded: Backend Spec (owner: teammate)

**Goal:** an API that implements `1_API_CONTRACT.md` exactly, with real AI calls, a real link decoder and seed data, plus a cached fallback for every AI call so the demo never breaks.

## 1. Setup
- Separate Replit: **Node 20 + Express + TypeScript** (or plain JS if faster).
- Packages: `express cors zod openai` (or `@anthropic-ai/sdk`), `rss-parser cheerio @mozilla/readability jsdom`, `better-sqlite3` **or** a JSON-file store (`lowdb`). For a few hours of work, a JSON store is fine.
- Secrets: `LLM_API_KEY`, `LLM_MODEL`, optional `APIFY_TOKEN`.
- `app.use(cors())`, `app.use(express.json())`. Every route sits under `/api`. Read `X-User-Id` (default `"demo"`).
- **Publish early** (within the first hour) so the frontend has a stable URL. Check that `GET /api/health` works.

## 2. Folder structure
```
server/
  index.ts              routes
  types.ts              copied from contract
  store.ts              load/save JSON (users, terms, userTerms, posts, authors, lessons, decodeCache)
  llm.ts                callJSON(prompt, schema) + callText(system, messages); timeout 20s; retries 1
  enrich.ts             enrichPost(text, author, source) → tldr/whyItMatters/terms/topic
  lessons.ts            buildTodayLesson(userId)
  decode/
    index.ts            decode({url,text}) orchestrator
    x.ts                oEmbed fetcher
    og.ts               cheerio og: tags
    readability.ts      article extractor
    apify.ts            optional
  ingest/substack.ts    RSS pull
  seed/
    terms.json  authors.json  posts.json  placement.json  path.json
    enriched_posts.json     ← output of the enrich script (committed)
    demo_decodes.json       ← 3 decoded demo links keyed by URL
  scripts/enrich-seed.ts
```

## 3. Data (internal; the API responses must match the contract types)
```
users       { id, name, goal, level, xp, streak, today: "YYYY-MM-DD", lastLessonDate, onboarded, following: authorId[] }
terms       { id, term, aliases[], category, definitions{beginner,amateur,pro}, analogy }
userTerms   { userId, termId, status: new|queued|learning|known, source: lesson|feed|decode }
posts       Post (contract shape) + { createdBy?: userId }
authors     Author minus `following` (compute it per user)
lessons     Lesson + { userId }
decodeCache { [url]: Post }
```
- **`wordsKnown`** = count of userTerms with status `learning` or `known`.
- **`feedFluency`** = (unique termIds in the feed posts that the user knows) ÷ (all unique termIds in the feed) × 100, rounded.
- **`today`** is stored on the user (not the system clock) so `/dev/next-day` can advance it.

## 4. Endpoint logic

| Endpoint | Logic |
|---|---|
| `GET /me` | Load the user and compute `wordsKnown`, `feedFluency`, `queuedTermsCount` |
| `PATCH /me` | Update level and name |
| `GET /path` | 5 units from `path.json`; status from the share of that category's terms the user knows |
| `GET /placement/questions` | 5 questions from `placement.json` **without** answers |
| `POST /placement` | Score against the answer key → level; set goal, `onboarded=true` |
| `GET /lesson/today` | If a lesson exists for `user.today`, return it. Otherwise call `buildTodayLesson` (below) |
| `POST /lesson/:id/answer` | `correct` → +10 XP |
| `POST /lesson/:id/complete` | +20 XP; streak +1 if `lastLessonDate !== today`; terms in the lesson move `queued/new → learning`; return fluency before and after |
| `GET /feed` | Posts filtered by archetype/source, newest first. `source=user` → `createdBy === userId` |
| `POST /feed/refresh` | Pull 2–3 Substack RSS feeds, take the newest 3 items each that aren't already stored, `enrichPost`, save |
| `GET /terms/:id` | Term + the user's status |
| `POST /terms/:id/queue` | Set status `queued` (source `feed`), +5 XP |
| `POST /decode` | See §6 |
| `POST /chat` | `callText` with the system prompt below, using the post as context. Then a second small call (or the same call in JSON mode) returns 3 `suggestions`. Fallback: a canned reply built from the post's TL;DR |
| `GET /authors`, `POST /authors/:id/follow` | Simple |
| `POST /dev/next-day` | `user.today` += 1 day |
| `POST /dev/reset` | Restore the demo user to: streak 6, xp 240, level beginner, ~18 terms `learning`, no queued terms, today = real date |

### `buildTodayLesson(userId)`
1. Pick terms: **all `queued` terms first** (mark `fromFeed: true`), then fill to 3 terms with `new` terms from the current unit.
2. Pick one feed post that contains one of those terms (for the `real_post` card).
3. LLM call (JSON) → 6 cards: 3 concept, 1 mcq, 1 match (4 pairs), 1 real_post. Validate with zod. Give each card an id.
4. **Fallback:** if the LLM call fails or validation fails, build the cards from a template using term definitions (concept cards straight from `definitions[level]`; mcq with distractors from other terms' definitions; match from 4 known terms). **This fallback must always work.**

## 5. AI prompts
**`enrichPost`** (JSON mode)
```
You help non-technical people understand AI news. Post by {author} ({archetype}) on {source}:
"""{text}"""
The text may contain page clutter (nav links, "Follow", like counts) — ignore it.
Return JSON: {
 "tldr": {"beginner": "≤2 sentences, zero jargon, everyday analogy",
          "amateur": "≤2 sentences, plain language, common AI terms ok",
          "pro": "≤2 sentences, precise, technical/business implication"},
 "whyItMatters": "1 sentence: why this matters right now",
 "jargon": ["AI/tech terms a beginner wouldn't know, EXACTLY as written in the post"],
 "authorGuess": "string or null", "topic": "≤4 words"
}
```
Then map each `jargon` string to a term: case-insensitive match on `term` or `aliases`. If there's no match, create the term with a second LLM call (`definitions` for 3 levels + `analogy` + `category`). Output `terms: [{id, term: <exact post text>}]`.

**Lesson cards:** same as PRD §7.5, plus "Return JSON exactly matching: {Card schema from contract}".

**Chat system prompt**
```
You are Decoded, a patient AI tutor. Learner level: {level}. Goal: {goal}.
They are reading this post by {author} ({archetype}): """{text}"""
TL;DR: {tldr[level]}
Explain at their level, define jargon inline in (parentheses), stay under 120 words,
end with one short question to check understanding.
```

## 6. `/api/decode` (the live link decoder)
```
decode({url, text}):
  if url && decodeCache[url] → return {ok:true, post, method:"cache"}
  if text → extracted = {text, author:null, source: detect(url) ?? "user"}         // method "text"
  else:
    src = detect(url)   // x | linkedin | substack/other
    try in order, stop at first good result (≥40 chars, no login-wall phrases):
      x:        oEmbed  → og
      linkedin: og      → readability → apify(if token)
      other:    readability → og
    if none → return {ok:false, needsText:true, url, reason}
  on any exception: if demo_decodes[url] → return {ok:true, post, method:"demo"}
  post = enrichPost(...) → source "user", createdBy userId, author from oEmbed/og/authorGuess
  queue nothing automatically (frontend shows terms; user taps to queue)
  save post + cache → return {ok:true, post, method}
```
- **X oEmbed:** `GET https://publish.twitter.com/oembed?url={encoded}&omit_script=1&dnt=true` → strip HTML tags from `html` (take the `<p>` text), `author_name`, `author_url`.
- **og:** fetch with a desktop Chrome `User-Agent`, `Accept-Language: en-US`, 8s `AbortController` timeout → `og:description`, `og:title`, `article:author`.
- **readability:** `new JSDOM(html, {url})` → `new Readability(doc).parse()` → `textContent` trimmed to 4,000 characters, `byline`, `title`.
- **Login-wall phrases:** "Sign in", "Log in", "Join LinkedIn", "Agree & Join", "JavaScript is not available".
- ⚠️ **Test X oEmbed and one LinkedIn URL from Replit in the first 30 minutes** and tell the frontend owner what works.

## 7. Seed content (start this in parallel; it's the most time-consuming part)
- `terms.json`: ~40 terms across 5 categories (list in PRD §7.6). Generate the drafts with an LLM, then skim them.
- `authors.json`: ~15 real public voices, about 4 per archetype, with `whyFollow` and `difficulty`.
- `posts.json`: ~25 real recent public posts (text + URL + authorId + source + publishedAt).
- `placement.json`: 5 questions of increasing difficulty with an answer key.
- `path.json`: 5 units (Foundations 🧱, Models 🧠, Building 🛠️, Business of AI 💰, Frontier 🚀).
- Run `scripts/enrich-seed.ts` once → `enriched_posts.json` (commit it). **The feed never calls the AI at request time.**
- `demo_decodes.json`: decode your 3 rehearsal links once and save the results.

## 8. Build order (backend)
1. Express skeleton, CORS, `/health`, store, seed loaders, **publish → share URL** (≤45 min)
2. `GET /me`, `/feed`, `/terms/:id`, `/authors`, `/path` from seed (no AI) → **frontend can switch these to live**
3. `llm.ts` + `enrichPost` + seed enrich script
4. `/decode` with the text path first, then X oEmbed → og → readability → demo fallback
5. `/lesson/today` with template fallback first, then the LLM version; `/answer`, `/complete`, `/terms/:id/queue`, dev routes
6. `/chat`
7. `/placement`, `/feed/refresh` (Substack)

## 9. Replit Agent prompt (backend)
```
Build ONLY the backend API for "Decoded" (Duolingo for learning AI). Node 20 + Express + TypeScript, CORS open,
JSON-file storage, all routes under /api, single demo user via X-User-Id header (default "demo").
Implement the attached API contract EXACTLY (types, routes, response shapes). Use the attached backend spec for
logic: seed JSON in server/seed, an enrichPost LLM function (env LLM_API_KEY), a template fallback for lesson
generation, and /api/decode with X oEmbed → og tags (cheerio) → @mozilla/readability → {needsText:true} fallback,
plus demo_decodes.json cache. No frontend.
[paste 1_API_CONTRACT.md and this spec]
Start with: skeleton, /api/health, seed loaders, and GET /me, /feed, /terms/:id, /authors, /path returning seed data.
```
