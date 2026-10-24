export const TERMS = [
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

export const INITIAL_KNOWN = [
  "t_llm", "t_token", "t_prompt", "t_training", "t_hallucination", "t_context_window",
  "t_parameters", "t_multimodal", "t_gpu", "t_agent", "t_inference",
  "t_scaling_laws", "t_agi", "t_alignment", "t_vibe_coding", "t_wrapper", "t_embeddings",
];

export const AUTHORS = [
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

export const PATH = [
  { id: "u1", title: "Foundations", emoji: "🧱" },
  { id: "u2", title: "Models", emoji: "🧠" },
  { id: "u3", title: "Building", emoji: "🛠️" },
  { id: "u4", title: "Business of AI", emoji: "💰" },
  { id: "u5", title: "Frontier", emoji: "🚀" },
];

export const PLACEMENT = [
  { id: "q1", question: "What is ChatGPT an example of?", options: ["A search engine", "A large language model (LLM) app", "A database", "A social network"], answer: 1 },
  { id: "q2", question: "When an AI 'hallucinates', it…", options: ["Crashes", "Refuses to answer", "Confidently says something false", "Gets slower"], answer: 2 },
  { id: "q3", question: "What does a 'context window' limit?", options: ["How much text the AI can consider at once", "How many users can chat", "The screen size", "How long training takes"], answer: 0 },
  { id: "q4", question: "RAG mainly helps an AI…", options: ["Generate images", "Run on phones", "Look up relevant information before answering", "Train faster"], answer: 2 },
  { id: "q5", question: "'Test-time compute' refers to…", options: ["Compute used during pre-training", "Extra compute spent while answering to improve accuracy", "GPU benchmarks", "Unit-testing AI code"], answer: 1 },
];
