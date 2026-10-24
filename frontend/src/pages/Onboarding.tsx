import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Check, Flame, Newspaper, Sparkles, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { Mascot, MascotSays } from "../components/Mascot";
import { LoadingSteps, ProgressBar } from "../components/ui";
import { LENSES, lensMeta, levelMeta, useApp } from "../context";
import type { HomeTab, Lens, Level } from "../types";

const LEVEL_OPTIONS: { id: Level; emoji: string; title: string; sub: string; soundsLike: string }[] = [
  { id: "beginner", emoji: "🌱", title: "I don't know anything yet", sub: "Start from zero. No jargon, ever.", soundsLike: "\u201cWait, what's an LLM?\u201d" },
  { id: "amateur", emoji: "🌿", title: "I know a little, but most terms lose me", sub: "Fill the gaps while you read real posts.", soundsLike: "\u201cI use ChatGPT, but RAG? Agents?\u201d" },
  { id: "pro", emoji: "🌳", title: "I know my AI language", sub: "Keep up with what's new, fast.", soundsLike: "\u201cIs test-time compute the new scaling law?\u201d" },
];

const LENS_TOPICS: Record<Lens, string[]> = {
  researcher: ["reasoning models", "evals", "scaling"],
  builder: ["agents", "MCP", "RAG"],
  investor: ["capex", "moats", "inference costs"],
  operator: ["rollouts", "prompting", "ROI"],
};

const FLOATING_TERMS = ["LLM", "RAG", "agents", "tokens", "MCP", "evals", "fine-tuning", "inference", "AGI", "embeddings"];

const FIRST_UNIT: Record<Lens, string> = {
  researcher: "Models", builder: "Building", investor: "Business of AI", operator: "Building",
};

export function planFor(level: Level, lens: Lens) {
  const lm = lensMeta(lens);
  if (level === "beginner")
    return {
      headline: "Course first",
      sub: "We'll build your vocabulary step by step, then open up the feed as you go.",
      home: "learn" as HomeTab,
      cta: "Start my first lesson",
      rows: [
        { Icon: BookOpen, title: "A 5-minute lesson every day", sub: `Foundations first, then ${FIRST_UNIT[lens]} for ${lm.noun}` },
        { Icon: Newspaper, title: "A starter feed of 3 posts", sub: "More posts unlock each time you finish a lesson" },
        { Icon: Flame, title: "Streak goal: 1 lesson a day", sub: "Small and doable. That's the point." },
      ],
    };
  if (level === "amateur")
    return {
      headline: "Learn + read",
      sub: "A short lesson and a few real posts each day. The words you tap become tomorrow's lesson.",
      home: "today" as HomeTab,
      cta: "See my day",
      rows: [
        { Icon: Sun, title: "Today: 1 lesson + 3 posts", sub: `Posts picked for ${lm.noun}, explained at your level` },
        { Icon: Sparkles, title: "Your feed becomes your course", sub: "Tap any word you don't know to learn it tomorrow" },
        { Icon: Flame, title: "Streak goal: a lesson or 3 posts", sub: "Either one keeps the flame alive" },
      ],
    };
  return {
    headline: "Feed first",
    sub: "Your Pulse is home. The original post, the counter-argument, and only the words that are new.",
    home: "pulse" as HomeTab,
    cta: "Open my Pulse",
    rows: [
      { Icon: Newspaper, title: `Pulse, ${lm.noun} first`, sub: "Originals up top, with the debate on every post" },
      { Icon: Sparkles, title: "New this week: a 2-minute drill", sub: "Only terms coined or trending in the last 7 days" },
      { Icon: Flame, title: "Streak goal: 5 posts + 1 deep dive", sub: "Stay current, not just busy" },
    ],
  };
}

type Step = "welcome" | "name" | "level" | "lens" | "building" | "plan";

