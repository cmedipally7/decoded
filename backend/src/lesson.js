const SHORT = {
  t_llm: "The type of AI behind ChatGPT",
  t_token: "A chunk of text (~¾ word)",
  t_prompt: "What you type to the AI",
  t_training: "The AI's learning phase",
  t_inference: "Running the AI to get an answer",
  t_hallucination: "Confident but false output",
  t_context_window: "How much the AI can read at once",
  t_parameters: "The model's learned knobs",
  t_multimodal: "Handles text, images and audio",
  t_open_weights: "A model anyone can download",
  t_reasoning_model: "AI that thinks before answering",
  t_test_time_compute: "Extra effort while answering",
  t_rag: "AI looks things up before answering",
  t_embeddings: "Text turned into meaning-numbers",
  t_fine_tuning: "Extra lessons for one job",
  t_agent: "AI that takes actions for you",
  t_evals: "Report cards for AI",
  t_mcp: "A standard plug from AI to apps",
  t_vibe_coding: "Building apps by describing them",
  t_inference_cost: "The meter running on every AI answer",
  t_gpu: "The chips AI runs on",
  t_capex: "Big spending on data centers",
  t_moat: "What stops copycats",
  t_wrapper: "A thin app on someone else's model",
  t_scaling_laws: "Bigger plus more data means smarter",
  t_agi: "Human-level AI, still debated",
  t_alignment: "Making AI do what we intend",
};

const ORDER = ["Foundations", "Models", "Building", "Business of AI", "Frontier"];

function shuffle(items, seed) {
  let state = seed;
  const next = () => ((state = (state * 9301 + 49297) % 233280) / 233280);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function lower(value) {
  return /^[A-Z]{2}/.test(value) ? value : value.charAt(0).toLowerCase() + value.slice(1);
}

export function buildLesson(db, userId) {
  const user = db.raw.users[userId];
  const level = user.level;
  const queued = Object.entries(db.raw.userTerms[userId])
    .filter(([, row]) => row.status === "queued")
    .map(([id]) => id)
    .slice(0, 3);
  const fresh = [...db.raw.terms]
    .filter((term) => db.status(userId, term.id) === "new")
    .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category))
    .map((term) => term.id);
  const termIds = [...queued];
  for (const id of fresh) {
    if (termIds.length >= 3) break;
    if (!termIds.includes(id)) termIds.push(id);
  }
  const terms = termIds.map((id) => db.term(id)).filter(Boolean);
  const cards = [];
  const seed = user.today.replaceAll("-", "") * 1 + termIds.join("").length;

  terms.forEach((term, index) => {
    cards.push({
      id: `c_concept_${index}`,
      type: "concept",
      termId: term.id,
      term: term.term,
      explanation: term.definitions[level],
      analogy: term.analogy,
      fromFeed: queued.includes(term.id),
    });
  });

  if (terms[0]) {
    const term = terms[0];
    const distractors = shuffle(
      db.raw.terms.filter((item) => item.id !== term.id),
      seed,
    )
      .slice(0, 3)
      .map((item) => SHORT[item.id]);
    const options = shuffle([SHORT[term.id], ...distractors], seed + 1);
    cards.push({
      id: "c_mcq",
      type: "mcq",
      question: `Which best describes "${term.term}"?`,
      options,
      answerIndex: options.indexOf(SHORT[term.id]),
      explanation: `${term.term}: ${term.definitions.beginner}`,
    });
  }

  const known = shuffle(
    db.raw.terms.filter((term) => db.known(userId, term.id) && !termIds.includes(term.id)),
    seed + 2,
  );
  const pool = [...terms, ...known].slice(0, 4);
  cards.push({
    id: "c_match",
    type: "match",
    pairs: pool.map((term) => ({ left: term.term, right: SHORT[term.id] })),
  });

  const posts = db.postsFor(userId);
  const post = posts.find((item) => item.terms.some((term) => termIds.includes(term.id))) || posts[0];
  if (post) {
    const target = post.terms.find((term) => termIds.includes(term.id)) || post.terms[0];
    const targetTerm = target ? db.term(target.id) : terms[0];
    if (targetTerm) {
      const others = shuffle(
        db.raw.terms.filter((term) => term.id !== targetTerm.id),
        seed + 3,
      )
        .slice(0, 3)
        .map((term) => term.term);
      const options = shuffle([targetTerm.term, ...others], seed + 4);
      cards.push({
        id: "c_real",
        type: "real_post",
        author: post.author.name,
        postSnippet: post.text.length > 220 ? `${post.text.slice(0, 217)}…` : post.text,
        question: `In this post, which word means "${lower(SHORT[targetTerm.id] || targetTerm.term)}"?`,
        options,
        answerIndex: options.indexOf(targetTerm.term),
        explanation: `"${targetTerm.term}" = ${lower(SHORT[targetTerm.id] || targetTerm.definitions.beginner)}.`,
      });
    }
  }

  const blank = terms[terms.length - 1];
  if (blank) {
    const options = shuffle(
      [blank.term, ...shuffle(db.raw.terms.filter((term) => term.id !== blank.id), seed + 5).slice(0, 2).map((term) => term.term)],
      seed + 6,
    );
    cards.push({
      id: "c_fill",
      type: "fill_blank",
      sentence: `${blank.analogy.replace(/\.$/, "")}. That's how you can think about ___.`,
      options,
      answerIndex: options.indexOf(blank.term),
      explanation: `${blank.term}: ${blank.definitions.beginner}`,
    });
  }

  return {
    id: `l_${user.today}`,
    date: user.today,
    unitTitle: queued.length ? "From your feed ✨" : terms[0]?.category || "Building",
    cards,
    completed: false,
    termIds,
  };
}
