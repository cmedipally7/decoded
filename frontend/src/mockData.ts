// Seed content for mock mode. Authors are FICTIONAL sample voices; the backend replaces them with real data.
import type { Archetype, Author, Level, PathUnit, PlacementQuestion, Post } from "./types";

export interface SeedTerm {
  id: string;
  term: string;
  aliases: string[];
  category: string;
  definitions: Record<Level, string>;
  analogy: string;
}

export const TERMS: SeedTerm[] = [
  // Foundations
  { id: "t_llm", term: "LLM", aliases: ["large language model", "LLMs"], category: "Foundations",
    definitions: {
      beginner: "The kind of AI behind ChatGPT and Claude. It learned from huge amounts of text, so it can write and answer questions.",
      amateur: "Large Language Model: a neural network trained on massive text data to predict the next word, which lets it chat, write, summarize and reason.",
      pro: "A transformer-based model with billions of parameters, pre-trained on next-token prediction and then post-trained (RLHF, etc.) for instruction following.",
    }, analogy: "A super-reader that has read most of the internet and learned how sentences usually continue." },
  { id: "t_token", term: "token", aliases: ["tokens"], category: "Foundations",
    definitions: {
      beginner: "A small chunk of text, about ¾ of a word. AI reads and writes in tokens, and companies charge by them.",
      amateur: "The unit of text a model processes, typically a word piece. Pricing, speed and memory limits are all measured in tokens.",
      pro: "A subword unit from the model's tokenizer (e.g., BPE). Cost, latency and context limits scale with token count.",
    }, analogy: "Like syllables. The AI counts and bills by the syllable, not the word." },
  { id: "t_prompt", term: "prompt", aliases: ["prompts", "prompting"], category: "Foundations",
    definitions: {
      beginner: "The message or instructions you type to an AI.",
      amateur: "The input given to a model, including instructions, examples and context. Better prompts usually mean better answers.",
      pro: "The full input context (system prompt, examples, retrieved docs, user turn) that conditions the model's output distribution.",
    }, analogy: "The brief you give a new intern. Vague brief, vague work." },
  { id: "t_training", term: "training", aliases: ["trained", "pre-training"], category: "Foundations",
    definitions: {
      beginner: "The learning phase, when an AI studies huge amounts of data before anyone uses it.",
      amateur: "The expensive one-time process of adjusting a model's internal settings on data so it learns patterns.",
      pro: "Optimizing model weights via gradient descent over a corpus; pre-training is compute-dominant and done once per model generation.",
    }, analogy: "Going to school. It's long and expensive, and it happens before the job starts." },
  { id: "t_inference", term: "inference", aliases: [], category: "Foundations",
    definitions: {
      beginner: "When an AI is actually being used, for example answering your question. It's the 'doing the job' part.",
      amateur: "Running a trained model to get an output. Every chat message you send triggers inference.",
      pro: "Forward passes through a trained model to generate outputs; cost is driven by tokens, model size and hardware utilization.",
    }, analogy: "School is training. Showing up to work every day is inference." },
  { id: "t_hallucination", term: "hallucination", aliases: ["hallucinations", "hallucinate"], category: "Foundations",
    definitions: {
      beginner: "When AI confidently says something that's false or made up.",
      amateur: "A model output that sounds plausible but isn't grounded in fact, a key reliability risk.",
      pro: "Unfaithful or ungrounded generations; mitigated via retrieval, citations, calibrated refusal and evals.",
    }, analogy: "A very confident friend who'd rather invent an answer than say 'I don't know'." },
  // Models
  { id: "t_context_window", term: "context window", aliases: ["context windows", "long context"], category: "Models",
    definitions: {
      beginner: "How much text an AI can 'keep in mind' at once, like its short-term memory.",
      amateur: "The maximum number of tokens a model can consider in one request, including your input and its answer.",
      pro: "Max sequence length the model attends over; larger windows raise cost and can degrade recall in the middle of the context.",
    }, analogy: "The size of the desk the AI works on. A bigger desk lets it spread out more documents at once." },
  { id: "t_parameters", term: "parameters", aliases: ["params"], category: "Models",
    definitions: {
      beginner: "The internal 'knobs' an AI learned. More knobs usually means a bigger, more capable (and pricier) model.",
      amateur: "The learned numerical weights inside a model; parameter count is a rough proxy for size and capability.",
      pro: "Trainable weights; capability scales with params, data and compute, but MoE and distillation decouple size from cost.",
    }, analogy: "Like the number of neurons and connections in a brain." },
  { id: "t_multimodal", term: "multimodal", aliases: [], category: "Models",
    definitions: {
      beginner: "AI that can handle more than text, like images, voice or video.",
      amateur: "Models that accept or produce multiple data types (text, image, audio, video) in one system.",
      pro: "Joint models over multiple modalities, typically via shared token spaces or modality-specific encoders.",
    }, analogy: "An assistant who can read, look at photos and listen, not just read." },
  { id: "t_open_weights", term: "open-weights", aliases: ["open weights", "open-source model", "open models"], category: "Models",
    definitions: {
      beginner: "An AI model that's free to download and run yourself, instead of only using it through a company's app.",
      amateur: "Models whose trained weights are publicly released, so anyone can run, modify or fine-tune them.",
      pro: "Released weights (often without training data/code) enabling self-hosting, fine-tuning and on-prem deployment; licenses vary.",
    }, analogy: "Getting the recipe and ingredients, not just ordering the dish at a restaurant." },
  { id: "t_reasoning_model", term: "reasoning models", aliases: ["reasoning model", "thinking models"], category: "Models",
    definitions: {
      beginner: "AI that 'thinks before it answers', taking extra time to work through hard problems step by step.",
      amateur: "Models trained to produce an internal chain of thought before answering, improving math, code and planning.",
      pro: "Models RL-trained to use test-time compute (long CoT) for better accuracy on multi-step tasks, trading latency and cost.",
    }, analogy: "The difference between blurting an answer and working it out on scratch paper first." },
  { id: "t_test_time_compute", term: "test-time compute", aliases: ["inference-time compute"], category: "Frontier",
    definitions: {
      beginner: "Letting the AI spend more effort while answering, instead of only making it smarter during training.",
      amateur: "Extra computation used at answer time (thinking longer, trying multiple drafts) to get better results.",
      pro: "Scaling compute at inference via longer reasoning traces, sampling and search; a second scaling axis beyond pre-training.",
    }, analogy: "Giving a student more time on the exam rather than more years of school." },
  // Building
  { id: "t_rag", term: "RAG", aliases: ["retrieval-augmented generation", "retrieval"], category: "Building",
    definitions: {
      beginner: "A way for AI to look things up in your documents before answering, like an open-book exam.",
      amateur: "Retrieval-Augmented Generation: fetch relevant documents and give them to the model with the question so answers are grounded.",
      pro: "Retrieve top-k chunks via embedding/hybrid search and inject them into context; quality hinges on chunking, ranking and evals.",
    }, analogy: "An open-book exam instead of answering from memory." },
  { id: "t_embeddings", term: "embeddings", aliases: ["embedding", "vector database"], category: "Building",
    definitions: {
      beginner: "A way of turning text into numbers so a computer can tell which ideas are similar.",
      amateur: "Numeric vectors representing meaning; similar content has nearby vectors. They power search and RAG.",
      pro: "Dense vector representations from an encoder; nearest-neighbor search over them enables semantic retrieval.",
    }, analogy: "Giving every idea GPS coordinates so similar ideas end up as neighbors." },
  { id: "t_fine_tuning", term: "fine-tuning", aliases: ["fine-tune", "fine-tuned"], category: "Building",
    definitions: {
      beginner: "Giving an already-trained AI extra lessons so it gets good at one specific job.",
      amateur: "Further training a base model on a smaller, task-specific dataset to specialize its behavior or style.",
      pro: "Updating weights (full or LoRA/PEFT) on domain data; best for format and behavior, and less efficient than RAG for fresh knowledge.",
    }, analogy: "A general doctor doing a residency to become a specialist." },
  { id: "t_agent", term: "agents", aliases: ["agent", "agentic", "AI agents"], category: "Building",
    definitions: {
      beginner: "AI that doesn't just chat. It takes actions for you, like booking, emailing or updating a spreadsheet.",
      amateur: "Systems where an LLM plans steps and uses tools (search, code, apps) in a loop to complete a goal.",
      pro: "LLM-driven loops with tool use, memory and planning; reliability compounds across steps, so evals and guardrails matter.",
    }, analogy: "The difference between an advisor who tells you what to do and an assistant who goes and does it." },
  { id: "t_evals", term: "evals", aliases: ["eval", "evaluations", "benchmarks"], category: "Building",
    definitions: {
      beginner: "Tests that check how well an AI does a job, like a report card.",
      amateur: "Structured test sets and scoring used to measure model or product quality before and after changes.",
      pro: "Task-specific test suites (automated, LLM-as-judge, human) used for regression testing and model selection; the real moat for AI products.",
    }, analogy: "Unit tests or a driving test, but for AI behavior." },
  { id: "t_mcp", term: "MCP", aliases: ["Model Context Protocol"], category: "Building",
    definitions: {
      beginner: "A standard 'plug' that lets AI assistants connect to your apps, like Slack, Drive or a calendar.",
      amateur: "Model Context Protocol: an open standard for connecting AI models to tools and data sources in a consistent way.",
      pro: "An open client-server protocol exposing tools, resources and prompts to LLM hosts, reducing the N×M integration problem.",
    }, analogy: "USB-C for AI: one standard plug instead of a different cable for every app." },
  { id: "t_vibe_coding", term: "vibe coding", aliases: ["vibe-coding"], category: "Building",
    definitions: {
      beginner: "Building software by describing what you want in plain English and letting AI write the code.",
      amateur: "A style of development where you steer AI coding tools conversationally and rarely write code by hand.",
      pro: "Prompt-driven development with agentic coding tools; fast for prototypes, with risks around maintainability and security.",
    }, analogy: "Directing a film instead of operating the camera yourself." },
  // Business of AI
  { id: "t_inference_cost", term: "inference costs", aliases: ["inference cost", "cost per token", "token prices"], category: "Business of AI",
    definitions: {
      beginner: "What it costs a company every time its AI answers something. It's like a meter that runs on each question.",
      amateur: "The ongoing per-use cost of running AI (mostly compute), usually priced per million tokens.",
      pro: "Marginal serving cost driven by model size, hardware utilization, batching and caching; it's falling fast, which reshapes unit economics.",
    }, analogy: "A taxi meter that ticks every time someone asks the AI something." },
  { id: "t_gpu", term: "GPUs", aliases: ["GPU", "chips", "H100s"], category: "Business of AI",
    definitions: {
      beginner: "The special computer chips that AI runs on. They're expensive and in huge demand.",
      amateur: "Graphics processors repurposed for AI because they do massive parallel math. NVIDIA dominates the market.",
      pro: "Accelerators for matrix ops; supply, interconnect and memory bandwidth constrain training and serving capacity.",
    }, analogy: "The engines of AI. Whoever has more engines can build bigger models." },
  { id: "t_capex", term: "capex", aliases: ["capital expenditure", "data center spend"], category: "Business of AI",
    definitions: {
      beginner: "Money companies spend on big physical things. In AI, mostly data centers and chips.",
      amateur: "Capital expenditure: large upfront investments, like the hundreds of billions big tech is spending on AI data centers.",
      pro: "Infrastructure investment (DCs, power, accelerators) whose ROI depends on AI revenue catching up to depreciation schedules.",
    }, analogy: "Building the factory before you've sold the cars." },
  { id: "t_moat", term: "moat", aliases: ["moats", "defensibility"], category: "Business of AI",
    definitions: {
      beginner: "What stops competitors from copying a company's success.",
      amateur: "A durable competitive advantage, like data, distribution, network effects or switching costs.",
      pro: "Sustainable advantage; in AI apps it rarely comes from the model itself and more often from workflow, proprietary data, distribution or evals.",
    }, analogy: "The water around a castle that keeps attackers out." },
  { id: "t_wrapper", term: "wrapper", aliases: ["GPT wrapper", "thin wrapper"], category: "Business of AI",
    definitions: {
      beginner: "A product that's mostly a nice interface on top of someone else's AI model.",
      amateur: "A startup built on a third-party model's API with little proprietary technology. It's often used as a critique.",
      pro: "App-layer product on a foundation-model API; risk is commoditization unless it owns workflow, data or distribution.",
    }, analogy: "A fancy case around someone else's phone." },
  // Frontier
  { id: "t_scaling_laws", term: "scaling laws", aliases: ["scaling law", "scaling"], category: "Frontier",
    definitions: {
      beginner: "The pattern that AI keeps getting smarter when you give it more data and computing power.",
      amateur: "Empirical relationships showing model performance improves predictably with more parameters, data and compute.",
      pro: "Power-law fits of loss vs. compute, data and params (Kaplan, Chinchilla); the debate is whether returns are diminishing and which axis to scale.",
    }, analogy: "Like a recipe that keeps getting better the more ingredients you add, until maybe it doesn't." },
  { id: "t_agi", term: "AGI", aliases: ["artificial general intelligence"], category: "Frontier",
    definitions: {
      beginner: "A hypothetical future AI that can do most thinking tasks as well as a person.",
      amateur: "Artificial General Intelligence: AI matching human-level ability across most cognitive tasks. Definitions and timelines are hotly debated.",
      pro: "A loosely defined capability threshold; operationalized variously via economic value, task breadth or autonomy.",
    }, analogy: "The finish line everyone argues about, including where it even is." },
  { id: "t_alignment", term: "alignment", aliases: ["AI safety"], category: "Frontier",
    definitions: {
      beginner: "Making sure AI does what people actually want, safely.",
      amateur: "The research field focused on getting AI systems to reliably follow human intentions and values.",
      pro: "Techniques (RLHF, constitutional methods, interpretability, oversight) to keep model objectives consistent with intended behavior.",
    }, analogy: "Training a very capable new hire to share the company's values, not just follow its rules." },
];