export function Welcome() {
  const nav = useNavigate();
  const { setUser } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [level, setLevel] = useState<Level | null>(null);
  const [lens, setLens] = useState<Lens | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const stepIdx = { welcome: 0, name: 1, level: 2, lens: 3, building: 3, plan: 3 }[step];
  const back = () => setStep(step === "plan" || step === "building" ? "lens" : step === "lens" ? "level" : step === "level" ? "name" : "welcome");

  const finish = async () => {
    const chosen = name.trim();
    if (!level || !lens || !chosen) return;
    setSaving(true);
    const r = await api.onboard(level, lens, chosen);
    setUser(r.user);
    nav(`/${r.user.homeTab}`, { replace: true });
  };

  const pickLevel = (l: Level) => { setLevel(l); setTimeout(() => setStep("lens"), 280); };
  const pickLens = (l: Lens) => {
    setLens(l);
    setTimeout(() => setStep("building"), 280);
    setTimeout(() => setStep((s) => (s === "building" ? "plan" : s)), 280 + 3300);
  };

  return (
    <div className="flex h-full flex-col">
      {step !== "welcome" && step !== "building" && (
        <div className="flex items-center gap-3 px-5 pt-5">
          <button onClick={back} className="text-stone-400 active:scale-90" aria-label="Back"><ArrowLeft size={24} strokeWidth={2.5} /></button>
          <ProgressBar value={stepIdx / 3} className="h-3" color="bg-brand-500" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
            className="flex min-h-full flex-col px-5 pt-6 pb-6"
          >
            {step === "welcome" && (
              <>
                <div className="relative mx-auto mt-2 h-[300px] w-full max-w-[340px]">
                  {FLOATING_TERMS.map((t, i) => {
                    const angle = (i / FLOATING_TERMS.length) * Math.PI * 2;
                    const x = Math.cos(angle) * 130, y = Math.sin(angle) * 115;
                    return (
                      <motion.span
                        key={t}
                        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                        animate={{ opacity: 1, scale: 1, x, y: [y, y - 6, y] }}
                        transition={{ delay: 0.2 + i * 0.06, y: { repeat: Infinity, duration: 2.5 + (i % 3) * 0.5, ease: "easeInOut" } }}
                        className={`absolute left-1/2 top-1/2 -ml-8 -mt-4 whitespace-nowrap rounded-full border-2 px-3 py-1 text-xs font-extrabold ${i % 3 === 0 ? "border-brand-200 bg-brand-50 text-brand-700" : i % 3 === 1 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-sky-200 bg-sky-50 text-sky-800"}`}
                      >
                        {t}
                      </motion.span>
                    );
                  })}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Mascot mood="wave" size={120} />
                  </div>
                </div>
                <h1 className="mt-2 text-center text-5xl font-black tracking-tight">Decoded</h1>
                <p className="mx-auto mt-2 max-w-[310px] text-center text-lg font-bold text-stone-500">
                  Hi, I'm Byte! All this AI jargon? We'll sniff it out together, 5 minutes a day, from what people are actually saying.
                </p>
                <div className="flex-1" />
                <button onClick={() => setStep("name")} className="btn-primary mt-6 w-full">Get started</button>
                <p className="mt-3 text-center text-xs font-bold text-stone-400">Takes 30 seconds · No account needed</p>
              </>
            )}

            {step === "name" && (
              <form
                className="flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) setStep("level");
                }}
              >
                <MascotSays mood="wave">What should I call you?</MascotSays>
                <h1 className="mt-4 text-2xl font-black leading-tight">What's your name?</h1>
                <p className="mt-1 text-sm font-semibold text-stone-500">This is how Byte greets you. No account, just a name.</p>
                <input
                  autoFocus
                  value={name}
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="mt-6 w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-4 text-lg font-extrabold outline-none focus:border-brand-500"
                />
                <div className="flex-1" />
                <button type="submit" disabled={!name.trim()} className="btn-primary mt-6 w-full disabled:opacity-40">Continue</button>
              </form>
            )}

            {step === "level" && (
              <>
                <MascotSays mood="point">Woof! How much AI do you speak? Be honest, I'll adjust as I get to know you.</MascotSays>
                <h1 className="mt-4 text-2xl font-black leading-tight">How fluent are you in AI?</h1>
                <div className="mt-6 space-y-3">
                  {LEVEL_OPTIONS.map((o, i) => (
                    <motion.button
                      key={o.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => pickLevel(o.id)}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left active:translate-y-[2px] ${level === o.id ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white"}`}
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-stone-100 text-3xl">{o.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block font-extrabold leading-snug ${level === o.id ? "text-brand-700" : ""}`}>{o.title}</span>
                        <span className="mt-0.5 block text-sm font-semibold text-stone-500">{o.sub}</span>
                        <span className="mt-1.5 inline-block rounded-lg bg-stone-100 px-2 py-0.5 text-xs font-bold italic text-stone-500">{o.soundsLike}</span>
                      </span>
                      {level === o.id && <Check className="text-brand-600" strokeWidth={3} />}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {step === "lens" && (
              <>
                <MascotSays mood="think">
                  {level === "beginner" ? "Great, we'll start from zero together. " : level === "pro" ? "Nice, a fluent one. " : "Perfect, we'll fill the gaps. "}
                  Which world are you in?
                </MascotSays>
                <h1 className="mt-4 text-2xl font-black leading-tight">What's your lens on AI?</h1>
                <p className="mt-1 text-sm font-semibold text-stone-500">It shapes your feed, your path and how I explain things.</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {LENSES.map((l, i) => (
                    <motion.button
                      key={l.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => pickLens(l.id)}
                      className={`flex flex-col rounded-2xl border-2 border-b-4 p-4 text-left active:translate-y-[2px] ${lens === l.id ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white"}`}
                    >
                      <span className="text-3xl">{l.emoji}</span>
                      <span className={`mt-2 font-extrabold ${lens === l.id ? "text-brand-700" : ""}`}>{l.label}</span>
                      <span className="mt-0.5 text-xs font-semibold leading-snug text-stone-500">{l.blurb}</span>
                      <span className="mt-2 flex flex-wrap gap-1">
                        {LENS_TOPICS[l.id].map((t) => (
                          <span key={t} className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-extrabold text-stone-500">{t}</span>
                        ))}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {step === "building" && level && lens && (
              <div className="flex flex-1 flex-col items-center justify-center pt-16 text-center">
                <Mascot mood="think" size={120} />
                <h1 className="mt-6 text-2xl font-black">Byte is building your plan…</h1>
                <div className="mt-6 w-full max-w-[280px] text-left">
                  <LoadingSteps
                    steps={[
                      `Picking your first ${level === "pro" ? "fresh" : ""} words`.replace("  ", " "),
                      `Finding posts for ${lensMeta(lens).noun}`,
                      "Setting your daily goal",
                    ]}
                    done={false}
                  />
                </div>
              </div>
            )}

            {step === "plan" && level && lens && <PlanStep level={level} lens={lens} name={name.trim()} saving={saving} onGo={finish} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PlanStep({ level, lens, name, saving, onGo }: { level: Level; lens: Lens; name: string; saving: boolean; onGo: () => void }) {
  const plan = planFor(level, lens);
  const lm = levelMeta(level);
  const le = lensMeta(lens);
  // Same tabs for everyone; the highlighted one is where this level spends most time
  const focus = level === "beginner" ? "learn" : level === "pro" ? "pulse" : "today";
  const tabs = [{ id: "today", label: "Today" }, { id: "learn", label: level === "pro" ? "Catch up" : "Learn" }, { id: "pulse", label: "Pulse" }, { id: "people", label: "People" }];
  return (
    <>
      <MascotSays mood="cheer">Tail-waggingly good, {name}! Your plan is ready.</MascotSays>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="chip bg-brand-100 text-brand-700">{lm.emoji} {lm.label}</span>
        <span className="chip bg-stone-200 text-stone-700">{le.emoji} {le.label}</span>
      </div>
      <h1 className="mt-2 text-3xl font-black leading-tight">{plan.headline}</h1>
      <p className="mt-1 font-semibold text-stone-500">{plan.sub}</p>

      <div className="mt-5 space-y-3">
        {plan.rows.map(({ Icon, title, sub }, i) => (
          <motion.div key={title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.12 }} className="card flex items-center gap-3 p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600"><Icon size={22} /></div>
            <div className="min-w-0">
              <div className="font-extrabold leading-snug">{title}</div>
              <div className="text-sm font-semibold text-stone-500">{sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Where you'll spend most time</div>
        <div className="mt-2 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1.5 shadow-card">
          {tabs.map((t, i) => (
            <div key={t.id} className={`rounded-xl py-2 text-center text-xs font-extrabold ${t.id === focus ? "bg-brand-600 text-white" : "text-stone-400"}`}>{t.label}</div>
          ))}
        </div>
      </div>

      <div className="flex-1" />
      <button onClick={onGo} disabled={saving} className="btn-primary mt-6 w-full">{saving ? "Setting up…" : plan.cta}</button>
    </>
  );
}
