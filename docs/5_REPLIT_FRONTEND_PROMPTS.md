# Replit Agent prompts: Frontend (paste in order)

**How to use:**
1. Create a new Replit app and choose the **React / Vite** web app option if you're asked.
2. **Attach `1_API_CONTRACT.md` and `2_FRONTEND_SPEC.md`** to the Agent chat (drag them in). If attachments don't work, prompt 1 is self-contained anyway.
3. Paste **Prompt 1**. Wait until it runs and you've checked the preview. Then paste **Prompt 2**, and so on.
4. After each step, click through the preview. If something's off, give the Agent one short fix ("The term sheet doesn't close when I tap outside — fix it") before moving on.
5. If the Agent tries to add Express, a database or a server: **"Stop — frontend only, no backend. All data comes from src/mocks.ts."**

---

## Prompt 1: Foundation (types, mock data, API layer, shell)

```
Build ONLY the frontend of a mobile-first web app called "Decoded" — "Duolingo for learning AI" for non-technical
people. DO NOT build a backend, server, or database. All data comes from a mock layer for now; a separate backend
will be connected later via an environment variable.

STACK: React + Vite + TypeScript + Tailwind CSS, react-router-dom, framer-motion, canvas-confetti, lucide-react.
Font: Nunito (Google Fonts).

LAYOUT: Render the whole app inside a centered phone frame (max-width 420px, full height, rounded corners and shadow
on desktop, full-bleed on mobile). Bottom tab bar with 4 tabs: Learn (/learn), Pulse (/pulse), People (/people),
Me (/me). Default route → /learn.

COLORS: brand violet #7C3AED, success #22C55E, error #EF4444, streak orange #F97316, background #FAFAF9,
text #1C1917. Archetype pill colors: researcher=blue, builder=green, investor=amber, operator=pink.
Cards rounded-2xl, bold friendly headings, playful but clean.

1) Create src/types.ts with exactly these types:
type Level = "beginner"|"amateur"|"pro"; type Archetype = "researcher"|"builder"|"investor"|"operator";
type Source = "x"|"linkedin"|"substack"|"user"; type Goal = "work"|"invest"|"switch"|"curious";
interface User { id; name; goal: Goal|null; level: Level; xp: number; streak: number; wordsKnown: number;
  feedFluency: number; queuedTermsCount: number; onboarded: boolean }
interface Author { id; name; handle; archetype: Archetype; avatarUrl: string|null; bio; whyFollow; difficulty: Level; following: boolean }
interface TermRef { id: string; term: string }  // term = exact text as it appears in the post
interface Post { id; source: Source; url: string|null; author: {id,name,handle,archetype,avatarUrl}; publishedAt: string;
  text: string; tldr: Record<Level,string>; whyItMatters: string; terms: TermRef[]; topic: string|null }
interface Term { id; term; category; definitions: Record<Level,string>; analogy: string; status: "new"|"queued"|"learning"|"known" }
type Card =
 | {id; type:"concept"; termId; term; explanation; analogy; fromFeed: boolean}
 | {id; type:"mcq"; question; options: string[]; answerIndex: number; explanation}
 | {id; type:"match"; pairs: {left: string; right: string}[]}
 | {id; type:"real_post"; author; postSnippet; question; options: string[]; answerIndex: number; explanation}
 | {id; type:"fill_blank"; sentence /* contains ___ */; options: string[]; answerIndex: number; explanation}
interface Lesson { id; date; unitTitle; cards: Card[]; completed: boolean }
interface PathUnit { id; title; emoji; status: "done"|"current"|"locked"; progress: number }
interface PlacementQuestion { id; question; options: string[] }
interface ChatMessage { role: "user"|"assistant"; content: string }

2) Create src/api.ts exporting an `api` object with these async functions. Each calls
`${import.meta.env.VITE_API_BASE_URL}/api<path>` with headers {"Content-Type":"application/json","X-User-Id":"demo"},
UNLESS import.meta.env.VITE_USE_MOCKS === "true" (treat missing as true) and the function name is not in a
`LIVE` Set at the top of the file — then it returns data from src/mocks.ts.
 getMe GET /me → User | updateMe PATCH /me {level?,name?} → User | getPath GET /path → {units}
 getPlacementQs GET /placement/questions → {questions} | submitPlacement POST /placement {goal,answers:number[]} → {level,score,user}
 getTodayLesson GET /lesson/today → Lesson | answerCard POST /lesson/:id/answer {cardId,correct} → {xpAwarded,user}
 completeLesson POST /lesson/:id/complete → {xpAwarded,streak,wordsLearned:string[],feedFluencyBefore,feedFluencyAfter,user}
 getFeed GET /feed?archetype=&source= → {posts} | getTerm GET /terms/:id → Term | queueTerm POST /terms/:id/queue → {queued,queuedTermsCount}
 decode POST /decode {url?,text?} → {ok:true,post,method} OR {ok:false,needsText:true,url,reason}
 chat POST /chat {postId,messages} → {reply,suggestions:string[]}
 getAuthors GET /authors → {authors} | follow POST /authors/:id/follow {follow} → {following}
 devNextDay POST /dev/next-day → {user} | devReset POST /dev/reset → {user}
Errors: non-2xx responses have {error:{code,message}} — throw Error(message).

3) Create src/mocks.ts with realistic, STATEFUL in-memory mock data (400ms fake delay):
 - User: name "Chai", level beginner, xp 240, streak 6, wordsKnown 18, feedFluency 62, onboarded true.
 - 5 path units: Foundations 🧱 (done), Models 🧠 (done), Building 🛠️ (current, 0.4), Business of AI 💰 (locked), Frontier 🚀 (locked).
 - 15 terms with beginner/amateur/pro definitions + analogy: LLM, token, inference, inference cost, RAG, agent,
   embeddings, fine-tuning, context window, hallucination, evals, open weights, GPU, reasoning model, MCP.
 - 10 realistic posts about current AI topics, mixed sources (x, linkedin, substack) and archetypes, each with all 3
   TL;DR levels, whyItMatters, and 2–4 terms whose `term` text appears verbatim in the TL;DRs/text.
 - 8 authors (2 per archetype) with whyFollow lines. Use fictional names.
 - 5 placement questions of increasing difficulty.
 - Today's lesson: 6 cards (2 concept, 1 mcq, 1 match with 4 pairs, 1 real_post, 1 fill_blank).
 - State behaviors: answerCard correct → +10 xp; completeLesson → +20 xp, streak+1, fluency 62→78;
   queueTerm → queuedTermsCount+1, +5 xp, and the term appears as a concept card with fromFeed:true at the
   start of the NEXT lesson after devNextDay; decode → wait 2.5s; if url contains "linkedin" and no text,
   return {ok:false,needsText:true,url,reason:"LinkedIn requires login for this post."}; otherwise return a
   new decoded Post with source "user" that appears under getFeed({source:"user"});
   chat → canned beginner-friendly reply that mentions the post topic and ends with a check question, plus 3 suggestions.

4) Create AppContext with user, refreshUser(), setUser(), viewLevel/setViewLevel (defaults to user.level),
and toast(message). Header component `StreakHeader` shows 🔥 streak, XP progress bar, level chip (🌱/🌿/🌳).

5) Build the shell: PhoneFrame, TabBar (lucide icons, active tab violet), routes with placeholder pages for
Learn, Pulse, People, Me, plus /welcome, /placement, /result, /lesson/:id, /lesson/:id/done, /chat/:postId.
Reusable components: BottomSheet (framer-motion slide-up, tap backdrop to close), Toast, ProgressBar, LevelToggle.

Make sure the app runs and the tabs navigate.
```

