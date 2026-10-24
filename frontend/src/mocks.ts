// Stateful in-memory mock backend. Implements the same behavior the real backend will:
// queued feed terms show up in the next lesson, XP/streak/fluency update, decode, chat, etc.
import { AUTHORS, CURRICULUM, DEMO_DECODES, FRESH_TERMS, KNOWN_BY_LEVEL, LENS_PATH, PATH, PLACEMENT, POSTS, TERMS, WHY_BY_LENS, type SeedPost, type SeedTerm } from "./mockData";
import type {
  Archetype, Card, PathDay, PathUnit, Quest, ChatMessage, CompleteResult, DecodeResult, DailyGoal, Goal, HomeTab, Lens, Lesson, Level, Post, Source, Term, User,
} from "./types";

type Status = Term["status"];

const SHORT: Record<string, string> = {
  t_llm: "The type of AI behind ChatGPT", t_token: "A chunk of text (~¾ word)", t_prompt: "What you type to the AI",
  t_training: "The AI's learning phase", t_inference: "Running the AI to get an answer", t_hallucination: "Confident but false output",
  t_context_window: "How much the AI can read at once", t_parameters: "The model's learned 'knobs'", t_multimodal: "Handles text, images & audio",
  t_open_weights: "A model anyone can download", t_reasoning_model: "AI that thinks before answering", t_test_time_compute: "Extra effort while answering",
  t_rag: "AI looks things up before answering", t_embeddings: "Text turned into meaning-numbers", t_fine_tuning: "Extra lessons for one job",
  t_agent: "AI that takes actions for you", t_evals: "Report cards for AI", t_mcp: "A standard plug from AI to apps",
  t_vibe_coding: "Building apps by describing them", t_inference_cost: "The meter running on every AI answer", t_gpu: "The chips AI runs on",
  t_capex: "Big spending on data centers", t_moat: "What stops copycats", t_wrapper: "A thin app on someone else's model",
  t_scaling_laws: "Bigger + more data = smarter", t_agi: "Human-level AI (debated)", t_alignment: "Making AI do what we intend",
};

const lc = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

interface State {
  user: { id: string; name: string; goal: Goal | null; lens: Lens | null; level: Level; levels?: Partial<Record<Lens, Level>>; xp: number; streak: number; onboarded: boolean };
  status: Record<string, Status>;
  queueOrder: string[];
  day: number;
  lastLessonDay: number;
  lastGoalMetDay: number;
  lessonsCompleted: number;
  queuedByDay: Record<number, number>;
  decodesByDay: Record<number, number>;
  followsByDay: Record<number, number>;
  questXp: Record<string, boolean>;
  reads: Record<number, string[]>;
  dives: Record<number, string[]>;
  lessons: Record<number, Lesson & { termIds: string[] }>;
  following: Set<string>;
  userPosts: SeedPost[];
}

function makeState(level: Level, lens: Lens | null, opts: { streak: number; xp: number; onboarded: boolean }): State {
  const status: Record<string, Status> = {};
  const known = KNOWN_BY_LEVEL[level];
  TERMS.forEach((t) => (status[t.id] = known.includes(t.id) ? "learning" : "new"));
  return {
    user: { id: "demo", name: "John", goal: null, lens, level, levels: lens ? { [lens]: level } : {}, xp: opts.xp, streak: opts.streak, onboarded: opts.onboarded },
    status,
    queueOrder: [],
    day: 0,
    lastLessonDay: -1,
    lastGoalMetDay: -1,
    lessonsCompleted: 0,
    queuedByDay: {},
    decodesByDay: {},
    followsByDay: {},
    questXp: {},
    reads: {},
    dives: {},
    lessons: {},
    following: new Set(lens ? AUTHORS.filter((a) => a.archetype === lens).map((a) => a.id).slice(0, 1) : []),
    userPosts: [],
  };
}

// The demo opens on onboarding, as a brand-new user
function freshState(): State {
  return makeState("beginner", null, { streak: 0, xp: 0, onboarded: false });
}

