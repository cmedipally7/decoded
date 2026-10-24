const STOP = new Set(
  "a an the of to and in for on with that this is it as be or by from at are was were been being your you we they their its not but if so than then just into about over after before can will would who what when how".split(" "),
);

export function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function embed(text) {
  const vector = new Float64Array(96);
  const words = tokens(text);
  const add = (token, weight) => {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) hash = Math.imul(hash ^ token.charCodeAt(i), 16777619);
    vector[Math.abs(hash) % vector.length] += weight;
  };
  for (const word of words) add(word, 1);
  for (let i = 0; i < words.length - 1; i++) add(`${words[i]}_${words[i + 1]}`, 1.5);
  for (const match of String(text || "").toLowerCase().match(/\b[a-z]{2,6}\b/g) || []) {
    if (match.length <= 4) add(`acro:${match}`, 2);
  }
  let norm = 0;
  for (const value of vector) norm += value * value;
  norm = Math.sqrt(norm) || 1;
  return Array.from(vector, (value) => Math.round((value / norm) * 10000) / 10000);
}

export function cosine(left, right) {
  let score = 0;
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; i++) score += left[i] * right[i];
  return score;
}

export function termDocument(term) {
  return [term.term, ...(term.aliases || []), term.definitions?.beginner || "", term.analogy || ""].join(" ");
}
