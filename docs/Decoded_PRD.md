# Decoded — PRD (Hackathon Build)
**Tagline:** *Learn AI the way you learned your first language: a little every day, from what people are actually saying.*
**Owner:** Chaitanya Medipally · **Target:** Functional demo by 3:00 PM · **Platform:** Replit

---

## 1. The problem (why this matters)

Non-technical people and novices want into AI but hit three walls:

| Wall | What it looks like | Consequence |
|---|---|---|
| **Vocabulary** | "RAG," "evals," "MoE," "agentic," "inference costs" — every post assumes you know them | Can't consume content or hold a conversation |
| **Signal** | Don't know who to follow (researchers vs. VCs vs. operators) or why a post matters *today* | Doom-scroll noise, or give up |
| **Consistency** | Motivated for 1–2 days, then overwhelmed | No compounding; churn |

**Who:** MBA students, PMs, marketers, consultants, career-switchers, executives — smart people without a CS background. Rough size: hundreds of millions of knowledge workers being told to "get AI-literate."

**Why now:** AI vocabulary changes weekly. Static courses go stale the day they ship; social feeds are current but unreadable to beginners. Nothing sits in between.

---

## 2. Unique insight (lead with this in the pitch)

> **Existing tools separate *learning* from *reading*. Courses teach yesterday's concepts; feeds show today's conversation in a language you don't speak. Decoded fuses them: the live feed *is* the curriculum.**

Three mechanics make this real:

1. **Feed → Lesson loop.** Every post is scanned for jargon. Terms the user doesn't know are highlighted; tapping one gives a level-appropriate explanation **and drops that term into tomorrow's daily lesson.** Your lessons are built from what you actually tried to read.
2. **Same post, three readings.** A single post gets a TL;DR at the user's level (Beginner / Amateur / Pro). As you level up, the same feed literally gets harder — progress you can *feel*.
3. **"Why it matters today."** Each post has a one-line context note (what happened, who this person is, why the industry cares) — the context a novice is missing, not just definitions.

One-liner: **"Duolingo for AI, where today's internet is the textbook."**

---

## 3. Goals & non-goals (for the hackathon)

**Goals**
- A working end-to-end flow: onboarding → placement → daily lesson → streak/XP → feed → tap term → deep-dive chat → term lands in next lesson.
- Real LLM calls (not mocked) for TL;DR, term explanations, quiz generation, and deep-dive chat.
- At least one source that is actually live (Substack RSS).

**Non-goals (say so honestly if asked)**
- Live X / LinkedIn scraping (X API is paid/rate-limited; LinkedIn has no public feed API and scraping breaks ToS). **Demo uses a curated snapshot of real public posts**, with the ingestion interface built so a real connector can be plugged in.
- Auth, payments, notifications, mobile app.

---

## 4. Personas & levels

| Level | Who | Placement signal | Explanation style |
|---|---|---|---|
| 🌱 **Beginner** | "I've used ChatGPT" | 0–2 of 5 quiz right | Analogies, no jargon, 2 sentences |
| 🌿 **Amateur** | "I know what an LLM is" | 3–4 of 5 | Plain definition + example + 1 related term |
| 🌳 **Pro** | "I read papers / build things" | 5 of 5 | Precise, trade-offs, why it's debated |

---

## 5. Core user flows

### Flow A — Onboarding & placement (≤ 60 sec)
1. Welcome → "What's your goal?" (Talk to engineers at work / Invest / Switch careers / Just curious)
2. 5-question placement quiz (multiple choice, escalating difficulty)
3. Result screen: level badge + "Your daily goal: 5 min" → CTA "Start Day 1"

### Flow B — Daily Lesson (Duolingo loop, ~5 min)
1. Home ("Learn" tab): streak 🔥, XP bar, level, today's lesson card, "Words from your feed" chip count
2. Lesson = 5–6 cards, mixed types:
   - **Concept card** (term, explanation at level, analogy)
   - **Multiple choice** ("Which best describes RAG?")
   - **Match pairs** (term ↔ definition)
   - **"Read the real post"** — a short real post snippet; question: "What is this person claiming?"
   - **Fill-in-the-blank**
