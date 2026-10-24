import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PATH, PLACEMENT, TERMS } from "./glossary.js";
import { PEOPLE } from "./people.js";
import { KNOWN_BY_LEVEL, LENSES, LEVELS, PERSONAS } from "./course.js";
import { pathFor, presentPost, settleProgress, userExtras } from "./progress.js";
import { SEED_POSTS } from "./seedPosts.js";
import { embed, termDocument } from "./embed.js";
import { linkTerms } from "./link.js";
import { plainText } from "./feeds.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STARTER_FOLLOWS = PEOPLE.map((person) => person.id);

export function openDb(file = process.env.DB_PATH || path.join(ROOT, "data", "db.json")) {
  const db = load(file);
  return {
    file,
    raw: db,
    save() {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(db));
    },
    ensureUser(id) {
      if (!db.users[id]) {
        db.users[id] = freshUser(id);
        db.userTerms[id] = freshTerms();
        db.follows[id] = id === "demo" ? [...STARTER_FOLLOWS] : [];
        db.userPosts[id] = [];
        this.save();
      }
      hydrate(db.users[id]);
      return db.users[id];
    },
    resetUser(id) {
      db.users[id] = freshUser(id);
      db.userTerms[id] = freshTerms();
      db.follows[id] = id === "demo" ? [...STARTER_FOLLOWS] : [];
      db.userPosts[id] = [];
      for (const key of Object.keys(db.lessons)) {
        if (key.startsWith(`${id}:`)) delete db.lessons[key];
      }
      this.save();
    },
    // Switching lens/level keeps words already learned; it only adds the ones that level assumes.
    addLevelWords(userId, level) {
      for (const id of KNOWN_BY_LEVEL[level] || []) {
        if (db.userTerms[userId][id]?.status === "new") db.userTerms[userId][id] = { status: "learning", source: "lesson" };
      }
    },
    applyLevel(userId, level) {
      const known = new Set(KNOWN_BY_LEVEL[level] || []);
      db.userTerms[userId] = Object.fromEntries(TERMS.map((term) => [term.id, {
        status: known.has(term.id) ? "learning" : "new",
        source: "lesson",
      }]));
    },
    onboard(userId, level, lens, name) {
      const chosen = String(name || "").trim().slice(0, 24);
      if (!LEVELS.has(level) || !LENSES.has(lens) || !chosen) return null;
      const user = this.ensureUser(userId);
      Object.assign(user, {
        name: chosen,
        level,
        lens,
        levels: { [lens]: level },
        onboarded: true,
        xp: { beginner: 0, amateur: 300, pro: 1000 }[level],
        streak: 0,
        lessonsCompleted: 0,
        lastLessonDate: null,
        lastGoalMetDate: null,
        reads: {},
        dives: {},
        queuedByDay: {},
        decodesByDay: {},
        questXp: {},
      });
      this.applyLevel(userId, level);
      if (!(db.follows[userId] || []).length) {
        const match = PEOPLE.find((person) => person.archetype === lens && !person.later);
        db.follows[userId] = match ? [match.id] : [];
      }
      delete db.lessons[`${userId}:${user.today}`];
      this.save();
      return this.userOut(userId);
    },
    setPersona(userId, level) {
      if (!LEVELS.has(level)) return null;
      const persona = PERSONAS[level];
      const user = this.ensureUser(userId);
      Object.assign(user, {
        level,
        lens: persona.lens,
        levels: { [persona.lens]: level },
        onboarded: true,
        xp: persona.xp,
        streak: persona.streak,
        lessonsCompleted: 0,
        lastLessonDate: null,
        lastGoalMetDate: null,
        reads: {},
        dives: {},
        queuedByDay: {},
        decodesByDay: {},
        questXp: {},
      });
      this.applyLevel(userId, level);
      delete db.lessons[`${userId}:${user.today}`];
      this.save();
      return this.userOut(userId);
    },
    markRead(userId, postId) {
      const user = this.ensureUser(userId);
      const reads = user.reads[user.today] || [];
      if (!reads.includes(postId)) {
        user.reads[user.today] = [...reads, postId];
        user.xp += 2;
        settleProgress(user);
        this.save();
      }
      return this.userOut(userId);
    },
    noteDecode(userId) {
      const user = db.users[userId];
      user.decodesByDay[user.today] = (user.decodesByDay[user.today] || 0) + 1;
      settleProgress(user);
    },
    noteDive(userId, postId) {
      const user = db.users[userId];
      const dives = user.dives[user.today] || [];
      if (!dives.includes(postId)) {
        user.dives[user.today] = [...dives, postId];
        settleProgress(user);
      }
    },
    noteQueue(userId) {
      const user = db.users[userId];
      user.queuedByDay[user.today] = (user.queuedByDay[user.today] || 0) + 1;
      settleProgress(user);
    },
    term(id) {
      return db.terms.find((term) => term.id === id);
    },
    status(userId, termId) {
      return db.userTerms[userId]?.[termId]?.status || "new";
    },
    setStatus(userId, termId, status, source) {
      db.userTerms[userId][termId] = { status, source };
    },
    known(userId, termId) {
      const status = this.status(userId, termId);
      return status === "learning" || status === "known";
    },
    userOut(userId) {
      const user = db.users[userId];
      const statuses = Object.values(db.userTerms[userId] || {});
      const feedIds = new Set(db.posts.flatMap((post) => post.terms.map((term) => term.id)));
      const total = feedIds.size || 1;
      const known = [...feedIds].filter((id) => this.known(userId, id)).length;
      return {
        id: user.id,
        name: user.name,
        goal: user.goal,
        level: user.level,
        levels: user.levels,
        xp: user.xp,
        streak: user.streak,
        wordsKnown: statuses.filter((item) => item.status === "learning" || item.status === "known").length,
        feedFluency: Math.round((known / total) * 100),
        queuedTermsCount: statuses.filter((item) => item.status === "queued").length,
        onboarded: user.onboarded,
        ...userExtras(user, statuses.filter((item) => item.status === "learning" || item.status === "known").length),
      };
    },
    pathFor(userId) {
      this.ensureUser(userId);
      return pathFor(db, userId, (id) => this.status(userId, id));
    },
    wordsFor(userId) {
      this.ensureUser(userId);
      return db.terms
        .filter((term) => this.known(userId, term.id))
        .map((term) => ({
          id: term.id,
          term: term.term,
          category: term.category,
          definitions: term.definitions,
          analogy: term.analogy,
          status: this.status(userId, term.id),
        }));
    },
    postsFor(userId, filter = {}) {
      let posts = [...(db.userPosts[userId] || []), ...db.posts];
      if (filter.source === "user") posts = db.userPosts[userId] || [];
      else if (filter.archetype) posts = posts.filter((post) => post.author.archetype === filter.archetype);
      else if (filter.source) posts = posts.filter((post) => post.source === filter.source);
      const lens = db.users[userId]?.lens;
      posts.sort((a, b) => {
        const fresh = (b.fresh === true) - (a.fresh === true);
        if (fresh || a.fresh || b.fresh) return fresh || String(b.publishedAt).localeCompare(String(a.publishedAt));
        if (!filter.archetype && !filter.source && lens) {
          const group = (b.author?.archetype === lens) - (a.author?.archetype === lens);
          if (group) return group;
        }
        return String(b.publishedAt).localeCompare(String(a.publishedAt));
      });
      return posts.map((post) => presentPost(post, (id) => this.status(userId, id)));
    },
    ingestNews(items) {
      const added = ingestItems(db, items);
      this.save();
      return added;
    },
    syncNews(items) {
      const urls = new Set(items.map((item) => item.url).filter(Boolean));
      const posts = db.posts.filter((post) => String(post.id || "").startsWith("p_seed_") || urls.has(post.url));
      const removed = db.posts.length - posts.length;
      db.posts = posts;
      const ids = new Set(posts.map((post) => post.id));
      if (db.vectors?.posts) {
        for (const id of Object.keys(db.vectors.posts)) {
          if (!ids.has(id)) delete db.vectors.posts[id];
        }
      }
      const added = ingestItems(db, items);
      this.save();
      return { added, removed };
    },
  };
}