// Ready-made personas for the demo switcher
export const PERSONAS: Record<Level, { lens: Lens; streak: number; xp: number }> = {
  beginner: { lens: "operator", streak: 2, xp: 60 },
  amateur: { lens: "builder", streak: 6, xp: 520 },
  pro: { lens: "investor", streak: 23, xp: 1850 },
};

let S = freshState();

const termById = (id: string) => TERMS.find((t) => t.id === id);
const isKnown = (id: string) => S.status[id] === "learning" || S.status[id] === "known";

function feedFluency(): number {
  const ids = new Set<string>();
  POSTS.forEach((p) => p.terms.forEach((t) => ids.add(t.id)));
  const total = ids.size || 1;
  const known = [...ids].filter(isKnown).length;
  return Math.round((known / total) * 100);
}

const HOME: Record<Level, HomeTab> = { beginner: "today", amateur: "today", pro: "today" };

function dailyGoal(): DailyGoal {
  const lessonDone = S.lastLessonDay === S.day;
  const reads = (S.reads[S.day] || []).length;
  const dives = (S.dives[S.day] || []).length;
  if (S.user.level === "beginner") return { label: "1 lesson", progress: lessonDone ? 1 : 0, target: 1, met: lessonDone };
  if (S.user.level === "amateur") {
    const progress = lessonDone ? 3 : Math.min(reads, 3);
    return { label: "1 lesson or 3 posts", progress, target: 3, met: progress >= 3 };
  }
  const progress = Math.min(reads, 5) + Math.min(dives, 1);
  return { label: "5 posts + 1 deep dive", progress, target: 6, met: progress >= 6 };
}

function quests(): Quest[] {
  const g = dailyGoal();
  const lessonDone = S.lastLessonDay === S.day;
  const reads = (S.reads[S.day] || []).length;
  const queued = S.queuedByDay[S.day] || 0;
  const decodes = S.decodesByDay[S.day] || 0;
  const level = S.user.level;
  const streakTitle = level === "beginner" ? "Finish today's lesson" : level === "amateur" ? "Lesson or 3 posts" : "5 posts + 1 deep dive";
  const streak: Quest = {
    id: "q_streak", kind: "streak", title: streakTitle, progress: g.progress, target: g.target, xp: 15, done: g.met,
    action: level === "beginner" ? "lesson" : level === "pro" ? "pulse" : lessonDone ? "pulse" : "lesson",
  };
  const mk = (id: string, title: string, progress: number, target: number, xp: number, action: Quest["action"]): Quest =>
    ({ id, kind: "bonus", title, progress: Math.min(progress, target), target, xp, done: progress >= target, action });
  const bonus: Quest[] =
    level === "beginner"
      ? [mk("q_read2", "Read 2 starter posts", reads, 2, 10, "pulse"), mk("q_tap", "Save a new word from a post", queued, 1, 5, "pulse")]
      : level === "amateur"
      ? [mk("q_tap", "Save a word for tomorrow", queued, 1, 10, "pulse"), mk("q_decode", "Decode a post from elsewhere", decodes, 1, 15, "decode")]
      : [mk("q_drill", "Do the catch-up drill", lessonDone ? 1 : 0, 1, 10, "lesson"), mk("q_decode", "Decode a post from elsewhere", decodes, 1, 15, "decode")];
  return [streak, ...bonus];
}

// Bonus quest XP is paid once, the first time each quest completes
function payQuests() {
  for (const q of quests()) {
    const key = `${S.day}:${q.id}`;
    if (q.kind === "bonus" && q.done && !S.questXp[key]) { S.questXp[key] = true; S.user.xp += q.xp; }
  }
}

// Streak goes up the first time the daily goal is met each day
function checkGoal() {
  payQuests();
  if (dailyGoal().met && S.lastGoalMetDay !== S.day) {
    S.user.streak += 1;
    S.lastGoalMetDay = S.day;
    S.user.xp += 15;
  }
}

const clampPct = (n: number) => Math.max(3, Math.min(99, Math.round(n)));
// Simulated ranking against the learner base (backend computes this from real users)
function percentiles() {
  const words = Object.values(S.status).filter((s) => s === "learning" || s === "known").length;
  return {
    streak: clampPct(18 + S.user.streak * 7),
    words: clampPct((words / TERMS.length) * 92 + 4),
    xp: clampPct(10 + Math.sqrt(S.user.xp) * 2.1),
  };
}