// Terms the demo user already knows (status "learning" at start)
export const INITIAL_KNOWN = [
  "t_llm", "t_token", "t_prompt", "t_training", "t_hallucination", "t_context_window",
  "t_parameters", "t_multimodal", "t_gpu", "t_agent", "t_inference",
  "t_scaling_laws", "t_agi", "t_alignment", "t_vibe_coding", "t_wrapper", "t_embeddings",
];

export const AUTHORS: Omit<Author, "following">[] = [
  { id: "a_maya", name: "Dr. Maya Chen", handle: "@mayachen_ai", archetype: "researcher", avatarUrl: null,
    bio: "AI researcher working on reasoning and evaluation.", whyFollow: "Explains new research papers in plain threads, the day they drop.", difficulty: "pro" },
  { id: "a_arjun", name: "Arjun Rao", handle: "@arjunrao_ml", archetype: "researcher", avatarUrl: null,
    bio: "ML scientist, ex-big-lab. Posts about open models.", whyFollow: "Best signal on open-weights releases and what's actually new.", difficulty: "amateur" },
  { id: "a_leo", name: "Leo Martins", handle: "@leobuilds", archetype: "builder", avatarUrl: null,
    bio: "Indie hacker shipping AI apps in public.", whyFollow: "Shows what you can build this weekend, with real numbers.", difficulty: "beginner" },
  { id: "a_priya", name: "Priya Natarajan", handle: "@priyaships", archetype: "builder", avatarUrl: null,
    bio: "Founding engineer at an AI agents startup.", whyFollow: "Honest takes on what works (and breaks) when you put agents in production.", difficulty: "amateur" },
  { id: "a_sarah", name: "Sarah Kim", handle: "@sarahkimvc", archetype: "investor", avatarUrl: null,
    bio: "Partner at an early-stage fund. AI apps & infra.", whyFollow: "Frameworks for where value accrues in AI: models vs. apps.", difficulty: "amateur" },
  { id: "a_daniel", name: "Daniel Okafor", handle: "@dokafor", archetype: "investor", avatarUrl: null,
    bio: "Growth investor covering semis and cloud.", whyFollow: "Connects AI headlines to the money: chips, capex and margins.", difficulty: "pro" },
  { id: "a_rachel", name: "Rachel Torres", handle: "@rtorres_ops", archetype: "operator", avatarUrl: null,
    bio: "COO rolling out AI across a 2,000-person company.", whyFollow: "What AI adoption really looks like inside a normal company.", difficulty: "beginner" },
  { id: "a_ben", name: "Ben Adler", handle: "@benadler", archetype: "operator", avatarUrl: null,
    bio: "Head of Product, B2B SaaS. Writes a Substack on AI strategy.", whyFollow: "Turns AI news into 'so what should my team do Monday?'", difficulty: "beginner" },
];