function load(file) {
  const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : blank();
  const changed = alignToSeed(db) || scrubPosts(db);
  if (!fs.existsSync(file) || changed) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db));
  }
  return db;
}

function alignToSeed(db) {
  const newsPath = path.join(ROOT, "seed", "news.json");
  if (!fs.existsSync(newsPath)) return false;
  const items = JSON.parse(fs.readFileSync(newsPath, "utf8")).items || [];
  const urls = new Set(items.map((item) => item.url).filter(Boolean));
  const posts = (db.posts || []).filter((post) => String(post.id || "").startsWith("p_seed_") || urls.has(post.url));
  let changed = posts.length !== (db.posts || []).length;
  db.posts = posts;
  const ids = new Set(posts.map((post) => post.id));
  if (db.vectors?.posts) {
    for (const id of Object.keys(db.vectors.posts)) {
      if (!ids.has(id)) delete db.vectors.posts[id];
    }
  }
  const peopleIds = new Set(PEOPLE.map((person) => person.id));
  db.authors = (db.authors || []).filter((author) => peopleIds.has(author.id));
  db.vectors = db.vectors || { terms: {}, posts: {} };
  if (db.follows?.demo && !db.follows.demo.includes(STARTER_FOLLOWS[0])) {
    db.follows.demo = [...STARTER_FOLLOWS];
    changed = true;
  }
  for (const person of PEOPLE) {
    const existing = (db.authors || []).find((author) => author.id === person.id);
    const record = authorRecord(person);
    if (!existing) db.authors.push(record);
    else Object.assign(existing, record);
    changed = true;
  }
  return ingestItems(db, items) > 0 || changed;
}