---

## Prompt 2: Pulse feed (the core differentiator)

```
Build the Pulse tab (/pulse) fully, using api.getFeed.
- Top: title "Pulse", subtitle "What AI people are saying today", a LevelToggle (🌱 Beginner / 🌿 Amateur / 🌳 Pro)
  bound to viewLevel in context, and horizontally scrollable filter chips:
  All, Researchers, Builders, Investors, Operators, My Decodes (source=user).
- PostCard component: avatar (initials circle if avatarUrl null), name, handle, archetype pill, source icon
  (X / LinkedIn / Substack / "Decoded"), relative time. Body = tldr[viewLevel] rendered through TermHighlighter.
  Then a soft violet box "💡 Why it matters: …". A "Show original" expander showing the original text (also highlighted).
  Footer buttons: "Dive deeper" (→ /chat/:postId) and "Source ↗" (opens url in new tab if present).
  Switching the level toggle must instantly re-render all TL;DRs with a subtle fade.
- TermHighlighter({text, terms}): case-insensitive match of each terms[].term in text, longest terms first, no
  overlapping matches; wrap matches in a button with a dotted violet underline. Terms not found in the text are
  shown as small chips below the TL;DR ("In this post: RAG · Agents").
- Tapping a term opens a BottomSheet: term name, category tag, definitions[viewLevel], "Think of it like: {analogy}",
  and a primary button "➕ Add to tomorrow's lesson" → api.queueTerm → button becomes "✓ Added" and toast
  "Added to tomorrow's lesson · +5 XP"; update user in context. If status is learning/known show "✓ You know this".
- Loading skeleton cards while fetching; empty state for My Decodes ("Decode your first post →").
```