const a = (id: string) => {
  const x = AUTHORS.find((au) => au.id === id)!;
  return { id: x.id, name: x.name, handle: x.handle, archetype: x.archetype, avatarUrl: x.avatarUrl };
};
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export interface SeedPost extends Post { counter: string; }

export const POSTS: SeedPost[] = [
  {
    id: "p_001", source: "x", url: "https://x.com/priyaships/status/1", author: a("a_priya"), publishedAt: hoursAgo(1),
    text: "Inference costs dropped ~10x again this year. We now run agents with RAG on every single support ticket, and it's cheaper than the old keyword bot. The bottleneck is no longer cost, it's evals.",
    tldr: {
      beginner: "Running AI (what people call inference costs) got about 10 times cheaper, so Priya's company now has AI helpers (agents) answer every customer question. The hard part now is checking the AI's work.",
      amateur: "Inference costs fell ~10x, making RAG-backed agents cheaper than legacy support bots. The new bottleneck is evals: knowing whether the agent is right.",
      pro: "A ~10x drop in inference costs flips support unit economics in favor of RAG agents at full coverage; the constraint shifts to evals and quality regression testing.",
    },
    whyItMatters: "Cheaper AI is why every company's support roadmap suddenly has 'AI agents' on it, and why 'evals' is the hot job skill.",
    terms: [{ id: "t_inference_cost", term: "inference costs" }, { id: "t_agent", term: "agents" }, { id: "t_rag", term: "RAG" }, { id: "t_evals", term: "evals" }],
    topic: "AI cost curve",
    counter: "Cheaper per-token prices don't always mean cheaper bills. Agents use many more tokens per task, and errors at scale can cost more than the savings.",
  },
  {
    id: "p_002", source: "substack", url: "https://example.substack.com/p/reasoning", author: a("a_maya"), publishedAt: hoursAgo(3),
    text: "The big shift of the last year: reasoning models trade speed for accuracy by spending test-time compute. Scaling laws didn't die, we found a second axis. Expect product teams to choose 'fast vs. smart' per request.",
    tldr: {
      beginner: "New AI 'thinks before it answers' (reasoning models). Instead of only making AI smarter by training it longer, companies now let it think longer when answering, which is slower but more accurate.",
      amateur: "Reasoning models use extra test-time compute to improve accuracy. That's a new way to scale besides bigger training runs, so products will pick fast or smart per task.",
      pro: "Test-time compute opens a second scaling axis beyond pre-training; product design becomes a latency/cost/accuracy routing problem per request.",
    },
    whyItMatters: "Explains why AI products now offer 'thinking' modes, and why some answers take 30 seconds and cost more.",
    terms: [{ id: "t_reasoning_model", term: "reasoning models" }, { id: "t_test_time_compute", term: "test-time compute" }, { id: "t_scaling_laws", term: "scaling laws" }],
    topic: "Reasoning models",
    counter: "Some researchers argue longer thinking gives diminishing returns on many everyday tasks, and the added latency hurts user experience.",
  },
  {
    id: "p_003", source: "linkedin", url: "https://www.linkedin.com/posts/rtorres", author: a("a_rachel"), publishedAt: hoursAgo(5),
    text: "6 months into rolling out AI to 2,000 employees. Biggest lesson: the model matters less than you think. Connecting it to our tools via MCP and teaching people to write a good prompt drove 80% of the value. Hallucination fears dropped once answers came with citations.",
    tldr: {
      beginner: "A COO says the specific AI matters less than plugging it into the apps people already use (MCP) and teaching staff to ask good questions (prompts). People trusted it more once it showed its sources.",
      amateur: "Enterprise AI value came mostly from integrations (MCP) and prompt training, not model choice. Citations reduced hallucination concerns.",
      pro: "Adoption ROI is dominated by tool integration (MCP) and enablement rather than model selection; grounded, cited outputs addressed hallucination-driven trust gaps.",
    },
    whyItMatters: "If your company is 'rolling out AI', this is the playbook leaders are copying, and MCP is the term you'll hear in those meetings.",
    terms: [{ id: "t_mcp", term: "MCP" }, { id: "t_prompt", term: "prompt" }, { id: "t_hallucination", term: "hallucination" }],
    topic: "Enterprise AI rollout",
    counter: "Model choice can still matter a lot for specialized work like legal, code or analysis. 'Model doesn't matter' may only hold for general productivity use.",
  },
  {
    id: "p_004", source: "x", url: "https://x.com/arjunrao_ml/status/4", author: a("a_arjun"), publishedAt: hoursAgo(7),
    text: "New open-weights model just matched last year's frontier on most benchmarks, at a fraction of the parameters. Fine-tuning it on your own data is now a weekend project. The gap between open and closed is ~6 months.",
    tldr: {
      beginner: "A free-to-download AI (open-weights) is now about as good as the best paid AI from a year ago, and it's smaller. Companies can customize it with their own data (fine-tuning) quickly.",
      amateur: "An open-weights model hit last year's frontier benchmarks with fewer parameters. Fine-tuning is now cheap, and open models trail closed ones by ~6 months.",
      pro: "Open-weights parity with prior-year frontier at lower param counts compresses the open/closed gap to ~6 months, making domain fine-tuning and self-hosting viable defaults.",
    },
    whyItMatters: "Free models catching up puts pressure on AI companies' pricing, and gives your company more options than 'just use ChatGPT'.",
    terms: [{ id: "t_open_weights", term: "open-weights" }, { id: "t_evals", term: "benchmarks" }, { id: "t_parameters", term: "parameters" }, { id: "t_fine_tuning", term: "Fine-tuning" }],
    topic: "Open vs closed models",
    counter: "Benchmarks can be gamed or leaked into training data. Real-world quality gaps between open and closed models are often bigger than leaderboards suggest.",
  },
  {
    id: "p_005", source: "substack", url: "https://example.substack.com/p/capex", author: a("a_daniel"), publishedAt: hoursAgo(9),
    text: "Big tech AI capex is now running at hundreds of billions a year, mostly GPUs and data centers. The bull case: inference demand from agents fills it. The bear case: depreciation hits before revenue does.",
    tldr: {
      beginner: "Big tech companies are spending enormous sums on AI chips (GPUs) and buildings full of computers (capex). The bet is that AI use explodes. The worry is that the bill comes before the money does.",
      amateur: "AI capex is in the hundreds of billions annually, mostly GPUs. Bulls expect agent-driven inference demand to justify it, and bears worry about depreciation outpacing revenue.",
      pro: "Hyperscaler capex at $100Bs/yr hinges on inference demand (agents) absorbing capacity before accelerator depreciation compresses returns.",
    },
    whyItMatters: "This is the 'is AI a bubble?' debate in one post, and it's why chip stocks move on every earnings call.",
    terms: [{ id: "t_capex", term: "capex" }, { id: "t_gpu", term: "GPUs" }, { id: "t_inference", term: "inference" }, { id: "t_agent", term: "agents" }],
    topic: "AI infrastructure spend",
    counter: "Past infrastructure booms (railroads, fiber) overbuilt but still created huge value. 'Bubble' and 'transformative' can both be true.",
  },
  {
    id: "p_006", source: "x", url: "https://x.com/leobuilds/status/6", author: a("a_leo"), publishedAt: hoursAgo(11),
    text: "Shipped a full invoicing app this weekend by vibe coding. Zero lines typed by hand. Hit $400 MRR. People who say it's 'just a wrapper' are missing that distribution is the moat.",
    tldr: {
      beginner: "Leo built a working app in a weekend just by describing it to AI in plain English (vibe coding), and it's already earning money. He argues that reaching customers matters more than having unique tech.",
      amateur: "Weekend vibe-coded app reached $400 MRR. Leo's point: even if it's a 'wrapper' on someone's model, distribution can be the moat.",
      pro: "Vibe coding collapses build cost to near-zero; when the model layer is commoditized, defensibility shifts to distribution rather than proprietary tech.",
    },
    whyItMatters: "Non-engineers can now build real software. That's exactly why AI literacy is becoming a career skill, not a nice-to-have.",
    terms: [{ id: "t_vibe_coding", term: "vibe coding" }, { id: "t_wrapper", term: "wrapper" }, { id: "t_moat", term: "moat" }],
    topic: "Vibe coding",
    counter: "Vibe-coded apps can hide security bugs and become hard to maintain. Fast to build doesn't mean safe to scale.",
  },
  {
    id: "p_007", source: "linkedin", url: "https://www.linkedin.com/posts/sarahkimvc", author: a("a_sarah"), publishedAt: hoursAgo(14),
    text: "Every AI pitch I hear claims a moat. The real ones in 2026: proprietary data loops, deep workflow integration, and evals nobody else has. 'We use the best LLM' is not a moat. Everyone can call the same API.",
    tldr: {
      beginner: "An investor says most AI startups aren't as protected from competitors as they claim. Using a great AI model isn't special, since anyone can. What's special is unique data and being built into how people work.",
      amateur: "Real AI moats: proprietary data flywheels, workflow lock-in and in-house evals. Model access isn't a moat because every competitor can use the same LLM.",
      pro: "Defensibility in AI apps comes from data network effects, workflow embedding and proprietary eval suites; model access is commoditized.",
    },
    whyItMatters: "If you're evaluating AI startups, as an investor, job seeker or buyer, this is the checklist VCs are using right now.",
    terms: [{ id: "t_moat", term: "moat" }, { id: "t_evals", term: "evals" }, { id: "t_llm", term: "LLM" }],
    topic: "AI startup moats",
    counter: "Some argue speed of execution and brand are the real moats early on, and data advantages are often overstated.",
  },
  {
    id: "p_008", source: "substack", url: "https://example.substack.com/p/rag-vs-context", author: a("a_ben"), publishedAt: hoursAgo(20),
    text: "With million-token context windows, do you still need RAG? For most teams, yes: embeddings-based retrieval is cheaper, faster, and easier to keep fresh than stuffing every document into the prompt.",
    tldr: {
      beginner: "AI can now read huge amounts at once (big context window), but it's usually still smarter and cheaper to have it look up just the right pages (RAG) instead of reading everything every time.",
      amateur: "Even with huge context windows, RAG with embeddings stays cheaper, faster and easier to update than putting everything into the prompt.",
      pro: "Long context doesn't obsolete retrieval: RAG wins on cost, latency, freshness and recall reliability versus full-context stuffing.",
    },
    whyItMatters: "If your team is building an internal AI assistant, this is the first architecture decision you'll face.",
    terms: [{ id: "t_context_window", term: "context windows" }, { id: "t_rag", term: "RAG" }, { id: "t_embeddings", term: "embeddings" }, { id: "t_prompt", term: "prompt" }],
    topic: "RAG vs long context",
    counter: "As long-context costs fall, simply including everything may become the simpler, good-enough default for small document sets.",
  },
  {
    id: "p_009", source: "x", url: "https://x.com/mayachen_ai/status/9", author: a("a_maya"), publishedAt: hoursAgo(26),
    text: "Hot take: AGI timelines debates are mostly definitional. What matters for alignment is whether agents can act autonomously for hours. That's the eval I'd watch.",
    tldr: {
      beginner: "A researcher says people argue about 'human-level AI' (AGI) mostly because they define it differently. The more useful question is how long AI can work on its own safely.",
      amateur: "AGI debates are largely about definitions. For safety (alignment), the key eval is how long agents can operate autonomously.",
      pro: "AGI timelines are definitional; autonomous task horizon for agents is a more decision-relevant metric for alignment and risk.",
    },
    whyItMatters: "'When AGI?' is the most-asked question at dinner parties. This gives you a smarter way to answer it.",
    terms: [{ id: "t_agi", term: "AGI" }, { id: "t_alignment", term: "alignment" }, { id: "t_agent", term: "agents" }, { id: "t_evals", term: "eval" }],
    topic: "AGI debate",
    counter: "Others argue definitions matter a lot for policy and regulation, so the debate isn't just semantics.",
  },
  {
    id: "p_010", source: "linkedin", url: "https://www.linkedin.com/posts/benadler", author: a("a_ben"), publishedAt: hoursAgo(30),
    text: "Told my PMs: you don't need to code, but you do need to know what tokens, context window, and hallucination mean. Otherwise you can't scope an AI feature or push back on engineering estimates.",
    tldr: {
      beginner: "A product leader says non-engineers don't need to code, but they do need basic AI words (like tokens and context window) to plan AI features and have real conversations with engineers.",
      amateur: "PMs need working fluency in tokens, context windows and hallucination to scope AI features and challenge engineering estimates.",
      pro: "Baseline AI literacy (token economics, context limits, failure modes) is now a PM requirement for scoping and estimation.",
    },
    whyItMatters: "This is literally why Decoded exists: AI vocabulary is becoming a job requirement for non-technical roles.",
    terms: [{ id: "t_token", term: "tokens" }, { id: "t_context_window", term: "context window" }, { id: "t_hallucination", term: "hallucination" }],
    topic: "AI literacy for PMs",
    counter: "Some argue PMs should go further and prototype with AI tools themselves, since vocabulary alone isn't enough.",
  },
];

