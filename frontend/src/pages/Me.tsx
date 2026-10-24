import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Check, ChevronRight, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiMode } from "../api";
import { StreakHeader } from "../components/Layout";
import { MascotSays } from "../components/Mascot";
import { PawMeter } from "../components/Paws";
import { Avatar, ProgressBar } from "../components/ui";
import { LENSES, LEVEL_XP, LEVELS, lensMeta, levelMeta, levelProgress, useApp } from "../context";
import type { Level } from "../types";

export default function Me() {
  const { user, setUser, toast } = useApp();
  const nav = useNavigate();
  const [dev, setDev] = useState(false);
  const taps = useRef<number[]>([]);

  const tapAvatar = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 800), now];
    if (taps.current.length >= 3) { setDev((d) => !d); taps.current = []; }
  };

  if (!user) return null;
  const lp = levelProgress(user);
  const curIdx = LEVELS.findIndex((l) => l.id === user.level);
  const p = user.percentiles;
  const best = Math.max(p.streak, p.words, p.xp);
  const brag =
    best === p.streak ? `Your 🔥 ${user.streak}-day streak beats ${p.streak}% of Decoded learners!`
    : best === p.words ? `You know more AI words than ${p.words}% of learners. Woof!`
    : `You've earned more XP than ${p.xp}% of learners this week!`;

  return (
    <div className="pb-24">
      <StreakHeader />
      <div className="space-y-4 px-4 pt-2">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <button onClick={tapAvatar} className="active:scale-95" aria-label="Profile picture"><Avatar name={user.name} url={null} size={72} /></button>
          <div className="min-w-0">
            <h1 className="text-2xl font-black">{user.name}</h1>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="chip bg-brand-100 py-0.5 text-xs text-brand-700">{levelMeta(user.level).emoji} {levelMeta(user.level).label}</span>
              <span className="chip bg-white py-0.5 text-xs text-stone-600">{lensMeta(user.lens).emoji} {lensMeta(user.lens).label} lens</span>
            </div>
          </div>
        </div>

        <MascotSays mood="cheer" size={64}>{brag}</MascotSays>

        {/* Level track: progression, not a setting */}
        <section className="card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-black">Your level</h2>
            <span className="text-xs font-extrabold text-stone-400 tabular-nums">{user.xp} XP</span>
          </div>
          <div className="mt-4 flex items-center">
            {LEVELS.map((l, i) => {
              const done = i < curIdx, cur = i === curIdx;
              return (
                <div key={l.id} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={cur ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className={`relative grid h-14 w-14 place-items-center rounded-full border-b-4 text-2xl ${
                        done ? "border-ok-700 bg-ok-500" : cur ? "border-brand-800 bg-brand-600 ring-4 ring-brand-200" : "border-stone-300 bg-stone-200"
                      }`}
                    >
                      <span className={!done && !cur ? "opacity-40 grayscale" : ""}>{l.emoji}</span>
                      {done && <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-ok-600 shadow"><Check size={12} strokeWidth={4} /></span>}
                    </motion.div>
                    <span className={`mt-1 text-xs font-extrabold ${cur ? "text-brand-700" : done ? "text-ok-700" : "text-stone-400"}`}>{l.label}</span>
                    <span className="text-[10px] font-bold text-stone-400">{LEVEL_XP[l.id]} XP</span>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <div className="mx-1 mb-8 h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <motion.div
                        className={`h-full rounded-full ${done ? "bg-ok-500" : "bg-brand-500"}`}
                        initial={{ width: 0 }}
                        animate={{ width: done ? "100%" : cur ? `${lp.frac * 100}%` : "0%" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-sm font-extrabold text-brand-800">
            {lp.next ? (
              <>⚡ {lp.xpToNext} XP to {levelMeta(lp.next).emoji} {levelMeta(lp.next).label}. About {Math.ceil(lp.xpToNext / 45)} days of lessons.</>
            ) : (
              <>🏆 Top level reached. Keep your streak to stay current.</>
            )}
          </div>
        </section>

        {/* Stats with paw-meter comparison to other learners */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile value={`🔥 ${user.streak}`} label="Day streak" pct={p.streak} />
          <StatTile value={`📖 ${user.wordsKnown}`} label="Words known" pct={p.words} onClick={() => nav("/words")} cta="See all" />
          <StatTile value={`⚡ ${user.xp}`} label="Total XP" pct={p.xp} />
          <StatTile value={`📈 ${user.feedFluency}%`} label="Feed fluency" />
        </div>

        <section>
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
        </section>

        <AnimatePresence>
          {dev && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border-2 border-dashed border-stone-300 p-4">
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
                <button className="btn-ghost w-full" onClick={async () => { const r = await api.devNextDay(); setUser(r.user); toast("☀️ It's tomorrow. New lesson ready."); nav(`/${r.user.homeTab}`); }}>
                  <CalendarPlus size={18} /> Simulate next day
                </button>
                <button className="btn-ghost w-full" onClick={async () => { const r = await api.devReset(); setUser(r.user); nav("/welcome"); }}>
                  <Wand2 size={18} /> Restart onboarding
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!dev && <p className="pt-2 text-center text-xs font-bold text-stone-400">Decoded v0.1 · tap your photo 3× for demo controls</p>}
      </div>
    </div>
  );
}

function StatTile({ value, label, pct, onClick, cta }: { value: string; label: string; pct?: number; onClick?: () => void; cta?: string }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={`card p-4 text-left ${onClick ? "border-2 border-brand-200 active:scale-[0.98]" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-xl font-black tabular-nums">{value}</div>
        {onClick && <ChevronRight size={18} className="text-brand-500" />}
      </div>
      <div className="text-xs font-extrabold uppercase text-stone-400">{label}</div>
      {pct !== undefined ? (
        <div className="mt-2">
          <PawMeter pct={pct} />
          <div className="mt-0.5 text-[11px] font-bold text-stone-500">Ahead of {pct}% of learners</div>
        </div>
      ) : (
        <div className="mt-2"><ProgressBar value={parseInt(value.replace(/\D/g, "")) / 100} className="h-2" /></div>
      )}
      {cta && <div className="mt-1 text-xs font-extrabold text-brand-600">{cta} →</div>}
    </Tag>
  );
}
