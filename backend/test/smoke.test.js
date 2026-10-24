import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { openDb } from "../src/db.js";
import later from "../seed/later.json" with { type: "json" };
import { parseFeed, plainText } from "../src/feeds.js";
import { linkTerms } from "../src/link.js";

function tempDb() {
  return openDb(path.join(os.tmpdir(), `decoded-${Date.now()}-${Math.random().toString(16).slice(2)}.json`));
}

test("semantic search connects a paraphrase to RAG and ignores weather", () => {
  const db = tempDb();
  const linked = linkTerms(
    "Retrieval-augmented generation lets agents look up documents before they answer.",
    db.raw.terms,
    db.raw.vectors.terms,
  );
  assert.ok(linked.some((term) => term.id === "t_rag"));
  const weather = linkTerms("Rain is expected across the coast tomorrow.", db.raw.terms, db.raw.vectors.terms);
  assert.equal(weather.some((term) => term.id === "t_rag"), false);
});

test("onboarding, words, path, reads, and personas are real user state", async () => {
  const db = tempDb();
  const { createApp } = await import("../src/server.js");
  const app = createApp(db);
  const server = app.listen(0);
  const port = server.address().port;
  const headers = { "X-User-Id": "demo", "Content-Type": "application/json" };
  const call = (method, path, body) => fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json());
  try {
    const fresh = await call("GET", "/api/me");
    assert.equal(fresh.name, "John");
    assert.equal(fresh.onboarded, false);
    assert.equal(fresh.lens, null);
    assert.equal(fresh.homeTab, "today");
    assert.equal(fresh.quests.length, 3);
    const onboarded = await call("POST", "/api/onboarding", { level: "amateur", lens: "builder", name: "Ada" });
    assert.equal(onboarded.user.name, "Ada");
    assert.equal(onboarded.user.lens, "builder");
    assert.equal(onboarded.user.level, "amateur");
    assert.ok(onboarded.user.wordsKnown > 0);
    assert.equal(onboarded.user.dailyGoal.label, "1 lesson or 3 posts");
    const words = await call("GET", "/api/me/words");
    assert.equal(words.terms.length, onboarded.user.wordsKnown);
    assert.ok(words.terms.every((term) => term.status === "learning" || term.status === "known"));
    const path = await call("GET", "/api/path");
    assert.ok(path.units[0].days.length > 0);
    assert.equal(path.units[0].days[0].status, "done");
    const lesson = await call("GET", "/api/lesson/today");
    const conceptIds = lesson.cards.filter((card) => card.type === "concept").map((card) => card.termId);
    for (const id of conceptIds) assert.equal(db.known("demo", id), false);
    const read = await call("POST", "/api/feed/p_seed_agents/read");
    assert.equal(read.user.dailyGoal.progress, 1);
    const feed = await call("GET", "/api/feed");
    assert.ok(feed.posts[0].whyItMattersByLens.builder);
    assert.ok(feed.posts[0].debate);
    const persona = await call("POST", "/api/dev/persona", { level: "pro" });
    assert.equal(persona.user.level, "pro");
    assert.equal(persona.user.lens, "investor");
    assert.equal(persona.user.streak, 23);
    assert.equal(db.status("ada", "t_rag"), "new");
  } finally {
    server.close();
    fs.rmSync(db.file, { force: true });
  }
});

test("escaped feed html is stored as plain text", () => {
  const clean = plainText("Deep Neural Nets. &lt;style&gt;.post-header h1 { font-size: 35px; }&lt;/style&gt;&lt;p&gt;The paper is famous.&lt;/p&gt;");
  assert.equal(clean.includes("<"), false);
  assert.equal(clean.includes("font-size"), false);
  assert.match(clean, /The paper is famous/);
});

test("a fresh database does not include refresh-only people", () => {
  const db = tempDb();
  assert.equal(db.raw.posts.some((post) => post.author.id === "a_karpathy"), false);
  const held = new Set(later.items.map((item) => item.url));
  assert.equal(db.raw.posts.some((post) => held.has(post.url)), false);
  const added = db.syncNews(later.items.map((item) => ({ ...item, fresh: true })));
  assert.equal(added.added, later.items.length);
  assert.equal(db.postsFor("demo")[0].fresh, true);
  const parsed = parseFeed(`
    <rss><channel>
      <item><title>Older</title><link>https://example.com/old</link><pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate></item>
      <item><title>Newer</title><link>https://example.com/new</link><pubDate>Fri, 01 Jan 2026 00:00:00 GMT</pubDate></item>
    </channel></rss>
  `);
  assert.equal(parsed[0].title, "Newer");
  fs.rmSync(db.file, { force: true });
});

test("scraped news is stored once", () => {
  const db = tempDb();
  const before = db.raw.posts.length;
  const again = db.ingestNews([{ id: "x", title: "Agents use RAG", summary: "A note", url: "https://example.com/rag", published_at: "2026-10-24T00:00:00Z", provider: { id: "nyt", name: "NYT", kind: "publication" }, subjects: ["technology"] }]);
  assert.equal(again, 1);
  assert.equal(db.ingestNews([{ id: "x", title: "Agents use RAG", summary: "A note", url: "https://example.com/rag", published_at: "2026-10-24T00:00:00Z", provider: { id: "nyt", name: "NYT" } }]), 0);
  assert.equal(db.raw.posts.length, before + 1);
  const skipped = db.ingestNews([{ id: "w", title: "Seven shot dead by gunmen at church funeral in Jordan", summary: "Officials confirmed the attack.", url: "https://example.com/jordan", published_at: "2026-10-24T00:00:00Z", provider: { id: "bbc", name: "BBC" } }]);
  assert.equal(skipped, 0);
  assert.equal(db.raw.posts.length, before + 1);
  fs.rmSync(db.file, { force: true });
});