// Pre-decoded posts returned by the mock decoder for sample links (stage insurance)
export const DEMO_DECODES: Record<string, Omit<SeedPost, "id" | "publishedAt">> = {
  x: {
    source: "x", url: "https://x.com/leobuilds/status/1999", author: a("a_leo"),
    text: "Everyone's building agents but nobody's building evals. If you can't measure it, your agent is a demo, not a product. Also: MCP servers are the new APIs.",
    tldr: {
      beginner: "Lots of people are building AI helpers that take actions (agents), but few are testing whether they actually work (evals). Leo also says MCP, a standard plug for connecting AI to apps, is becoming as important as how apps connect today.",
      amateur: "Agents without evals are demos, not products. MCP servers are becoming the standard integration layer, the way APIs were.",
      pro: "Agent reliability is unmeasured without evals; MCP is emerging as the de facto integration surface, analogous to REST APIs for the agent era.",
    },
    whyItMatters: "You'll hear 'agents', 'evals' and 'MCP' in nearly every AI product meeting this quarter. This one post covers all three.",
    terms: [{ id: "t_agent", term: "agents" }, { id: "t_evals", term: "evals" }, { id: "t_mcp", term: "MCP" }],
    topic: "Agents need evals",
    counter: "Some builders argue shipping fast and learning from real users beats building evals upfront.",
  },
  substack: {
    source: "substack", url: "https://example.substack.com/p/token-prices", author: a("a_ben"),
    text: "Token prices for frontier models fell again. For most companies, the AI budget conversation is shifting from 'can we afford it' to 'which tasks deserve the expensive reasoning models'.",
    tldr: {
      beginner: "Using top AI keeps getting cheaper. Companies are no longer asking 'can we afford AI?' but 'which jobs deserve the smartest, slower AI?'",
      amateur: "Falling token prices move the budget question from affordability to routing: which tasks justify pricier reasoning models.",
      pro: "Price declines shift AI spend decisions to model routing: reserving reasoning models for tasks where accuracy gains justify cost and latency.",
    },
    whyItMatters: "AI budgets are being set right now, and 'model routing' is how finance and product teams will talk about it.",
    terms: [{ id: "t_inference_cost", term: "Token prices" }, { id: "t_reasoning_model", term: "reasoning models" }],
    topic: "AI budgets",
    counter: "Total AI spend may still rise even as unit prices fall, because usage grows faster than prices drop.",
  },
};