3. Correct = +10 XP, haptic-style green flash; wrong = show explanation, re-queue card at end
4. Completion screen: XP earned, streak +1, "You now know 3 words used in 41 posts today" (← key emotional moment)

### Flow C — Feed ("Pulse" tab)
1. List of post cards: avatar, name, **archetype tag** (Researcher / Builder / Investor / Operator), source icon (X / LinkedIn / Substack), timestamp
2. Each card shows: **TL;DR at user level**, **"Why it matters"** line, jargon terms **underlined**
3. Tap underlined term → bottom sheet: explanation at level + "Added to tomorrow's lesson ✓"
4. Tap "Dive deeper" → Chat view with post pre-loaded as context; suggested prompts: *"Explain like I'm new"*, *"Who is this person?"*, *"What's the counter-argument?"*, *"How would I mention this in a meeting?"*
5. Filter chips: All / Researchers / Builders / Investors / Operators

### Flow E — Decode Any Post (the "Decode" button) ⭐ live-demo feature
1. Floating **"+ Decode"** button on Pulse (and on Home). Opens a sheet with one input: *"Paste a link or the post text."*
2. User pastes an X, LinkedIn, Substack or any article URL → **"Decoding…"** progress steps animate: *Fetching post → Spotting jargon → Writing your TL;DR*.
3. Result is a full post card (same as the Pulse feed): author, source, TL;DR at the user's level, why it matters, underlined terms, Dive deeper.
4. If the link can't be fetched, show inline: *"This site hides its posts from us. Paste the text instead 👇"*. The text box expands with the URL kept for attribution, and the user pastes the text and decodes it.
5. Decoded posts are saved to a **"My Decodes"** filter chip on Pulse, and their terms feed tomorrow's lesson like any other post.

**Why it matters for the pitch:** it handles the X and LinkedIn problem honestly and works live on stage. A judge can hand you any post and you decode it in front of them.

### Flow D — Who to Follow ("People" tab, stretch)
- Curated list of ~15 voices grouped by archetype, each with: one-line "why follow," difficulty rating (🌱/🌿/🌳), and "Follow in Decoded" toggle that boosts them in Pulse.

---

## 6. Screens (for the UX build)

| # | Screen | Key components |
|---|---|---|
| 1 | Welcome / Goal | Logo, tagline, 4 goal tiles |
| 2 | Placement Quiz | Progress bar, question, 4 options, feedback |
| 3 | Level Result | Badge animation, level description, CTA |
| 4 | **Learn (Home)** | Streak flame + count, XP bar, level, "Today's lesson" card, "From your feed" chips, skill path (Duolingo-style nodes: Foundations → Models → Building → Business of AI → Frontier) |
| 5 | Lesson Player | Card stack, progress bar, check button, correct/incorrect bottom banner |
| 6 | Lesson Complete | XP, streak, "words unlocked" stat, confetti |
| 7 | **Pulse (Feed)** | Filter chips, post cards with TL;DR, why-it-matters, underlined terms |
| 8 | Term Sheet | Term, level explanation, analogy, "Added to lesson" toast |
| 9 | Deep Dive Chat | Post pinned on top, chat bubbles, suggested prompt chips |
| 10 | People (stretch) | Archetype sections, follow toggles |
| 11 | **Decode sheet** | URL/text input, paste-from-clipboard button, 3-step animated progress, error state with "paste text instead" fallback, result as a post card |

**Nav:** bottom tab bar — Learn · Pulse · People · Me
**Visual direction:** Duolingo-bright but grown-up. White background, one bold accent (e.g., electric green `#22C55E` for success, violet `#7C3AED` brand), rounded 16px cards, big friendly type, emoji for levels. Mobile-first frame (max-width 420px centered) — it demos better on a projector.

---

## 7. Backend capabilities

