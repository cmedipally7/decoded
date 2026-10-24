import confetti from "canvas-confetti";
import { animate, motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mascot } from "../components/Mascot";
import { ProgressBar } from "../components/ui";
import { useApp } from "../context";
import type { CompleteResult } from "../types";

function CountUp({ from, to, suffix = "", delay = 0 }: { from: number; to: number; suffix?: string; delay?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const c = animate(from, to, { duration: 1.2, delay, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [from, to]);
  return <>{v}{suffix}</>;
}

export default function LessonDone() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: CompleteResult | null };
  const { refreshUser, user } = useApp();
  const [fluency, setFluency] = useState(state?.feedFluencyBefore ?? 0);

  useEffect(() => {
    if (!state) { nav("/learn", { replace: true }); return; }
    const fire = (o: confetti.Options) => confetti({ particleCount: 80, spread: 70, startVelocity: 45, colors: ["#7C3AED", "#22C55E", "#F97316", "#FACC15"], ...o });
    fire({ origin: { x: 0.3, y: 0.6 } });
    setTimeout(() => fire({ origin: { x: 0.7, y: 0.6 } }), 250);
    const t = setTimeout(() => setFluency(state.feedFluencyAfter), 900);
    return () => clearTimeout(t);
  }, []);

  if (!state) return null;
  const totalXp = state.xpAwarded;

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar px-5 pt-10 pb-6">
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }} className="flex justify-center">
        <Mascot mood="cheer" size={130} />
      </motion.div>
      <h1 className="mt-3 text-center text-3xl font-black text-brand-700">Lesson complete!</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
          <div className="text-xs font-extrabold uppercase text-amber-700">Bonus XP</div>
          <div className="text-3xl font-black text-amber-600">+<CountUp from={0} to={totalXp} delay={0.3} /></div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl border-2 border-flame-500/40 bg-flame-100 p-4 text-center">
          <div className="text-xs font-extrabold uppercase text-flame-600">Streak</div>
          <div className="flex items-center justify-center gap-1 text-3xl font-black text-flame-500">
            <motion.span animate={{ scale: [1, 1.4, 1], rotate: [0, -12, 12, 0] }} transition={{ delay: 0.8, duration: 0.6 }}>
              <Flame size={30} fill="currentColor" />
            </motion.span>
            {state.streak}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="mt-4 rounded-3xl bg-ink p-5 text-white">
        <div className="text-xs font-extrabold uppercase tracking-wider text-white/60">Feed fluency</div>
        <div className="mt-1 text-lg font-extrabold leading-snug">You can now read</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white/40 line-through">{state.feedFluencyBefore}%</span>
          <span className="text-5xl font-black text-ok-500"><CountUp from={state.feedFluencyBefore} to={state.feedFluencyAfter} suffix="%" delay={0.9} /></span>
        </div>
        <div className="text-lg font-extrabold">of today's AI feed</div>
        <ProgressBar value={fluency / 100} className="mt-3 h-4 bg-white/15" />
      </motion.div>

      {state.wordsLearned.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4">
          <div className="text-sm font-extrabold text-stone-500">Words you learned</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.wordsLearned.map((w) => <span key={w} className="chip bg-ok-100 text-ok-700">✓ {w}</span>)}
          </div>
        </motion.div>
      )}

      <div className="flex-1" />
      {user?.level === "beginner" ? (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4 text-center">
          <div className="text-2xl">🔓</div>
          <div className="font-black text-brand-800">You unlocked more of your feed</div>
          <div className="text-sm font-semibold text-brand-700">Go see the words you just learned in real posts.</div>
          <button onClick={() => { refreshUser(); nav("/pulse"); }} className="btn-primary mt-3 w-full">Read my feed</button>
        </motion.div>
      ) : (
        <button onClick={() => { refreshUser(); nav("/pulse"); }} className="btn-ghost mt-6 w-full">Read today's feed</button>
      )}
      <button onClick={() => { refreshUser(); nav(`/${user?.homeTab ?? "learn"}`); }} className={`${user?.level === "beginner" ? "btn-ghost" : "btn-primary"} mt-3 w-full`}>Continue</button>
    </div>
  );
}