export const PATH: Omit<PathUnit, "status" | "progress" | "days">[] = [
  { id: "u1", title: "Foundations", emoji: "🧱" },
  { id: "u2", title: "Models", emoji: "🧠" },
  { id: "u3", title: "Building", emoji: "🛠️" },
  { id: "u4", title: "Business of AI", emoji: "💰" },
  { id: "u5", title: "Frontier", emoji: "🚀" },
];

export const PLACEMENT: (PlacementQuestion & { answer: number })[] = [
  { id: "q1", question: "What is ChatGPT an example of?", options: ["A search engine", "A large language model (LLM) app", "A database", "A social network"], answer: 1 },
  { id: "q2", question: "When an AI 'hallucinates', it…", options: ["Crashes", "Refuses to answer", "Confidently says something false", "Gets slower"], answer: 2 },
  { id: "q3", question: "What does a 'context window' limit?", options: ["How much text the AI can consider at once", "How many users can chat", "The screen size", "How long training takes"], answer: 0 },
  { id: "q4", question: "RAG mainly helps an AI…", options: ["Generate images", "Run on phones", "Look up relevant information before answering", "Train faster"], answer: 2 },
  { id: "q5", question: "'Test-time compute' refers to…", options: ["Compute used during pre-training", "Extra compute spent while answering to improve accuracy", "GPU benchmarks", "Unit-testing AI code"], answer: 1 },
];