### 7.1 Stack (fastest path on Replit)
- **Frontend:** React + Vite + Tailwind (Replit Agent default)
- **Backend:** Node/Express (or Python FastAPI)
- **DB:** Replit Postgres (or Replit DB / JSON file if short on time)
- **LLM:** OpenAI or Anthropic via API key in Replit Secrets (`LLM_API_KEY`)
- **Live source:** Substack RSS via `rss-parser` (e.g., `https://<pub>.substack.com/feed`)

### 7.2 Data model

```
User        { id, name, goal, level: 'beginner'|'amateur'|'pro', xp, streak, lastActiveDate }
Term        { id, term, category, difficulty(1-3), defBeginner, defAmateur, defPro, analogy }
UserTerm    { userId, termId, status: 'queued'|'learning'|'known', source: 'lesson'|'feed', addedAt }
Post        { id, source: 'x'|'linkedin'|'substack', authorId, url, text, publishedAt,
              tldr: {beginner, amateur, pro}, whyItMatters, termIds[] }   // tldr cached
Author      { id, name, handle, archetype, bio, whyFollow, difficulty }
Lesson      { id, userId, date, cards: Card[], completed, xpEarned }
Card        { type: 'concept'|'mcq'|'match'|'real_post'|'fill_blank', payload }
ChatMessage { userId, postId, role, content }
```

### 7.3 API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/onboarding` | Save goal; return 5 placement questions |
| POST | `/api/placement` | Score answers → set level |
| GET | `/api/me` | Profile, level, XP, streak |
| GET | `/api/lesson/today` | Build/return today's lesson (queued feed terms first, then path terms) |
| POST | `/api/lesson/:id/answer` | Grade card, award XP |
| POST | `/api/lesson/:id/complete` | Update streak, mark terms `learning` |
| GET | `/api/feed?archetype=` | Posts with level-specific TL;DR + term spans |
| POST | `/api/feed/refresh` | Pull Substack RSS → run enrichment pipeline |
| GET | `/api/term/:id` | Level-appropriate explanation |
| POST | `/api/term/:id/queue` | Add term to user's next lesson |
| POST | `/api/chat` | `{postId, message}` → LLM answer grounded in post + user level |
| GET | `/api/authors` | Who-to-follow list |
| POST | `/api/decode` | `{url?, text?}` → fetch (if URL) → enrich → save as Post (`source: 'user'`) → return post card. Returns `{needsText: true}` if fetching fails |

### 7.4 Enrichment pipeline (runs on ingest; cache results)
```
raw post → LLM call #1 (JSON mode):
  { tldr_beginner, tldr_amateur, tldr_pro, why_it_matters, jargon_terms: [..] }
→ match jargon_terms to Term table (fuzzy); create new Term rows if missing (LLM call #2 generates defs)
→ store; frontend underlines terms by string match
```

### 7.4b Link fetcher for `/api/decode` (built for real, with fallbacks)
Detect the source from the URL, then try each method in order and stop at the first one that returns at least 40 characters of text:

| Source | Try 1 | Try 2 | Try 3 |
|---|---|---|---|
| **X / Twitter** (`x.com`, `twitter.com`) | **Official oEmbed:** `GET https://publish.twitter.com/oembed?url={url}&omit_script=1`. Free, no key needed. Strip the HTML from `html` to get the post text, and use `author_name`. | Page metadata (`og:description`, `og:title`) | Paste fallback |
| **LinkedIn** (`linkedin.com/posts/...`, `/feed/update/...`) | Fetch the public page with a normal browser user-agent, then read `og:description` and `og:title`. Public posts often expose the first ~300 characters plus the author. | Readable text from the page (see Substack row) | Paste fallback |
| **Substack / blogs / news** | `@mozilla/readability` + `jsdom`, which returns the article title, author and main text (trim to ~4,000 characters) | `og:` tags | Paste fallback |
| **Anything else** | Readable page text, then `og:` tags | | Paste fallback |

