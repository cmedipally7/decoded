import { cosine, embed, termDocument, tokens } from "./embed.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findExactTerms(text, terms) {
  const found = [];
  for (const term of terms) {
    const candidates = [term.term, ...(term.aliases || [])].sort((a, b) => b.length - a.length);
    for (const candidate of candidates) {
      if (!candidate) continue;
      const match = text.match(new RegExp(`\\b${escapeRegExp(candidate)}\\b`, "i"));
      if (match && match.index !== undefined) {
        found.push({ id: term.id, term: match[0], idx: match.index });
        break;
      }
    }
  }
  const kept = found.filter(
    (item) =>
      !found.some(
        (other) =>
          other !== item &&
          other.term.length > item.term.length &&
          item.idx >= other.idx &&
          item.idx + item.term.length <= other.idx + other.term.length,
      ),
  );
  return kept.sort((a, b) => a.idx - b.idx).map(({ id, term }) => ({ id, term }));
}

export function searchTerms(text, terms, vectors, limit = 5) {
  const query = embed(text);
  return terms
    .map((term) => ({ term, score: cosine(query, vectors[term.id] || []) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function linkTerms(text, terms, vectors) {
  const exact = findExactTerms(text, terms);
  const exactIds = new Set(exact.map((item) => item.id));
  const words = new Set(tokens(text));
  const semantic = searchTerms(text, terms, vectors, 8)
    .filter((hit) => {
      if (hit.score < 0.28 || exactIds.has(hit.term.id)) return false;
      const needles = tokens([hit.term.term, ...(hit.term.aliases || [])].join(" "));
      return needles.some((word) => words.has(word));
    })
    .slice(0, 2)
    .map((hit) => ({ id: hit.term.id, term: hit.term.term }));
  return [...exact, ...semantic].slice(0, 5);
}

export function vectorsFor(terms) {
  return Object.fromEntries(terms.map((term) => [term.id, embed(termDocument(term))]));
}