// ---------- Personalization seed ----------

// Unit order after Foundations, per lens
export const LENS_PATH: Record<Archetype, string[]> = {
  researcher: ["Foundations", "Models", "Frontier", "Building", "Business of AI"],
  builder: ["Foundations", "Building", "Models", "Business of AI", "Frontier"],
  investor: ["Foundations", "Business of AI", "Models", "Building", "Frontier"],
  operator: ["Foundations", "Building", "Business of AI", "Models", "Frontier"],
};

// Terms coined or newly hot this week, used for the Pro "New this week" drill
export const FRESH_TERMS = ["t_test_time_compute", "t_mcp", "t_vibe_coding", "t_reasoning_model", "t_capex"];

// Starting vocabulary per self-reported level
export const KNOWN_BY_LEVEL: Record<"beginner" | "amateur" | "pro", string[]> = {
  beginner: ["t_llm", "t_prompt"],
  amateur: INITIAL_KNOWN,
  pro: TERMS.map((t) => t.id).filter((id) => !FRESH_TERMS.includes(id) && id !== "t_wrapper"),
};

export const LENS_LABEL: Record<Archetype, { label: string; noun: string; emoji: string }> = {
  researcher: { label: "Research", noun: "researchers", emoji: "🔬" },
  builder: { label: "Building", noun: "builders", emoji: "🛠️" },
  investor: { label: "Investing", noun: "investors", emoji: "💰" },
  operator: { label: "Operating", noun: "operators", emoji: "⚙️" },
};

