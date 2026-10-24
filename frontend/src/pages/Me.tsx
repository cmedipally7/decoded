import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, RotateCcw, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiMode } from "../api";
import { StreakHeader } from "../components/Layout";
import { Avatar, LevelToggle } from "../components/ui";
import { LENSES, lensMeta, levelMeta, useApp } from "../context";
import type { Level } from "../types";

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
        <p className="text-sm font-bold text-stone-400">{levelMeta(user.level).emoji} {levelMeta(user.level).label} · {lensMeta(user.lens).emoji} {lensMeta(user.lens).label} lens</p>
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

      <div className="mt-6 px-4">
        <h2 className="mb-2 font-black">Your lens</h2>
        <div className="grid grid-cols-4 gap-2">
          {LENSES.map((l) => (
            <button
              key={l.id}
              onClick={async () => { const u = await api.updateMe({ lens: l.id }); setUser(u); toast(`Feed and path tuned for ${l.noun}`); }}
              className={`rounded-2xl border-2 border-b-4 py-2 text-center active:translate-y-[2px] ${user.lens === l.id ? "border-brand-500 bg-brand-50" : "border-stone-200 bg-white"}`}
            >
              <div className="text-xl">{l.emoji}</div>
              <div className={`text-[11px] font-extrabold ${user.lens === l.id ? "text-brand-700" : "text-stone-500"}`}>{l.label}</div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {dev && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mt-6 rounded-2xl border-2 border-dashed border-stone-300 p-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Demo controls · API: {apiMode()}</div>
            <div className="mt-3 space-y-2">
              <div className="text-xs font-extrabold text-stone-500">Jump to a persona</div>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "amateur", "pro"] as Level[]).map((lv) => (
                  <button
                    key={lv}
                    onClick={async () => { const r = await api.devSetPersona(lv); setUser(r.user); toast(`Now: ${levelMeta(lv).label} · ${lensMeta(r.user.lens).label}`); nav(`/${r.user.homeTab}`); }}
                    className="rounded-2xl border-2 border-b-4 border-stone-200 bg-white px-1 py-2 text-center active:translate-y-[2px]"
                  >
                    <div className="text-xl">{levelMeta(lv).emoji}</div>
                    <div className="text-[11px] font-extrabold leading-tight">{levelMeta(lv).label}<br /><span className="text-stone-400">{lv === "beginner" ? "Operator" : lv === "amateur" ? "Builder" : "Investor"}</span></div>
                  </button>
                ))}
              </div>
              <button
                className="btn-ghost w-full"
                onClick={async () => { const r = await api.devNextDay(); setUser(r.user); toast("☀️ It's tomorrow. New lesson ready."); nav(`/${r.user.homeTab}`); }}
              >
                <CalendarPlus size={18} /> Simulate next day
              </button>
              <button className="btn-ghost w-full" onClick={async () => { const r = await api.devReset(); setUser(r.user); nav("/welcome"); }}>
                <Wand2 size={18} /> Restart onboarding
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!dev && <p className="mt-8 text-center text-xs font-bold text-stone-300">Decoded v0.1 · tap your avatar 3× for demo controls</p>}
    </div>
  );
}