**Implementation notes**
- Node packages: `cheerio` (reads `og:` tags), `@mozilla/readability` + `jsdom` (article text), plus the built-in `fetch` with an 8-second timeout.
- Set `User-Agent` to a normal desktop Chrome string and `Accept-Language: en-US`.
- If the text is a login wall (it contains "Sign in", "Log in to", "Join LinkedIn" or is under 40 characters), treat it as a failure and move on to the next method.
- Return `{ text, author, source, url, method }`. Show `method` in a tiny dev label so you know which path worked during rehearsal.
- **Cache by URL.** A second decode of the same link is instant.
- **Optional upgrade if time allows:** an `APIFY_TOKEN` secret. If it's set, try Apify's ready-made X or LinkedIn post scrapers before falling back to pasting.

**Two-level fallback strategy**
1. **Product fallback (user-facing):** if every fetch method fails, return `{needsText: true}`. The UI asks the user to paste the text and keeps the URL for attribution. The user never sees a dead end.
2. **Demo fallback (stage insurance):** `seed/demo_decodes.json` holds 3 posts you've already decoded, keyed by URL. If the live fetch and AI call fail on stage, serve the saved result for that URL after a short delay (~1.5s) so the progress animation still plays. Rehearse with these exact 3 links. Use a live, unknown link only if the network is behaving.

### 7.5 Core prompts

**Post enrichment**
```
You help non-technical people understand AI news. Given this post by {author} ({archetype}):
"""{text}"""
Return JSON:
- tldr_beginner: ≤2 sentences, zero jargon, use an everyday analogy
- tldr_amateur: ≤2 sentences, plain language, may use common AI terms
- tldr_pro: ≤2 sentences, precise, note the technical/business implication
- why_it_matters: 1 sentence on why this is relevant right now
- jargon_terms: list of AI/tech terms a beginner wouldn't know, exactly as written in the post
```

**Lesson generation**
```
Create a 6-card lesson for a {level} learner whose goal is "{goal}".
Terms to teach: {termList}. Real post snippet to include: "{snippet}".
Card types: 1 concept per term, 2 mcq, 1 match (4 pairs), 1 real_post comprehension.
Return JSON array of cards matching this schema: {schema}. Keep explanations at {level} level.
```

**Decode (user-submitted post).** Use the same enrichment prompt with this added at the top:
```
The text below was extracted from {source} and may contain leftover page clutter
(nav links, "Follow", like counts, cookie notices). Ignore the clutter and decode only the author's post.
If the text isn't about AI/tech, still summarize it, set jargon_terms to [] and set
why_it_matters to how it relates to AI if at all, or "Not AI-related".
Also return: author_guess (string or null), topic (≤4 words).
```

**Deep-dive chat (system)**
```
You are Decoded, a patient AI tutor. The learner is {level}; goal: {goal}.
They are reading this post: """{post}""" by {author} ({archetype}).
Explain at their level, define any jargon inline in (parentheses), keep answers under 120 words,
and end with one short follow-up question to check understanding.
```