// "Why it matters" written for each lens
export const WHY_BY_LENS: Record<string, Record<Archetype, string>> = {
  p_001: {
    researcher: "Cost curves this steep shift the open question from 'can we afford it' to 'how do we measure it'. Evals research just became the bottleneck.",
    builder: "At these prices you can put an agent on every request. Your real job now is building the eval suite that tells you it's right.",
    investor: "Falling unit costs expand the market for agent products and squeeze pure-API resellers. Back teams with proprietary evals.",
    operator: "AI support on 100% of tickets is now cheaper than your old bot. Budget for quality checks, not just the license.",
  },
  p_002: {
    researcher: "Test-time compute is a second scaling axis. Expect papers on when longer thinking stops paying off.",
    builder: "Route requests: a fast model for simple tasks, a reasoning model for hard ones. Latency and cost now depend on that choice.",
    investor: "More compute per answer means more inference demand. It's bullish for chips and a margin question for model providers.",
    operator: "Some AI answers will take 30 seconds and cost more. Decide which workflows deserve the 'smart' mode.",
  },
  p_003: {
    researcher: "A real-world signal that integration and grounding matter more for adoption than benchmark gains.",
    builder: "Shipping MCP connectors to the tools people already use is where the value is. The model is swappable.",
    investor: "Value in enterprise AI is accruing to the integration layer. Watch companies that own the connectors.",
    operator: "This is the playbook: connect AI to your existing tools, train people on prompting, require citations.",
  },
  p_004: {
    researcher: "Open models trailing closed ones by about 6 months changes what's reproducible in academia.",
    builder: "You can now fine-tune a strong open model on your own data in a weekend and host it yourself.",
    investor: "Open-weights parity pressures closed-model pricing. Moats must come from somewhere other than the model.",
    operator: "You have more options than one vendor. Self-hosted open models can solve data-privacy blockers.",
  },
  p_005: {
    researcher: "Compute budgets set the ceiling on what frontier labs can train next year.",
    builder: "More data centers mean cheaper, more available GPUs for builders over the next 18 months.",
    investor: "This is the bubble debate. Model depreciation schedules against inference revenue growth.",
    operator: "Your AI vendors' prices depend on this spending. Expect falling costs if the capacity gets built.",
  },
  p_006: {
    researcher: "Vibe coding is a live experiment in how far natural language can replace programming.",
    builder: "Prototype in a weekend, but plan for code review and security before you scale.",
    investor: "Build costs are collapsing, so distribution becomes the scarce asset. Underwrite go-to-market, not tech.",
    operator: "Your non-engineers can now build internal tools. Set guardrails before shadow apps multiply.",
  },
  p_007: {
    researcher: "Proprietary evals are becoming a commercial asset, not just a research tool.",
    builder: "If your pitch is 'we use the best model', you don't have a moat. Own the workflow or the data.",
    investor: "Use this as your diligence checklist: data loops, workflow lock-in, proprietary evals.",
    operator: "When buying AI tools, prefer vendors embedded in your workflow over thin wrappers.",
  },
  p_008: {
    researcher: "Long context hasn't solved recall reliability. Retrieval is still the more dependable design.",
    builder: "Start with RAG plus embeddings for your internal assistant. It's cheaper and easier to keep fresh.",
    investor: "Vector DB and retrieval infrastructure stays relevant even as context windows grow.",
    operator: "For a company knowledge assistant, ask vendors how they do retrieval, not just which model they use.",
  },
  p_009: {
    researcher: "Autonomous task horizon is a cleaner, measurable proxy than 'AGI'. Watch for evals built on it.",
    builder: "Agents that run for hours need checkpoints, logs and human review built in.",
    investor: "Agent autonomy length is the metric that unlocks labor-replacement revenue. Track it.",
    operator: "Ask how long an AI agent can work unsupervised before trusting it with a process.",
  },
  p_010: {
    researcher: "AI literacy is spreading to non-technical roles, which changes who evaluates research claims.",
    builder: "Your PMs will start asking about tokens and context limits. Good: scoping gets better.",
    investor: "Teams with AI-fluent PMs ship AI features faster. It's a signal in diligence.",
    operator: "Make basic AI vocabulary part of onboarding for product and ops roles.",
  },
};

// ---------- Curriculum: chapters made of days ----------
export interface CurriculumDay { title: string; termIds: string[] }
export const CURRICULUM: Record<string, CurriculumDay[]> = {
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