function blank() {
  const terms = TERMS.map((term) => ({ ...term }));
  const vectors = { terms: Object.fromEntries(terms.map((term) => [term.id, embed(termDocument(term))])), posts: {} };
  const db = {
    users: {},
    userTerms: {},
    follows: {},
    userPosts: {},
    lessons: {},
    terms,
    authors: PEOPLE.map(authorRecord),
    posts: [],
    vectors,
    path: PATH,
    placement: PLACEMENT,
  };
  for (const post of SEED_POSTS) {
    const linked = linkTerms(post.text, terms, vectors.terms);
    const stored = { ...post, terms: linked.length ? linked : post.terms };
    db.posts.push(stored);
    vectors.posts[stored.id] = embed(post.text);
  }
  return db;
}

const AI_TEXT = /\b(A\.?I\.?|artificial intelligence|machine learning|neural|LLMs?|ChatGPT|OpenAI|Anthropic|Claude|DeepSeek|Gemini|generative|hallucinations?|multimodal|fine-?tuning|embeddings?|RAG|retrieval-augmented|GPUs?|AGI|agentic|inference|open-?weights|context windows?|vibe coding|data cent(?:er|re)s?)\b/i;

export function aboutAi(text) {
  return AI_TEXT.test(String(text || ""));
}

function scrubPosts(db) {
  let changed = false;
  for (const post of db.posts || []) {
    const cleaned = plainText(post.text);
    if (!cleaned || cleaned === post.text) continue;
    post.text = cleaned;
    post.tldr = levels(cleaned);
    const terms = linkTerms(cleaned, db.terms, db.vectors.terms);
    if (terms.length) post.terms = terms;
    post.whyItMatters = why(terms, { provider: { name: post.author?.name } });
    if (db.vectors?.posts) db.vectors.posts[post.id] = embed(cleaned);
    changed = true;
  }
  return changed;
}