function userOut(): User {
  return {
    ...S.user,
    homeTab: HOME[S.user.level],
    dailyGoal: dailyGoal(),
    lessonDoneToday: S.lastLessonDay === S.day,
    lessonsCompleted: S.lessonsCompleted,
    quests: quests(),
    percentiles: percentiles(),
    wordsKnown: Object.values(S.status).filter((s) => s === "learning" || s === "known").length,
    feedFluency: feedFluency(),
    queuedTermsCount: Object.values(S.status).filter((s) => s === "queued").length,
  };
}

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}
function shuffle<T>(arr: T[], seed: number): T[] {
  const r = seeded(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function postOut(p: SeedPost): Post {
  const { counter, ...rest } = p;
  const out = clone(rest) as Post;
  out.debate = counter;
  out.whyItMattersByLens = WHY_BY_LENS[p.id];
  out.terms = out.terms.map((t) => ({ ...t, status: S.status[t.id] || "new" }));
  return out;
}

function lensOrder(): string[] {
  return LENS_PATH[S.user.lens || "operator"];
}

// Chapters in the lens's order, each a list of days
function courseDays() {
  return lensOrder().flatMap((chapter) =>
    (CURRICULUM[chapter] || []).map((d, i) => ({ chapter, n: i + 1, title: d.title, termIds: d.termIds, id: `${chapter}-${i + 1}` })),
  );
}
const dayDone = (d: { termIds: string[] }) => d.termIds.every(isKnown);

function pathOut(): PathUnit[] {
  const all = courseDays();
  const pending = all.filter((d) => !dayDone(d));
  const base = S.lastLessonDay === S.day ? 1 : 0; // today's lesson done → next day unlocks tomorrow
  let currentAssigned = false;
  return lensOrder().map((chapter) => {
    const meta = PATH.find((u) => u.title === chapter)!;
    const days: PathDay[] = all.filter((d) => d.chapter === chapter).map((d) => {
      const idx = pending.indexOf(d);
      return {
        id: d.id, n: d.n, title: d.title,
        terms: d.termIds.map((id) => ({ id, term: termById(id)!.term, status: S.status[id] })),
        status: idx === -1 ? "done" : idx === 0 && base === 0 ? "today" : "upcoming",
        inDays: idx === -1 ? -1 : idx + base,
      };
    });
    const ts = days.flatMap((d) => d.terms);
    const progress = ts.length ? ts.filter((t) => isKnown(t.id)).length / ts.length : 0;
    let status: PathUnit["status"] = "locked";
    if (days.every((d) => d.status === "done")) status = "done";
    else if (!currentAssigned) { status = "current"; currentAssigned = true; }
    return { ...meta, status, progress, days };
  });
}

function buildLesson(day: number): Lesson & { termIds: string[] } {
  const level = S.user.level;
  const queued = S.queueOrder.filter((id) => S.status[id] === "queued").slice(0, 3);
  const pathOrder = lensOrder();
  const isPro = level === "pro";
  const freshThisWeek = FRESH_TERMS.filter((id) => S.status[id] === "new");
  // Course lessons follow the curriculum: today's day, topped up from the next day if it's short
  const pendingDays = courseDays().filter((d) => !dayDone(d));
  const termIds = [...queued];
  if (isPro) {
    for (const id of freshThisWeek) { if (termIds.length >= 3) break; if (!termIds.includes(id)) termIds.push(id); }
  }
  for (const d of pendingDays) {
    if (termIds.length >= 3 || (termIds.length >= 2 && !isPro)) break;
    for (const id of d.termIds) if (!isKnown(id) && !termIds.includes(id) && termIds.length < 3) termIds.push(id);
  }
  const terms = termIds.map((id) => termById(id)!).filter(Boolean);
  const cards: Card[] = [];
  const seed = day * 31 + termIds.join("").length;

  terms.forEach((t, i) =>
    cards.push({
      id: `c_concept_${i}`, type: "concept", termId: t.id, term: t.term,
      explanation: t.definitions[level], analogy: t.analogy, fromFeed: queued.includes(t.id),
    }),
  );

  // MCQ on the first term
  if (terms[0]) {
    const t = terms[0];
    const distractors = shuffle(TERMS.filter((x) => x.id !== t.id), seed).slice(0, 3).map((x) => SHORT[x.id]);
    const opts = shuffle([SHORT[t.id], ...distractors], seed + 1);
    cards.push({
      id: "c_mcq", type: "mcq", question: `Which best describes "${t.term}"?`, options: opts,
      answerIndex: opts.indexOf(SHORT[t.id]), explanation: `${t.term}: ${t.definitions.beginner}`,
    });
  }

  // Match: lesson terms + known terms to make 4 pairs
  const pool = [...terms, ...shuffle(TERMS.filter((x) => isKnown(x.id) && !termIds.includes(x.id)), seed + 2)].slice(0, 4);
  cards.push({ id: "c_match", type: "match", pairs: pool.map((t) => ({ left: t.term, right: SHORT[t.id] })) });

  // Real post comprehension: a post that contains one of the lesson terms
  const post = POSTS.find((p) => p.terms.some((pt) => termIds.includes(pt.id))) || POSTS[0];
  const target = post.terms.find((pt) => termIds.includes(pt.id)) || post.terms[0];
  const others = shuffle(TERMS.filter((x) => x.id !== target.id), seed + 3).slice(0, 3).map((x) => x.term);
  const rpOpts = shuffle([target.term, ...others], seed + 4);
  cards.push({
    id: "c_real", type: "real_post", author: post.author.name,
    postSnippet: post.text.length > 220 ? post.text.slice(0, 217) + "…" : post.text,
    question: `In this post, which word means "${lc(SHORT[target.id])}"?`,
    options: rpOpts, answerIndex: rpOpts.indexOf(target.term),
    explanation: `"${target.term}" = ${lc(SHORT[target.id])}. You'll see it in real posts like this one.`,
  });

  // Fill in the blank on the last term
  const fb = terms[terms.length - 1] || termById("t_rag")!;
  const fbOpts = shuffle([fb.term, ...shuffle(TERMS.filter((x) => x.id !== fb.id), seed + 5).slice(0, 2).map((x) => x.term)], seed + 6);
  cards.push({
    id: "c_fill", type: "fill_blank", sentence: `${fb.analogy.replace(/\.$/, "")}. That's how you can think about ___.`,
    options: fbOpts, answerIndex: fbOpts.indexOf(fb.term), explanation: `${fb.term}: ${fb.definitions.beginner}`,
  });

  const unit = isPro ? "New this week" : pendingDays[0]?.title || "Review";
  return {
    id: `l_day${day}`, date: new Date(Date.now() + day * 86400_000).toISOString().slice(0, 10),
    unitTitle: unit, cards, completed: false, termIds,
  };
}

function lessonOut(l: Lesson & { termIds: string[] }): Lesson {
  const { termIds, ...rest } = l;
  return clone(rest);
}

function findTermsInText(text: string): { id: string; term: string }[] {
  const found: { id: string; term: string; idx: number }[] = [];
  for (const t of TERMS) {
    for (const cand of [t.term, ...t.aliases].sort((a, b) => b.length - a.length)) {
      const re = new RegExp(`\\b${cand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      const m = text.match(re);
      if (m && m.index !== undefined) {
        found.push({ id: t.id, term: m[0], idx: m.index });
        break;
      }
    }
  }
  // drop matches contained inside a longer match (e.g. "Inference" inside "Inference costs")
  const kept = found.filter((f) => !found.some((g) => g !== f && g.term.length > f.term.length && f.idx >= g.idx && f.idx + f.term.length <= g.idx + g.term.length));
  return kept.sort((a, b) => a.idx - b.idx).map(({ id, term }) => ({ id, term }));
}

function decodeFromText(text: string, url: string | null): SeedPost {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const first = sentences[0].trim();
  const terms = findTermsInText(clean).slice(0, 5);
  const glosses = terms.slice(0, 2).map((t) => {
    const def = termById(t.id)!;
    return `"${t.term}" means ${def.definitions.beginner.charAt(0).toLowerCase() + def.definitions.beginner.slice(1)}`;
  });
  const cats = [...new Set(terms.map((t) => termById(t.id)!.category))];
  return {
    id: "", publishedAt: "", source: "user", url,
    author: { id: "a_you", name: "Shared by you", handle: url ? new URL(url).hostname.replace("www.", "") : "pasted text", archetype: "operator", avatarUrl: null },
    text: clean,
    tldr: {
      beginner: `The main point: ${first} ${glosses.length ? "In plain English: " + glosses.join("; ") : ""}`.trim(),
      amateur: sentences.slice(0, 2).join(" ").trim(),
      pro: sentences.slice(0, 3).join(" ").trim(),
    },
    whyItMatters: cats.length
      ? `It touches ${cats.join(" and ")}, topics showing up across AI conversations this week.`
      : "Not obviously AI-related, but here's the gist in plain English.",
    terms,
    topic: terms[0]?.term || null,
    counter: "Worth checking who's making this claim and what evidence they share. Strong takes on social media often skip the caveats.",
  };
}

const allPosts = () => [...S.userPosts, ...POSTS];

export const mock = {
  async getMe() { await sleep(250); return userOut(); },
  async updateMe(b: Partial<Pick<User, "level" | "name" | "lens">>) {
    await sleep(250);
    const levels = { ...(S.user.levels || {}) };
    const lens = b.lens ?? S.user.lens;
    const level = b.level ?? (lens && levels[lens]) ?? S.user.level;
    if (lens) levels[lens] = level;
    Object.assign(S.user, b, { level, levels });
    delete S.lessons[S.day];
    return userOut();
  },
  async getPath() {
    await sleep(250);
    return { units: pathOut() };
  },

  async getPlacementQs() { await sleep(300); return { questions: PLACEMENT.map(({ answer, ...q }) => q) }; },
  async submitPlacement(goal: Goal, answers: number[]) {
    await sleep(500);
    const score = PLACEMENT.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
    const level: Level = score >= 5 ? "pro" : score >= 3 ? "amateur" : "beginner";
    Object.assign(S.user, { goal, level, onboarded: true });
    delete S.lessons[S.day];
    return { level, score, user: userOut() };
  },

  async onboard(level: Level, lens: Lens, name: string) {
    await sleep(500);
    // New users start at the XP floor of the level they chose
    S = makeState(level, lens, { streak: 0, xp: { beginner: 0, amateur: 300, pro: 1000 }[level], onboarded: true });
    const chosen = name.trim().slice(0, 24);
    if (chosen) S.user.name = chosen;
    return { user: userOut() };
  },
  async markRead(postId: string) {
    await sleep(80);
    const r = (S.reads[S.day] ||= []);
    if (!r.includes(postId)) { r.push(postId); S.user.xp += 2; checkGoal(); }
    return { user: userOut() };
  },
  async devSetPersona(level: Level) {
    await sleep(250);
    const p = PERSONAS[level];
    const name = S.user.name;
    S = makeState(level, p.lens, { streak: p.streak, xp: p.xp, onboarded: true });
    S.user.name = name;
    return { user: userOut() };
  },

  async getTodayLesson() {
    await sleep(350);
    if (!S.lessons[S.day]) S.lessons[S.day] = buildLesson(S.day);
    return lessonOut(S.lessons[S.day]);
  },
  async answerCard(_lessonId: string, _cardId: string, correct: boolean) {
    await sleep(120);
    const xpAwarded = correct ? 10 : 0;
    S.user.xp += xpAwarded;
    return { xpAwarded, user: userOut() };
  },
  async completeLesson(lessonId: string): Promise<CompleteResult> {
    await sleep(500);
    const l = Object.values(S.lessons).find((x) => x.id === lessonId) || S.lessons[S.day];
    const before = feedFluency();
    l.termIds.forEach((id) => (S.status[id] = "learning"));
    l.completed = true;
    S.user.xp += 20;
    S.lessonsCompleted += 1;
    S.lastLessonDay = S.day;
    checkGoal();
    return {
      xpAwarded: 20, streak: S.user.streak, wordsLearned: l.termIds.map((id) => termById(id)!.term),
      feedFluencyBefore: before, feedFluencyAfter: feedFluency(), user: userOut(),
    };
  },

  async getFeed(f?: { archetype?: Archetype; source?: Source }) {
    await sleep(350);
    let posts = allPosts();
    if (f?.source === "user") posts = S.userPosts;
    else if (f?.archetype) posts = posts.filter((p) => p.author.archetype === f.archetype);
    else if (S.user.lens) {
      // "For you": the user's lens floats to the top, newest first within each group
      const lens = S.user.lens;
      posts = [...posts.filter((p) => p.author.archetype === lens), ...posts.filter((p) => p.author.archetype !== lens)];
    }
    return { posts: posts.map(postOut) };
  },
  // Every word this user has learned, for the profile word bank
  async getMyWords(): Promise<{ terms: Term[] }> {
    await sleep(250);
    const terms = TERMS.filter((t) => isKnown(t.id)).map((t) => ({
      id: t.id, term: t.term, category: t.category, definitions: t.definitions, analogy: t.analogy, status: S.status[t.id],
    }));
    return { terms };
  },
  async getTerm(id: string): Promise<Term> {
    await sleep(200);
    const t = termById(id) as SeedTerm;
    if (!t) throw new Error("Term not found");
    return { id: t.id, term: t.term, category: t.category, definitions: t.definitions, analogy: t.analogy, status: S.status[id] };
  },
  async queueTerm(id: string) {
    await sleep(200);
    if (!isKnown(id) && S.status[id] !== "queued") {
      S.status[id] = "queued";
      S.queueOrder.push(id);
      S.user.xp += 5;
      S.queuedByDay[S.day] = (S.queuedByDay[S.day] || 0) + 1;
      checkGoal();
      const next = S.lessons[S.day];
      if (next && !next.completed) delete S.lessons[S.day]; // rebuild so it includes the new word
    }
    return { queued: true, queuedTermsCount: userOut().queuedTermsCount };
  },

  async decode(b: { url?: string; text?: string }): Promise<DecodeResult> {
    await sleep(3800);
    const url = b.url?.trim() || null;
    let p: SeedPost;
    if (b.text && b.text.trim().length > 0) {
      p = decodeFromText(b.text, url);
    } else if (url) {
      if (/linkedin\.com/i.test(url)) {
        return { ok: false, needsText: true, url, reason: "LinkedIn requires login for this post." };
      }
      const key = /(x|twitter)\.com/i.test(url) ? "x" : "substack";
      p = { ...(clone(DEMO_DECODES[key]) as SeedPost), url, source: "user" };
    } else {
      throw new Error("Nothing to decode");
    }
    p.id = `p_user_${Date.now()}`;
    p.publishedAt = new Date().toISOString();
    S.userPosts.unshift(p);
    S.decodesByDay[S.day] = (S.decodesByDay[S.day] || 0) + 1;
    checkGoal();
    return { ok: true, post: postOut(p), method: b.text ? "text" : "demo" };
  },

  async chat(postId: string, messages: ChatMessage[]) {
    await sleep(1300);
    const p = allPosts().find((x) => x.id === postId) || POSTS[0];
    const level = S.user.level;
    const q = (messages.filter((m) => m.role === "user").pop()?.content || "").toLowerCase();
    const author = AUTHORS.find((x) => x.id === p.author.id);
    const dv = (S.dives[S.day] ||= []);
    if (!dv.includes(postId)) { dv.push(postId); checkGoal(); }
    const why = WHY_BY_LENS[p.id];
    const askedTerm = TERMS.find((t) => [t.term, ...t.aliases].some((n) => q.includes(n.toLowerCase())));
    let reply: string;
    if (/market|implication|invest/.test(q)) {
      reply = `**For investors:** ${why?.investor ?? p.whyItMatters}\n\n**Where value could accrue:** look at who captures the savings or the new demand, and who gets squeezed.\n\nQuick check: which company would you expect to benefit most from this?`;
    } else if (/build this|how would i build|ship/.test(q)) {
      reply = `**For builders:** ${why?.builder ?? p.whyItMatters}\n\nA weekend version:\n• Pick one narrow workflow\n• Wire it to a model API with your own data\n• Write 20 test cases (evals) before you polish the UI\n\nQuick check: what's the smallest version you could ship this week?`;
    } else if (/my team|use this|at work|rollout/.test(q)) {
      reply = `**For operators:** ${why?.operator ?? p.whyItMatters}\n\nTry it as a 2-week pilot with one team, one workflow, and a clear before/after metric.\n\nQuick check: which process on your team is most repetitive today?`;
    } else if (/evidence|proof|research|paper|data/.test(q)) {
      reply = `**For researchers:** ${why?.researcher ?? p.whyItMatters}\n\nWhat I'd want to see: the benchmark or dataset behind the claim, a baseline comparison, and whether results held outside the author's own setup.\n\nQuick check: what experiment would change your mind?`;
    } else if (/who is|who's this|this person|author/.test(q)) {
      reply = author
        ? `**${author.name}** (${author.handle}) is ${author.archetype === "investor" ? "an" : "a"} ${author.archetype}. ${author.bio}\n\n**Why people follow them:** ${author.whyFollow}\n\nQuick check: based on that, would you read their posts for *technical detail* or *big-picture takes*?`
        : `This was shared from **${p.author.handle}**. When you don't know a source, ask: are they building, researching, investing or operating? It changes how much to trust a claim.\n\nQuick check: what would you want to know about the author before sharing this?`;
    } else if (/counter|disagree|other side|critic/.test(q)) {
      reply = `**The other side:** ${p.counter}\n\nGood habit: for every strong AI take, ask "what would have to be true for this to be wrong?"\n\nQuick check: which side do you find more convincing, and why?`;
    } else if (/meeting|say this|bring (it|this) up|colleague|boss/.test(q)) {
      reply = `Try something like:\n\n> "I saw that ${p.tldr.amateur.charAt(0).toLowerCase() + p.tldr.amateur.slice(1)} Could that matter for us?"\n\nThen follow up with: **"What would it take for us to test that?"** It shows you understand the idea *and* turns it into action.\n\nQuick check: which team at your company would care most about this?`;
    } else if (askedTerm) {
      reply = `**${askedTerm.term}**: ${askedTerm.definitions[level]}\n\n💡 *Think of it like:* ${askedTerm.analogy}\n\nIn this post, it matters because: ${p.whyItMatters}\n\nQuick check: can you explain ${askedTerm.term} in one sentence to a friend?`;
    } else if (/new|simple|eli5|explain|plain|beginner/.test(q)) {
      const t = p.terms.slice(0, 2).map((r) => termById(r.id)).filter(Boolean) as SeedTerm[];
      reply = `Here's the simple version:\n\n${p.tldr.beginner}\n\n${t.map((x) => `• **${x.term}**: ${x.analogy}`).join("\n")}\n\nQuick check: in your own words, what's the one thing that changed?`;
    } else {
      reply = `Good question. Here's how I'd think about it at your level:\n\n${p.tldr[level]}\n\n**Why it matters:** ${p.whyItMatters}\n\nQuick check: what part of this would you want to dig into next?`;
    }
    const termSugs = p.terms.filter((t) => !q.includes(t.term.toLowerCase())).slice(0, 2).map((t) => `What does "${t.term}" mean?`);
    const suggestions = [...termSugs.slice(0, level === "pro" ? 1 : 2), /counter/.test(q) ? "How would I mention this in a meeting?" : "What's the counter-argument?"].slice(0, 3);
    return { reply, suggestions };
  },

  async getAuthors() {
    await sleep(300);
    return { authors: AUTHORS.map((x) => ({ ...x, following: S.following.has(x.id) })) };
  },
  async follow(id: string, follow: boolean) {
    await sleep(150);
    follow ? S.following.add(id) : S.following.delete(id);
    return { following: follow };
  },

  async devNextDay() { await sleep(250); S.day += 1; return { user: userOut() }; },
  async devReset() { await sleep(250); S = freshState(); return { user: userOut() }; },
};

export function findPostSync(id: string): Post | undefined {
  const p = allPosts().find((x) => x.id === id);
  return p ? postOut(p) : undefined;
}
