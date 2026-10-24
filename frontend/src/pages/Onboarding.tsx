import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { ProgressBar } from "../components/ui";
import { levelMeta, useApp } from "../context";
import type { Goal, Level, PlacementQuestion } from "../types";

const GOALS: { id: Goal; emoji: string; label: string }[] = [
  { id: "work", emoji: "💼", label: "Talk to engineers at work" },
  { id: "invest", emoji: "📈", label: "Invest in AI" },
  { id: "switch", emoji: "🚀", label: "Switch into AI" },
  { id: "curious", emoji: "🤔", label: "Just curious" },
];

export function Welcome() {
  const nav = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar px-5 pt-10 pb-6">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-600 text-4xl shadow-lg shadow-brand-600/40">
        🔓
      </motion.div>
      <h1 className="mt-5 text-center text-4xl font-black tracking-tight">Decoded</h1>
      <p className="mt-2 text-center text-lg font-bold text-stone-500">Learn AI the way you learned your first language: a little every day, from what people are actually saying.</p>

      <h2 className="mt-8 font-black">What brings you here?</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {GOALS.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => setGoal(g.id)}
            className={`rounded-2xl border-2 border-b-4 p-4 text-left active:translate-y-[2px] ${goal === g.id ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white"}`}
          >
            <div className="text-3xl">{g.emoji}</div>
            <div className={`mt-2 font-extrabold leading-tight ${goal === g.id ? "text-brand-700" : ""}`}>{g.label}</div>
          </motion.button>
        ))}
      </div>
      <div className="flex-1" />
      <button disabled={!goal} onClick={() => nav("/placement", { state: { goal } })} className="btn-primary mt-6 w-full">
        Find my level
      </button>
      <button onClick={() => nav("/learn")} className="mt-3 text-sm font-bold text-stone-400">Skip</button>
    </div>
  );
}

export function Placement() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: { goal: Goal } | null };
  const { setUser, setViewLevel } = useApp();
  const [qs, setQs] = useState<PlacementQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => { api.getPlacementQs().then((r) => setQs(r.questions)); }, []);

  const pick = async (idx: number) => {
    if (!qs || picked !== null) return;
    setPicked(idx);
    const next = [...answers, idx];
    setAnswers(next);
    await new Promise((r) => setTimeout(r, 380));
    if (i + 1 < qs.length) {
      setI(i + 1);
      setPicked(null);
    } else {
      const r = await api.submitPlacement(state?.goal || "work", next);
      setUser(r.user);
      setViewLevel(r.level);
      nav("/result", { replace: true, state: { level: r.level, score: r.score } });
    }
  };

  if (!qs) return <div className="grid h-full place-items-center font-bold text-stone-400">Loading…</div>;
  const q = qs[i];
  return (
    <div className="flex h-full flex-col px-5 pt-6 pb-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-extrabold text-stone-400">{i + 1}/{qs.length}</span>
        <ProgressBar value={i / qs.length} className="h-4" color="bg-brand-500" />
      </div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-wider text-brand-600">Quick check · no pressure</p>
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <h1 className="mt-2 text-2xl font-black">{q.question}</h1>
          <div className="mt-6 space-y-3">
            {q.options.map((o, idx) => (
              <button
                key={o}
                onClick={() => pick(idx)}
                className={`w-full rounded-2xl border-2 border-b-4 p-4 text-left font-bold active:translate-y-[2px] ${picked === idx ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-200 bg-white"}`}
              >
                {o}
              </button>
            ))}
          </div>
          <button onClick={() => pick(-1)} className="mt-4 w-full text-center text-sm font-bold text-stone-400">I don't know yet</button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const DESC: Record<Level, string> = {
  beginner: "You're at the start. Perfect! We'll explain everything with everyday analogies, zero jargon.",
  amateur: "You know the basics. We'll fill gaps and get you reading AI news comfortably.",
  pro: "You speak AI. We'll keep you sharp on the frontier and the debates.",
};

export function Result() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: { level: Level; score: number } | null };
  const level = state?.level || "beginner";
  const m = levelMeta(level);
  return (
    <div className="flex h-full flex-col items-center px-6 pt-16 pb-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        className="grid h-36 w-36 place-items-center rounded-full bg-brand-100 text-7xl ring-8 ring-brand-50"
      >
        {m.emoji}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className="mt-6 text-sm font-extrabold uppercase tracking-wider text-brand-600">Your level</p>
        <h1 className="text-4xl font-black">{m.label}</h1>
        {state && <p className="mt-1 font-bold text-stone-400">{state.score}/5 correct</p>}
        <p className="mt-4 text-lg font-semibold text-stone-600">{DESC[level]}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 font-extrabold text-amber-800">⏱️ Your daily goal: 5 minutes</div>
      </motion.div>
      <div className="flex-1" />
      <button onClick={() => nav("/learn", { replace: true })} className="btn-primary w-full">Start Day 1</button>
    </div>
  );
}
