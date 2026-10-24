import { INITIAL_KNOWN, TERMS } from "./glossary.js";

export const LENS_PATH = {
  researcher: ["Foundations", "Models", "Frontier", "Building", "Business of AI"],
  builder: ["Foundations", "Building", "Models", "Business of AI", "Frontier"],
  investor: ["Foundations", "Business of AI", "Models", "Building", "Frontier"],
  operator: ["Foundations", "Building", "Business of AI", "Models", "Frontier"],
};

export const FRESH_TERMS = ["t_test_time_compute", "t_mcp", "t_vibe_coding", "t_reasoning_model", "t_capex"];

export const KNOWN_BY_LEVEL = {
  beginner: ["t_llm", "t_prompt"],
  amateur: INITIAL_KNOWN,
  pro: TERMS.map((term) => term.id).filter((id) => !FRESH_TERMS.includes(id) && id !== "t_wrapper"),
};

export const PERSONAS = {
  beginner: { lens: "operator", streak: 2, xp: 60 },
  amateur: { lens: "builder", streak: 6, xp: 520 },
  pro: { lens: "investor", streak: 23, xp: 1850 },
};

export const LEVELS = new Set(["beginner", "amateur", "pro"]);
export const LENSES = new Set(["researcher", "builder", "investor", "operator"]);

export function lensOrder(lens) {
  return LENS_PATH[lens] || LENS_PATH.operator;
}

export function courseDays(lens) {
  const chapters = {
    Foundations: [
      { title: "What is an LLM?", termIds: ["t_llm", "t_token"] },
      { title: "Talking to AI", termIds: ["t_prompt", "t_hallucination"] },
      { title: "How AI learns", termIds: ["t_training", "t_inference"] },
      { title: "Memory and size", termIds: ["t_context_window", "t_parameters"] },
    ],
    Models: [
      { title: "Beyond text", termIds: ["t_multimodal", "t_open_weights"] },
      { title: "AI that thinks first", termIds: ["t_reasoning_model", "t_test_time_compute"] },
    ],
    Building: [
      { title: "Open-book AI", termIds: ["t_rag", "t_embeddings"] },
      { title: "Teaching new tricks", termIds: ["t_fine_tuning", "t_evals"] },
      { title: "AI that takes action", termIds: ["t_agent", "t_mcp"] },
      { title: "Building without code", termIds: ["t_vibe_coding"] },
    ],
    "Business of AI": [
      { title: "The cost of every answer", termIds: ["t_inference_cost", "t_gpu"] },
      { title: "The big spend", termIds: ["t_capex"] },
      { title: "Who wins?", termIds: ["t_moat", "t_wrapper"] },
    ],
    Frontier: [
      { title: "Does bigger keep winning?", termIds: ["t_scaling_laws"] },
      { title: "The AGI debate", termIds: ["t_agi", "t_alignment"] },
    ],
  };
  return lensOrder(lens).flatMap((chapter) =>
    (chapters[chapter] || []).map((day, index) => ({
      chapter,
      n: index + 1,
      title: day.title,
      termIds: day.termIds,
      id: `${chapter}-${index + 1}`,
    })),
  );
}