## Prompt 3: Learn tab + Lesson player + Completion

```
Build the Learn flow.
/learn: StreakHeader at top. Big "Today's lesson" card (unitTitle, "~5 min", count of cards) with a badge
"✨ N words from your feed" when any concept card has fromFeed:true, and a big "Start" button → /lesson/:id.
Below, a Duolingo-style vertical zig-zag skill path of the 5 PathUnits as large circular nodes with emoji
(done = green with check, current = violet pulsing ring with progress, locked = grey with lock).

/lesson/:id: top bar with X (close) and ProgressBar. Show one card at a time with framer-motion slide transitions.
Card UIs:
 - concept: "NEW WORD" label (plus "✨ From your feed" if fromFeed), huge term, explanation, analogy box, "Got it" button.
 - mcq: question + 4 tappable option tiles; "Check" button enabled after selection.
 - match: two columns of 4 tiles each (right column shuffled); tap a left then a right; correct pair turns green and
   fades, wrong pair shakes red. Card completes when all matched.
 - real_post: quoted post block with author name, then question + options like mcq.
 - fill_blank: sentence with a highlighted gap, option chips; selected chip fills the gap.
After Check: bottom banner slides up — green "Nice! +10 XP" or red "Not quite" with the explanation and correct answer;
"Continue" button. Call api.answerCard. Wrong cards are re-queued at the end of the lesson.
When all done: api.completeLesson → navigate to /lesson/:id/done with the result.

/lesson/:id/done: confetti burst, "Lesson complete!", XP count-up animation, streak flame with bump animation
("🔥 7 day streak"), a BIG stat card "You can now read 62% → 78% of today's feed" with an animated bar,
list of wordsLearned as chips, and "Continue" → /learn (refresh user).
```

## Prompt 4: Decode sheet (live link decoder UI)