function ingestItems(db, items) {
  let added = 0;
  for (const item of items) {
    const url = item.url || null;
    const author = authorFor(db, item);
    const text = plainText([item.title, item.summary].filter(Boolean).join(". ")).slice(0, 700);
    const person = item.provider?.kind === "person";
    if (!person && !item.fresh && !aboutAi(text)) continue;
    const existing = url ? db.posts.find((post) => post.url === url) : null;
    if (existing) {
      const cleaned = plainText(existing.text);
      if (cleaned !== existing.text) {
        existing.text = cleaned;
        existing.tldr = levels(cleaned);
        const terms = linkTerms(cleaned, db.terms, db.vectors.terms);
        if (terms.length) existing.terms = terms;
        existing.whyItMatters = why(terms, item);
        db.vectors.posts[existing.id] = embed(cleaned);
      }
      if (item.fresh) existing.fresh = true;
      continue;
    }
    const terms = linkTerms(text, db.terms, db.vectors.terms);
    const id = `p_${String(item.id || url || text).replace(/\W/g, "").slice(0, 16)}`;
    db.posts.push({
      id,
      source: sourceFor(url),
      url,
      author,
      publishedAt: item.published_at || item.publishedAt || new Date().toISOString(),
      text,
      tldr: levels(text),
      whyItMatters: why(terms, item),
      terms,
      topic: item.subjects?.[0] || terms[0]?.term || null,
      fresh: Boolean(item.fresh),
      createdBy: null,
    });
    db.vectors.posts[id] = embed(text);
    added += 1;
  }
  db.posts.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  return added;
}

function freshUser(id) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id,
    name: id === "demo" ? "John" : id,
    goal: null,
    lens: null,
    level: "beginner",
    levels: {},
    xp: 0,
    streak: 0,
    today,
    lastLessonDate: null,
    lastGoalMetDate: null,
    onboarded: false,
    lessonsCompleted: 0,
    reads: {},
    dives: {},
    queuedByDay: {},
    decodesByDay: {},
    questXp: {},
  };
}

function hydrate(user) {
  for (const [key, value] of Object.entries(freshUser(user.id))) {
    if (user[key] === undefined) user[key] = value;
  }
  if (user.name === "Chai") user.name = "John";
  user.reads ||= {};
  user.dives ||= {};
  user.queuedByDay ||= {};
  user.decodesByDay ||= {};
  user.questXp ||= {};
}

function freshTerms() {
  const rows = {};
  for (const term of TERMS) rows[term.id] = { status: "new", source: "lesson" };
  return rows;
}

function authorRecord(person) {
  return {
    id: person.id,
    name: person.name,
    handle: person.handle,
    archetype: person.archetype,
    avatarUrl: null,
    bio: person.bio,
    whyFollow: person.whyFollow,
    difficulty: person.difficulty,
  };
}

function authorFor(db, item) {
  const provider = item.provider || {};
  const curated = PEOPLE.find((person) => person.providerId === provider.id);
  const id = curated?.id || `a_${provider.id || item.source?.id || "news"}`;
  let author = db.authors.find((row) => row.id === id);
  if (!author && curated) {
    author = authorRecord(curated);
    db.authors.push(author);
  }
  if (author) return { id: author.id, name: author.name, handle: author.handle, archetype: author.archetype, avatarUrl: author.avatarUrl };
  return {
    id,
    name: provider.name || item.source?.name || "News",
    handle: `@${provider.id || "news"}`,
    archetype: "operator",
    avatarUrl: null,
  };
}

function sourceFor(url) {
  const value = String(url || "");
  if (/(x|twitter)\.com/i.test(value)) return "x";
  if (/linkedin\.com/i.test(value)) return "linkedin";
  return "substack";
}

function levels(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  return {
    beginner: sentences[0]?.trim() || clean,
    amateur: sentences.slice(0, 2).join(" ").trim() || clean,
    pro: sentences.slice(0, 3).join(" ").trim() || clean,
  };
}

function why(terms, item) {
  if (terms.length) return `It uses ${terms.map((term) => term.term).slice(0, 3).join(", ")}, which is what today's lesson can teach.`;
  const name = item.provider?.name || item.source?.name || "the feed";
  return `A current story from ${name}.`;
}
