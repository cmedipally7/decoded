import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { openDb } from "../src/db.js";
import { parseFeed } from "../src/feeds.js";
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

test("known terms are per user and lessons skip them", async () => {
  const db = tempDb();
  const { createApp } = await import("../src/server.js");
  const app = createApp(db);
  const server = app.listen(0);
  const port = server.address().port;
  const get = (user, path) => fetch(`http://127.0.0.1:${port}${path}`, { headers: { "X-User-Id": user } }).then((res) => res.json());
  try {
    const demo = await get("demo", "/api/me");
    const other = await get("ada", "/api/me");
    assert.ok(demo.wordsKnown > other.wordsKnown);
    const lesson = await get("demo", "/api/lesson/today");
    const conceptIds = lesson.cards.filter((card) => card.type === "concept").map((card) => card.termId);
    for (const id of conceptIds) assert.equal(db.known("demo", id), false);
    const queued = await fetch(`http://127.0.0.1:${port}/api/terms/t_rag/queue`, {
      method: "POST",
      headers: { "X-User-Id": "demo" },
    }).then((res) => res.json());
    assert.equal(queued.queued, true);
    assert.equal(db.status("ada", "t_rag"), "new");
  } finally {
    server.close();
    fs.rmSync(db.file, { force: true });
  }
});

test("a fresh database does not include refresh-only people", () => {
  const db = tempDb();
  assert.equal(db.raw.posts.some((post) => post.author.id === "a_karpathy"), false);
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