```
Add the "Decode any post" feature.
- A floating action button "+ Decode" (violet, bottom-right above the tab bar) on /pulse and /learn.
- It opens a BottomSheet with 5 states:
 1. idle: heading "Decode any post", subtext "Paste a link from X, LinkedIn, Substack — or the post text.",
    a textarea, a "📋 Paste" button (navigator.clipboard.readText, fail silently), 3 sample chips
    ("X post", "LinkedIn post", "Substack") that fill in sample URLs (put them in a SAMPLE_LINKS constant so I can
    edit them), and a "Decode ✨" button. If input starts with http treat as {url}, else as {text}.
 2. loading: LoadingSteps component with 3 steps — "Fetching post", "Spotting jargon", "Writing your TL;DR" —
    each with spinner→check, advancing at 0s, 1.5s, 3s; the last step stays spinning until the response arrives.
 3. success: render the returned post with the PostCard component inside the sheet, a "Saved to My Decodes ✓"
    note, and a "Dive deeper" button.
 4. needsText (response ok:false): amber notice "This site hides its posts from us. Paste the text instead 👇",
    keep the URL shown small, expand a textarea for the text, resubmit with {url, text}.
 5. error (exception): same UI as needsText with message "Couldn't reach that link — paste the text instead."
- After success, if the user is on /pulse, refresh the feed.
```

## Prompt 5: Deep Dive chat

```
Build /chat/:postId. Get the post from the feed (fetch api.getFeed if not cached in context).
- Top: back button and the post pinned as a compact collapsible card (author + TL;DR at viewLevel).
- Chat area: assistant and user bubbles (assistant left, light violet; user right, violet with white text),
  typing indicator (3 bouncing dots) while waiting.
- Before any message, show starter chips: "Explain like I'm new", "Who is this person?",
  "What's the counter-argument?", "How would I mention this in a meeting?".
- Send full history to api.chat(postId, messages); render reply; show the returned suggestions as chips under
  the latest reply. Input bar fixed at the bottom with a send button; Enter sends.
- Render simple markdown in replies (bold, lists, line breaks).
```

## Prompt 6: Onboarding, People, Me + polish

```
1) /welcome: logo "Decoded" + tagline "Learn AI the way you learned your first language." and 4 goal tiles:
   "Talk to engineers at work" (work), "Invest in AI" (invest), "Switch into AI" (switch), "Just curious" (curious).
   → /placement: 5 questions from api.getPlacementQs, progress bar, tap an option to auto-advance →
   api.submitPlacement → /result: animated level badge (🌱 Beginner / 🌿 Amateur / 🌳 Pro) with a one-line
   description, "Your daily goal: 5 minutes", button "Start Day 1" → /learn.
   If user.onboarded is false on app load, redirect to /welcome.
2) /people: authors grouped by archetype (section headers with emoji), each row: avatar, name, handle,
   whyFollow, difficulty badge, and a Follow / Following toggle (api.follow, optimistic update).
3) /me: avatar, name, level switcher (api.updateMe), stats grid (streak, XP, words known, feed fluency %).
   Hidden dev panel: tapping the avatar 3 times reveals buttons "Simulate next day" (api.devNextDay) and
   "Reset demo" (api.devReset), both refresh the user and show a toast.
4) Polish everywhere: button press scale 0.97, page transitions, loading skeletons, no layout jumps,
   nothing overflows the 420px frame, all tap targets ≥ 44px.
```

---

## Prompt 7 (at integration): Connect to the backend
```
The backend is live at the URL in the VITE_API_BASE_URL secret. Add these function names to the LIVE set in
src/api.ts so they call the real API: getMe, getFeed, getTerm, getAuthors, getPath. Keep everything else on mocks.
Log API errors to the console and fall back to the mock response if a live call fails, so the UI never breaks.
```
(Add more names as your teammate finishes each endpoint. At the end, set `VITE_USE_MOCKS=false`.)

**Replit notes:**
- Add `VITE_API_BASE_URL` and `VITE_USE_MOCKS` in **Secrets**, then **restart** the app. Vite only reads env vars at startup.
- Use the backend's **published/deployment URL**, not the dev preview URL, because the dev preview can go to sleep.
- **Checkpoint:** after each prompt works, keep a working version (Replit checkpoints let you roll back if a later prompt breaks something).