### 7.6 Seed data (do this first — it de-risks the demo)
- **~40 terms** across 5 path units: *Foundations* (AI vs ML, LLM, prompt, token, training vs inference) · *Models* (parameters, context window, multimodal, open vs closed weights, hallucination) · *Building* (RAG, embeddings, fine-tuning, agents, evals, MCP) · *Business of AI* (compute, GPUs, inference cost, moats, foundation model vs app layer, ARR multiples) · *Frontier* (reasoning models, scaling laws, alignment, AGI debate).
- **~15 authors** across the four archetypes (pull real public figures you'd recommend; include 1-line "why follow").
- **~25 posts**: copy text of real recent public posts from X/LinkedIn into `seed/posts.json` (with URLs for attribution) + 2–3 live Substack feeds.
- **Pre-run enrichment** on seed posts so the feed loads instantly during demo (no LLM latency on stage).

---

## 8. Gamification rules (keep simple)
- XP: +10 correct, +5 for each feed term explored, +20 lesson complete, +15 deep-dive chat (≥2 messages)
- Streak: +1 if lesson completed on a new calendar day; demo has a "simulate next day" dev button
- Level-up: Beginner → Amateur at 300 XP, Amateur → Pro at 800 XP (or pass a checkpoint quiz)
- "Words you know" counter + "% of today's feed you can now read" ← **headline metric, show it big**

---

## 9. Success metrics (for the pitch slide)
- **North star:** % of today's feed the user can read without tapping a term ("Feed Fluency")
- D1 / D7 retention, streak length, lessons/week
- Feed→lesson conversion (terms tapped that get mastered)

---

## 10. Build plan to 3:00 PM (adjust to your start time)

| Block | Task | Done = |
|---|---|---|
| **H0 (45 min)** | Paste Replit Agent prompt (§12); scaffold app, tabs, routing, Tailwind theme | 4 tabs render |
| **H0:45 (45 min)** | Seed JSON (terms, authors, posts); run enrichment script once; cache output | Feed shows real TL;DRs |
| **H1:30 (60 min)** | Learn tab + Lesson player (concept, MCQ, match) + XP/streak | Can complete a lesson |
| **H2:30 (45 min)** | Pulse: underlined terms → sheet → queue to lesson; Deep Dive chat | Full loop works |
| **H3:15 (45 min)** | **Decode feature:** `/api/decode` with paste-text path first (≈10 min), then the X oEmbed, `og:` tag and readable-text fetchers, then the demo fallback cache | Paste a real X link → card appears |
| **H4:00 (30 min)** | Onboarding/placement; Substack live refresh; polish | End-to-end demo |
| **Last 30 min** | **Freeze code.** Rehearse demo 3×. Record a backup screen video. | Calm |

**Cut order if behind:** People tab → Placement quiz (use a simple level picker instead) → Match card → live RSS → LinkedIn/article fetchers (keep X oEmbed + paste). **Never cut:** the feed→term→lesson loop, deep-dive chat, and Decode with the paste fallback. Those are what set you apart.

**Build tip:** build the paste-text path of Decode *first*. It needs only the AI call. Then add the link fetchers one at a time behind it, so the feature works at every point in the build.

---

## 11. Demo script (3 min) — maps to judging criteria

1. **Problem (25%) — 30s:** "Show of hands: who's seen a post about 'agentic RAG evals' and nodded along? 🙋 Courses are stale by launch; feeds are unreadable. People quit in 2 days." One stat on AI-literacy demand.
2. **Insight (25%) — 20s:** "Courses separate learning from reading. We fuse them: today's internet *is* the textbook."
3. **Working product (25%) — 100s, live:**
   - Onboard as "MBA, wants to talk to engineers" → placed as 🌱 Beginner
   - Open **Pulse**: a real post → TL;DR in plain English + "why it matters"
   - Tap "**inference cost**" → explanation → "Added to tomorrow's lesson"
   - **Toggle level to Pro** → same post, TL;DR rewrites (wow moment)
   - **"Got a post you didn't understand this week?"** Tap **+ Decode** and paste a real X link. The progress steps animate and a decoded card appears. (Bonus: ask a judge for a link.)
   - "Dive deeper" → ask *"How would I bring this up in a meeting?"*
   - Hit "simulate next day" → **Learn** tab: lesson now contains *inference cost* from the feed → answer 2 cards → streak 🔥 2, "You can now read 78% of today's feed"
4. **Close — 30s:** vision (team plans for companies upskilling staff, B2B), metric = Feed Fluency, ask.

**Demo tips:** pre-seed the demo user mid-journey (streak 6) so it looks lived-in; keep a cached fallback for every LLM call; have the backup video ready.

---

## 12. Paste-ready Replit Agent prompt

```
Build a mobile-first web app called "Decoded" — Duolingo for learning AI, for non-technical people.
Stack: React + Vite + Tailwind frontend, Express backend, Postgres (or JSON file storage), OpenAI-compatible
LLM via env var LLM_API_KEY. Center the app in a 420px-wide phone frame. Brand color violet #7C3AED,
success green #22C55E, rounded-2xl cards, playful but clean.

Bottom tab nav: Learn, Pulse, People, Me.

1) Onboarding: goal picker (4 tiles) → 5-question multiple-choice placement quiz → assign level
   beginner/amateur/pro → result screen.
2) Learn tab: streak flame + count, XP bar, level badge, "Today's lesson" card, a vertical skill path of
   5 units (Foundations, Models, Building, Business of AI, Frontier). Lesson player shows 6 cards one at a
   time: concept, multiple choice, match pairs, real-post comprehension. Green/red feedback banner,
   +10 XP per correct answer, completion screen with confetti, XP, streak, and
   "You can now read X% of today's feed". Add a dev button "Simulate next day".
3) Pulse tab: feed of post cards (author, archetype tag Researcher/Builder/Investor/Operator, source icon
   X/LinkedIn/Substack). Each card shows a TL;DR for the user's level, a "Why it matters" line, and AI
   jargon terms underlined. Tapping a term opens a bottom sheet with a level-appropriate explanation and
   adds the term to the user's next lesson (toast: "Added to tomorrow's lesson"). "Dive deeper" opens a chat
   with the post pinned on top and suggested prompts: "Explain like I'm new", "Who is this person?",
   "What's the counter-argument?", "How would I mention this in a meeting?". Filter chips by archetype.
   Include a level toggle on Pulse so the TL;DR switches between beginner/amateur/pro.
4) People tab: authors grouped by archetype with "why follow" and follow toggle.
5) Backend endpoints: /api/me, /api/placement, /api/lesson/today, /api/lesson/:id/answer,
   /api/lesson/:id/complete, /api/feed, /api/feed/refresh (pull Substack RSS with rss-parser),
   /api/term/:id, /api/term/:id/queue, /api/chat, /api/authors.
   Lesson generation prioritizes terms the user queued from the feed.
   On ingest, call the LLM once per post (JSON mode) to produce tldr_beginner, tldr_amateur, tldr_pro,
   why_it_matters, jargon_terms; cache results in the DB.
6) "Decode any post" feature: a floating "+ Decode" button opens a sheet with one input (URL or pasted
   text) and a paste-from-clipboard button. POST /api/decode {url?, text?}. On the server, detect the source:
   - x.com / twitter.com: GET https://publish.twitter.com/oembed?url={url}&omit_script=1, then strip the HTML
     from the "html" field to get the post text; author = author_name.
   - linkedin.com and everything else: fetch the page with a desktop Chrome User-Agent and an 8s timeout.
     Try @mozilla/readability + jsdom for the article text, then fall back to og:description/og:title via cheerio.
   - Treat results under 40 characters, or text containing login-wall phrases ("Sign in", "Join LinkedIn"),
     as failures and try the next method.
   - If every method fails, return {needsText:true}. The UI then shows "This site hides its posts — paste the text
     instead" with an expanded textarea and keeps the URL for attribution.
   - If optional env APIFY_TOKEN is set, try an Apify X/LinkedIn post scraper before giving up.
   - Cache results by URL. Also load seed/demo_decodes.json (saved results keyed by URL) and serve those
     if the live path errors.
   Run the extracted text through the same enrichment AI call (tell the AI to ignore page clutter), save it as a
   Post with source 'user', and return it as a normal post card. Show a 3-step animated progress
   (Fetching post → Spotting jargon → Writing your TL;DR). Add a "My Decodes" filter chip on Pulse.
   Terms from decoded posts are queued into the next lesson like feed terms.
7) Seed data in /seed: terms.json (40 AI terms with beginner/amateur/pro definitions + analogy),
   authors.json (15), posts.json (25). Create a script to enrich seed posts ahead of time.
   Every LLM call must have a cached fallback so the UI never shows an empty state.
Start with seed data and the Pulse + Learn tabs working end to end.
```

---

## 13. Future roadmap (one slide, shows ambition)
- Live X / LinkedIn connectors via official APIs + user-imported follow lists
- "Meeting mode": paste a doc/meeting agenda → pre-teach the jargon in it
- Teams/B2B: company AI-literacy programs, manager dashboards
- Voice lessons for commute; weekly "what changed in AI" recap
- Spaced repetition on terms (SM-2) for long-term retention
