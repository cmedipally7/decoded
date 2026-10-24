import { PEOPLE } from "./people.js";

function decode(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function blocks(xml, tag) {
  return [...String(xml).matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, "gi"))].map((match) => match[0]);
}

function field(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decode(match[1]) : "";
}

function linkOf(block) {
  const atom = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].find((match) => !/rel=["']self["']/i.test(match[1]));
  const href = atom?.[1].match(/href=["']([^"']+)["']/i);
  return href?.[1] || field(block, "link");
}

function time(value) {
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function parseFeed(xml, limit = 5) {
  const chunks = blocks(xml, "item");
  const entries = chunks.length ? chunks : blocks(xml, "entry");
  return entries
    .map((block) => {
      const published = field(block, "pubDate") || field(block, "updated") || field(block, "published");
      return {
        title: field(block, "title"),
        url: linkOf(block),
        summary: (field(block, "description") || field(block, "summary") || field(block, "content")).slice(0, 600),
        published_at: published ? new Date(time(published) || Date.now()).toISOString() : null,
        stamp: time(published),
      };
    })
    .filter((item) => item.title && item.url)
    .sort((a, b) => b.stamp - a.stamp)
    .slice(0, limit)
    .map(({ stamp, ...item }) => item);
}

export async function fetchLaterPeople() {
  const items = [];
  for (const person of PEOPLE.filter((person) => person.later && person.feed)) {
    try {
      const response = await fetch(person.feed, {
        headers: { "User-Agent": "decoded/0.1" },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) continue;
      for (const entry of parseFeed(await response.text(), 5)) {
        items.push({
          ...entry,
          id: entry.url,
          provider: { id: person.providerId, name: person.name, kind: "person" },
          subjects: ["ai"],
        });
      }
    } catch {
      // A missed feed stays empty until the next refresh.
    }
  }
  return items;
}
