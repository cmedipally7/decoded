const author = (id, name, handle, archetype) => ({ id, name, handle, archetype, avatarUrl: null });

export const SEED_POSTS = [
  {
    id: "p_seed_agents",
    source: "x",
    url: "https://x.com/priyaships/status/1",
    author: author("a_priya", "Priya Natarajan", "@priyaships", "builder"),
    publishedAt: "2026-10-24T13:05:00Z",
    text: "Inference costs dropped 10x again this year. Agents with RAG are finally cheap enough to run on every support ticket.",
    tldr: {
      beginner: "Running AI got much cheaper, so companies can afford helpers that look things up for every customer question.",
      amateur: "Inference got about 10x cheaper, so retrieval-backed agents now make sense for support tickets.",
      pro: "A sharp drop in inference cost makes RAG agents cheaper than the old support workflow at scale.",
    },
    whyItMatters: "Cheaper AI is why agents are showing up in support plans.",
    terms: [
      { id: "t_inference_cost", term: "Inference costs" },
      { id: "t_agent", term: "Agents" },
      { id: "t_rag", term: "RAG" },
    ],
    topic: "AI cost curve",
    createdBy: null,
  },
  {
    id: "p_seed_hallucination",
    source: "substack",
    url: "https://example.substack.com/p/hallucinations",
    author: author("a_maya", "Dr. Maya Chen", "@mayachen_ai", "researcher"),
    publishedAt: "2026-10-23T15:00:00Z",
    text: "A hallucination is still the failure mode I see most. Evals catch it. A bigger context window does not.",
    tldr: {
      beginner: "The common AI failure is sounding sure while being wrong. Tests catch that. A bigger memory does not.",
      amateur: "Hallucinations remain the main failure. Evals catch them. A larger context window does not.",
      pro: "Hallucination is still the dominant failure mode. Evals catch it. Context length does not.",
    },
    whyItMatters: "Teams shipping AI need a report card, not just a bigger model.",
    terms: [
      { id: "t_hallucination", term: "hallucination" },
      { id: "t_evals", term: "Evals" },
      { id: "t_context_window", term: "context window" },
    ],
    topic: "AI reliability",
    createdBy: null,
  },
];
