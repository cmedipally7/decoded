// Stateful in-memory mock backend. Implements the same behavior the real backend will:
// queued feed terms show up in the next lesson, XP/streak/fluency update, decode, chat, etc.
import { AUTHORS, DEMO_DECODES, INITIAL_KNOWN, PATH, PLACEMENT, POSTS, TERMS, type SeedPost, type SeedTerm } from "./mockData";
import type {
  Archetype, Card, ChatMessage, CompleteResult, DecodeResult, Goal, Lesson, Level, Post, Source, Term, User,
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
  user: { id: string; name: string; goal: Goal | null; level: Level; xp: number; streak: number; onboarded: boolean };
  status: Record<string, Status>;
  queueOrder: string[];
  day: number;
  lastLessonDay: number;
  lessons: Record<number, Lesson & { termIds: string[] }>;
  following: Set<string>;
  userPosts: SeedPost[];
}

function freshState(): State {
  const status: Record<string, Status> = {};
  TERMS.forEach((t) => (status[t.id] = INITIAL_KNOWN.includes(t.id) ? "learning" : "new"));
  return {
    user: { id: "demo", name: "Chai", goal: "work", level: "beginner", xp: 240, streak: 6, onboarded: true },
    status,
    queueOrder: [],
    day: 0,
    lastLessonDay: -1,
    lessons: {},
    following: new Set(["a_leo", "a_rachel"]),
    userPosts: [],
  };
}

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

function userOut(): User {
  return {
    ...S.user,
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
  return clone(rest);
}

function buildLesson(day: number): Lesson & { termIds: string[] } {
  const level = S.user.level;
  const queued = S.queueOrder.filter((id) => S.status[id] === "queued").slice(0, 3);
  const pathOrder = ["Foundations", "Models", "Building", "Business of AI", "Frontier"];
  const fresh = TERMS.filter((t) => S.status[t.id] === "new")
    .sort((a, b) => pathOrder.indexOf(a.category) - pathOrder.indexOf(b.category))
    .map((t) => t.id);
  const termIds = [...queued];
  for (const id of fresh) {
    if (termIds.length >= 3) break;
    if (!termIds.includes(id)) termIds.push(id);
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

  const unit = queued.length ? "From your feed ✨" : terms[0]?.category || "Building";
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
  async updateMe(b: Partial<Pick<User, "level" | "name">>) {
    await sleep(250);
    Object.assign(S.user, b);
    delete S.lessons[S.day];
    return userOut();
  },
  async getPath() {
    await sleep(250);
    let currentAssigned = false;
    const units = PATH.map((u) => {
      const ts = TERMS.filter((t) => t.category === u.title);
      const progress = ts.length ? ts.filter((t) => isKnown(t.id)).length / ts.length : 0;
      let status: "done" | "current" | "locked" = "locked";
      if (progress >= 1) status = "done";
      else if (!currentAssigned) { status = "current"; currentAssigned = true; }
      return { ...u, status, progress };
    });
    return { units };
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
    if (S.lastLessonDay !== S.day) { S.user.streak += 1; S.lastLessonDay = S.day; }
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
    return { posts: posts.map(postOut) };
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
    return { ok: true, post: postOut(p), method: b.text ? "text" : "demo" };
  },

  async chat(postId: string, messages: ChatMessage[]) {
    await sleep(1300);
    const p = allPosts().find((x) => x.id === postId) || POSTS[0];
    const level = S.user.level;
    const q = (messages.filter((m) => m.role === "user").pop()?.content || "").toLowerCase();
    const author = AUTHORS.find((x) => x.id === p.author.id);
    const askedTerm = TERMS.find((t) => [t.term, ...t.aliases].some((n) => q.includes(n.toLowerCase())));
    let reply: string;
    if (/who is|who's this|this person|author/.test(q)) {
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
    const suggestions = [...termSugs, /counter/.test(q) ? "How would I mention this in a meeting?" : "What's the counter-argument?"].slice(0, 3);
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
