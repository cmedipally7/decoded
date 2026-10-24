import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { openDb } from "./db.js";
import { buildLesson } from "./lesson.js";
import { linkTerms } from "./link.js";
import { fetchLaterPeople } from "./feeds.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function userId(req) {
  return String(req.header("x-user-id") || "demo");
}

function fail(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function lessonFor(db, id) {
  db.ensureUser(id);
  const key = `${id}:${db.raw.users[id].today}`;
  if (!db.raw.lessons[key]) {
    const lesson = buildLesson(db, id);
    lesson.userId = id;
    db.raw.lessons[key] = lesson;
    db.save();
  }
  return db.raw.lessons[key];
}

function publicLesson(lesson) {
  const { termIds, ...rest } = lesson;
  return rest;
}

function addDays(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function decodeFromText(db, text, url) {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const linked = linkTerms(clean, db.raw.terms, db.raw.vectors.terms);
  const glosses = linked.slice(0, 2).map((term) => {
    const row = db.term(term.id);
    return row ? `"${term.term}" means ${row.definitions.beginner}` : "";
  }).filter(Boolean);
  let host = "pasted text";
  if (url) {
    try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { host = "pasted text"; }
  }
  return {
    id: `p_user_${Date.now()}`,
    source: "user",
    url,
    author: { id: "a_you", name: "Shared by you", handle: host, archetype: "operator", avatarUrl: null },
    publishedAt: new Date().toISOString(),
    text: clean,
    tldr: {
      beginner: `The main point: ${sentences[0].trim()} ${glosses.length ? `In plain English: ${glosses.join("; ")}` : ""}`.trim(),
      amateur: sentences.slice(0, 2).join(" ").trim(),
      pro: sentences.slice(0, 3).join(" ").trim(),
    },
    whyItMatters: linked.length ? `It depends on ${linked.map((term) => term.term).join(" and ")}.` : "Here is the plain-English gist.",
    terms: linked,
    topic: linked[0]?.term || null,
    createdBy: null,
  };
}

async function readUrl(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": "Decoded/0.1", "Accept-Language": "en-US" },
  });
  const html = await response.text();
  const og = html.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1]
    || html.match(/content=["']([^"']+)["']\s+property=["']og:description["']/i)?.[1];
  const text = (og || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  if (text.length < 40 || /sign in|log in|join linkedin/i.test(text)) return null;
  return text;
}

export function createApp(db = openDb()) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.get("/api/me", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    res.json(db.userOut(id));
  });

  app.patch("/api/me", (req, res) => {
    const id = userId(req);
    const user = db.ensureUser(id);
    if (req.body?.level) user.level = req.body.level;
    if (req.body?.name) user.name = req.body.name;
    delete db.raw.lessons[`${id}:${user.today}`];
    db.save();
    res.json(db.userOut(id));
  });

  app.get("/api/path", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    let current = false;
    const units = db.raw.path.map((unit) => {
      const rows = db.raw.terms.filter((term) => term.category === unit.title);
      const progress = rows.length ? rows.filter((term) => db.known(id, term.id)).length / rows.length : 0;
      let status = "locked";
      if (progress >= 1) status = "done";
      else if (!current) { status = "current"; current = true; }
      return { ...unit, status, progress };
    });
    res.json({ units });
  });

  app.get("/api/placement/questions", (_req, res) => {
    res.json({ questions: db.raw.placement.map(({ answer, ...question }) => question) });
  });

  app.post("/api/placement", (req, res) => {
    const id = userId(req);
    const user = db.ensureUser(id);
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const score = db.raw.placement.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
    const level = score >= 5 ? "pro" : score >= 3 ? "amateur" : "beginner";
    user.goal = req.body?.goal || user.goal;
    user.level = level;
    user.onboarded = true;
    delete db.raw.lessons[`${id}:${user.today}`];
    db.save();
    res.json({ level, score, user: db.userOut(id) });
  });

  app.get("/api/lesson/today", (req, res) => {
    const id = userId(req);
    res.json(publicLesson(lessonFor(db, id)));
  });

  app.post("/api/lesson/:id/answer", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const xpAwarded = req.body?.correct ? 10 : 0;
    db.raw.users[id].xp += xpAwarded;
    db.save();
    res.json({ xpAwarded, user: db.userOut(id) });
  });

  app.post("/api/lesson/:id/complete", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const lesson = db.raw.lessons[`${id}:${req.params.id.slice(2)}`] || lessonFor(db, id);
    if (!lesson || (lesson.userId && lesson.userId !== id)) return fail(res, 404, "NOT_FOUND", "Lesson not found");
    const before = db.userOut(id).feedFluency;
    if (!lesson.completed) {
      for (const termId of lesson.termIds || []) db.setStatus(id, termId, "learning", "lesson");
      lesson.completed = true;
      lesson.userId = id;
      db.raw.users[id].xp += 20;
      if (db.raw.users[id].lastLessonDate !== db.raw.users[id].today) {
        db.raw.users[id].streak += 1;
        db.raw.users[id].lastLessonDate = db.raw.users[id].today;
      }
      db.save();
    }
    const after = db.userOut(id);
    res.json({
      xpAwarded: 20,
      streak: after.streak,
      wordsLearned: (lesson.termIds || []).map((termId) => db.term(termId)?.term).filter(Boolean),
      feedFluencyBefore: before,
      feedFluencyAfter: after.feedFluency,
      user: after,
    });
  });

  app.get("/api/feed", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const posts = db.postsFor(id, { archetype: req.query.archetype, source: req.query.source });
    res.json({ posts });
  });

  app.post("/api/feed/refresh", async (_req, res) => {
    const newsPath = path.join(ROOT, "seed", "news.json");
    const news = fs.existsSync(newsPath) ? JSON.parse(fs.readFileSync(newsPath, "utf8")) : { items: [] };
    const laterPath = path.join(ROOT, "seed", "later.json");
    const held = fs.existsSync(laterPath) ? JSON.parse(fs.readFileSync(laterPath, "utf8")).items || [] : [];
    const live = await fetchLaterPeople();
    const revealed = [...held, ...live].map((item) => ({ ...item, fresh: true }));
    res.json(db.syncNews([...(news.items || []), ...revealed]));
  });

  app.get("/api/terms/:id", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const term = db.term(req.params.id);
    if (!term) return fail(res, 404, "NOT_FOUND", "Term not found");
    res.json({
      id: term.id,
      term: term.term,
      category: term.category,
      definitions: term.definitions,
      analogy: term.analogy,
      status: db.status(id, term.id),
    });
  });

  app.post("/api/terms/:id/queue", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const term = db.term(req.params.id);
    if (!term) return fail(res, 404, "NOT_FOUND", "Term not found");
    if (!db.known(id, term.id) && db.status(id, term.id) !== "queued") {
      db.setStatus(id, term.id, "queued", "feed");
      db.raw.users[id].xp += 5;
      const key = `${id}:${db.raw.users[id].today}`;
      if (db.raw.lessons[key] && !db.raw.lessons[key].completed) delete db.raw.lessons[key];
      db.save();
    }
    res.json({ queued: true, queuedTermsCount: db.userOut(id).queuedTermsCount });
  });

  app.post("/api/decode", async (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const url = req.body?.url?.trim() || null;
    const text = req.body?.text?.trim() || "";
    if (!url && !text) return fail(res, 400, "BAD_REQUEST", "Provide a url or text");
    try {
      let post;
      let method = "text";
      if (text) post = decodeFromText(db, text, url);
      else if (/linkedin\.com/i.test(url)) {
        return res.json({ ok: false, needsText: true, url, reason: "LinkedIn requires login for this post." });
      } else {
        const extracted = await readUrl(url);
        if (!extracted) return res.json({ ok: false, needsText: true, url, reason: "Could not read this page. Paste the text instead." });
        post = decodeFromText(db, extracted, url);
        method = "og";
      }
      post.createdBy = id;
      db.raw.userPosts[id].unshift(post);
      db.save();
      res.json({ ok: true, post, method });
    } catch {
      if (url) return res.json({ ok: false, needsText: true, url, reason: "Could not read this page. Paste the text instead." });
      return fail(res, 400, "BAD_REQUEST", "Could not decode that text");
    }
  });

  app.post("/api/chat", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const posts = db.postsFor(id);
    const post = posts.find((item) => item.id === req.body?.postId) || posts[0];
    if (!post) return fail(res, 404, "NOT_FOUND", "Post not found");
    const question = (req.body?.messages || []).filter((message) => message.role === "user").pop()?.content || "";
    const q = question.toLowerCase();
    const level = db.raw.users[id].level;
    const author = db.raw.authors.find((item) => item.id === post.author.id);
    const asked = db.raw.terms.find((term) => [term.term, ...(term.aliases || [])].some((name) => q.includes(name.toLowerCase())));
    let reply;
    if (/who is|who's this|this person|author/.test(q)) {
      reply = author
        ? `${author.name} (${author.handle}) is a ${author.archetype}. ${author.bio} People follow them because ${author.whyFollow}`
        : `This came from ${post.author.handle}. Ask whether they research, build, invest, or operate.`;
    } else if (asked) {
      reply = `${asked.term}: ${asked.definitions[level]} Think of it like this: ${asked.analogy}`;
    } else if (/new|simple|eli5|explain|plain|beginner/.test(q)) {
      reply = post.tldr.beginner;
    } else {
      reply = `${post.tldr[level] || post.tldr.beginner} Why it matters: ${post.whyItMatters}`;
    }
    const suggestions = post.terms.slice(0, 2).map((term) => `What does "${term.term}" mean?`);
    suggestions.push("What's the counter-argument?");
    res.json({ reply, suggestions: suggestions.slice(0, 3) });
  });

  app.get("/api/authors", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const following = new Set(db.raw.follows[id] || []);
    res.json({ authors: db.raw.authors.map((author) => ({ ...author, following: following.has(author.id) })) });
  });

  app.post("/api/authors/:id/follow", (req, res) => {
    const id = userId(req);
    db.ensureUser(id);
    const follow = Boolean(req.body?.follow);
    const set = new Set(db.raw.follows[id] || []);
    if (follow) set.add(req.params.id);
    else set.delete(req.params.id);
    db.raw.follows[id] = [...set];
    db.save();
    res.json({ following: follow });
  });

  app.post("/api/dev/next-day", (req, res) => {
    const id = userId(req);
    const user = db.ensureUser(id);
    user.today = addDays(user.today, 1);
    db.save();
    res.json({ user: db.userOut(id) });
  });

  app.post("/api/dev/reset", (req, res) => {
    const id = userId(req);
    db.resetUser(id);
    res.json({ user: db.userOut(id) });
  });

  const dist = path.resolve(ROOT, "..", "frontend", "dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  return app;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, "0.0.0.0", () => {
    console.log(`decoded api on :${port}`);
  });
}
