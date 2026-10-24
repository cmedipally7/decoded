import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, Check, Flame, Newspaper, Sparkles, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ProgressBar } from "../components/ui";
import { LENSES, lensMeta, levelMeta, useApp } from "../context";
import type { HomeTab, Lens, Level } from "../types";

const LEVEL_OPTIONS: { id: Level; emoji: string; title: string; sub: string }[] = [
  { id: "beginner", emoji: "🌱", title: "I don't know anything yet", sub: "Start from zero. No jargon, ever." },
  { id: "amateur", emoji: "🌿", title: "I know a little, but most terms lose me", sub: "Fill the gaps while you read real posts." },
  { id: "pro", emoji: "🌳", title: "I know my AI language", sub: "Keep up with what's new, fast." },
];

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

type Step = "welcome" | "level" | "lens" | "plan";

export function Welcome() {
  const nav = useNavigate();
  const { setUser } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [level, setLevel] = useState<Level | null>(null);
  const [lens, setLens] = useState<Lens | null>(null);
  const [saving, setSaving] = useState(false);

  const stepIdx = { welcome: 0, level: 1, lens: 2, plan: 3 }[step];
  const back = () => setStep(step === "plan" ? "lens" : step === "lens" ? "level" : "welcome");

  const finish = async () => {
    if (!level || !lens) return;
    setSaving(true);
    const r = await api.onboard(level, lens);
    setUser(r.user);
    nav(`/${r.user.homeTab}`, { replace: true });
  };

  const pickLevel = (l: Level) => { setLevel(l); setTimeout(() => setStep("lens"), 280); };
  const pickLens = (l: Lens) => { setLens(l); setTimeout(() => setStep("plan"), 280); };

  return (
    <div className="flex h-full flex-col">
      {step !== "welcome" && (
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
                <div className="flex-1" />
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-24 w-24 place-items-center rounded-[1.75rem] bg-brand-600 text-5xl shadow-lg shadow-brand-600/40">
                  🔓
                </motion.div>
                <h1 className="mt-6 text-center text-5xl font-black tracking-tight">Decoded</h1>
                <p className="mx-auto mt-3 max-w-[300px] text-center text-lg font-bold text-stone-500">
                  Learn AI the way you learned your first language: a little every day, from what people are actually saying.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-2 text-center">
                  {[["📚", "5-min lessons"], ["📰", "Real posts, decoded"], ["🔥", "Streaks that stick"]].map(([e, t]) => (
                    <div key={t} className="rounded-2xl bg-white p-3 shadow-card">
                      <div className="text-2xl">{e}</div>
                      <div className="mt-1 text-xs font-extrabold leading-tight text-stone-600">{t}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-1" />
                <button onClick={() => setStep("level")} className="btn-primary mt-8 w-full">Get started</button>
              </>
            )}

            {step === "level" && (
              <>
                <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Step 1 of 2</p>
                <h1 className="mt-1 text-3xl font-black leading-tight">How fluent are you in AI?</h1>
                <p className="mt-1 font-semibold text-stone-500">Be honest. We'll adjust as we learn how you read.</p>
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
                      </span>
                      {level === o.id && <Check className="text-brand-600" strokeWidth={3} />}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {step === "lens" && (
              <>
                <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Step 2 of 2</p>
                <h1 className="mt-1 text-3xl font-black leading-tight">What's your lens on AI?</h1>
                <p className="mt-1 font-semibold text-stone-500">Pick the one closest to your work. It shapes your feed, your path and how we explain things.</p>
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
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {step === "plan" && level && lens && <PlanStep level={level} lens={lens} saving={saving} onGo={finish} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PlanStep({ level, lens, saving, onGo }: { level: Level; lens: Lens; saving: boolean; onGo: () => void }) {
  const plan = planFor(level, lens);
  const lm = levelMeta(level);
  const le = lensMeta(lens);
  const tabs: { id: HomeTab | "people" | "me"; label: string }[] =
    level === "beginner"
      ? [{ id: "learn", label: "Learn" }, { id: "pulse", label: "Pulse" }, { id: "people", label: "People" }, { id: "me", label: "Me" }]
      : level === "amateur"
      ? [{ id: "today", label: "Today" }, { id: "learn", label: "Learn" }, { id: "pulse", label: "Pulse" }, { id: "me", label: "Me" }]
      : [{ id: "pulse", label: "Pulse" }, { id: "learn", label: "New" }, { id: "people", label: "People" }, { id: "me", label: "Me" }];
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <span className="chip bg-brand-100 text-brand-700">{lm.emoji} {lm.label}</span>
        <span className="chip bg-stone-200 text-stone-700">{le.emoji} {le.label}</span>
      </div>
      <h1 className="mt-3 text-3xl font-black leading-tight">Your plan: {plan.headline}</h1>
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
        <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Your home screen</div>
        <div className="mt-2 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1.5 shadow-card">
          {tabs.map((t, i) => (
            <div key={t.id} className={`rounded-xl py-2 text-center text-xs font-extrabold ${i === 0 ? "bg-brand-600 text-white" : "text-stone-400"}`}>{t.label}</div>
          ))}
        </div>
      </div>

      <div className="flex-1" />
      <button onClick={onGo} disabled={saving} className="btn-primary mt-6 w-full">{saving ? "Setting up…" : plan.cta}</button>
    </>
  );
}
