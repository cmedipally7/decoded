import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, RotateCcw, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiMode } from "../api";
import { StreakHeader } from "../components/Layout";
import { Avatar, LevelToggle } from "../components/ui";
import { useApp } from "../context";

export default function Me() {
  const { user, setUser, setViewLevel, toast } = useApp();
  const nav = useNavigate();
  const [dev, setDev] = useState(false);
  const taps = useRef<number[]>([]);

  const tapAvatar = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 800), now];
    if (taps.current.length >= 3) { setDev((d) => !d); taps.current = []; }
  };

  if (!user) return null;
  const stats = [
    { label: "Day streak", value: `🔥 ${user.streak}` },
    { label: "Total XP", value: `⚡ ${user.xp}` },
    { label: "Words known", value: `📖 ${user.wordsKnown}` },
    { label: "Feed fluency", value: `📈 ${user.feedFluency}%` },
  ];

  return (
    <div className="pb-24">
      <StreakHeader />
      <div className="flex flex-col items-center px-4 pt-4">
        <button onClick={tapAvatar} className="active:scale-95"><Avatar name={user.name} url={null} size={88} /></button>
        <h1 className="mt-3 text-2xl font-black">{user.name}</h1>
        <p className="text-sm font-bold text-stone-400">Learning AI to {user.goal === "invest" ? "invest smarter" : user.goal === "switch" ? "switch careers" : user.goal === "curious" ? "satisfy curiosity" : "talk to engineers at work"}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 px-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xl font-black">{s.value}</div>
            <div className="text-xs font-extrabold uppercase text-stone-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 px-4">
        <h2 className="mb-2 font-black">Your level</h2>
        <LevelToggle
          value={user.level}
          onChange={async (l) => {
            const u = await api.updateMe({ level: l });
            setUser(u);
            setViewLevel(l);
            toast("Level updated. Lessons and TL;DRs will adapt.");
          }}
        />
      </div>

      <AnimatePresence>
        {dev && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mt-6 rounded-2xl border-2 border-dashed border-stone-300 p-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Demo controls · API: {apiMode()}</div>
            <div className="mt-3 space-y-2">
              <button
                className="btn-ghost w-full"
                onClick={async () => { const r = await api.devNextDay(); setUser(r.user); toast("☀️ It's tomorrow. New lesson ready."); nav("/learn"); }}
              >
                <CalendarPlus size={18} /> Simulate next day
              </button>
              <button className="btn-ghost w-full" onClick={() => nav("/welcome")}>
                <Wand2 size={18} /> Show onboarding
              </button>
              <button
                className="btn-ghost w-full text-bad-600"
                onClick={async () => { const r = await api.devReset(); setUser(r.user); setViewLevel(r.user.level); toast("Demo reset"); nav("/learn"); }}
              >
                <RotateCcw size={18} /> Reset demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!dev && <p className="mt-8 text-center text-xs font-bold text-stone-300">Decoded v0.1 · tap your avatar 3× for demo controls</p>}
    </div>
  );
}
