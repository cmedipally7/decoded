import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Lock, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { StreakHeader } from "../components/Layout";
import { MascotSays } from "../components/Mascot";
import { Avatar, ProgressBar, Skeleton } from "../components/ui";
import { lensMeta, useApp } from "../context";
import type { Lesson, PathUnit, Post } from "../types";

export default function Learn() {
  const { user, rememberPosts, viewLevel } = useApp();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [units, setUnits] = useState<PathUnit[] | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [showPath, setShowPath] = useState(false);
  const [coachOff, setCoachOff] = useState(false);

  useEffect(() => {
    if (user && !user.onboarded) nav("/welcome", { replace: true });
  }, [user]);

  useEffect(() => {
    api.getTodayLesson().then(setLesson);
    api.getPath().then((r) => setUnits(r.units));
  }, [user?.queuedTermsCount, user?.streak, user?.level, user?.lens, user?.lessonDoneToday]);

  useEffect(() => {
    api.getFeed().then((r) => { rememberPosts(r.posts); setPosts(r.posts); });
  }, [user?.lens]);

  const concepts = (lesson?.cards.filter((c) => c.type === "concept") ?? []) as Extract<Lesson["cards"][number], { type: "concept" }>[];
  const fromFeed = concepts.filter((c) => c.fromFeed).length;
  // Real posts that use today's words
  const inTheWild = useMemo(() => {
    if (!posts || !concepts.length) return [];
    const ids = new Set(concepts.map((c) => c.termId));
    return posts.filter((p) => p.terms.some((t) => ids.has(t.id))).slice(0, 2);
  }, [posts, lesson]);

  if (!user) return null;
  const isPro = user.level === "pro";
  const current = units?.find((u) => u.status === "current") ?? units?.[units.length - 1];
  const showCoach = !coachOff && user.lessonsCompleted === 0 && !user.lessonDoneToday;
  const coachText = isPro
    ? `These are the terms that showed up this week. Two minutes and you're current, ${user.name}.`
    : user.level === "beginner"
    ? `Welcome, ${user.name}! Your first lesson is ready: 3 words, 5 minutes, zero jargon.`
    : `Your lessons mix new words with ones you tap in your feed. Let's start with today's.`;

  return (
    <div className="pb-28">
      <StreakHeader />
      <div className="space-y-5 px-4 pt-2">
        {showCoach ? (
          <div className="relative">
            <MascotSays mood="wave">{coachText}</MascotSays>
            <button onClick={() => setCoachOff(true)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full text-stone-400" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-black">{isPro ? "Catch up ⚡" : `Hi ${user.name} 👋`}</h1>
            <p className="font-semibold text-stone-500">
              {isPro ? "Terms coined or trending in the last 7 days." : user.level === "beginner" ? "5 minutes a day, no jargon." : "5 minutes a day to speak AI fluently."}
            </p>
          </div>
        )}

        {/* Today's lesson */}
        {!lesson ? (
          <Skeleton className="h-52" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`overflow-hidden rounded-3xl p-5 text-white shadow-lg ${lesson.completed ? "bg-ok-500 shadow-ok-500/30" : "bg-brand-600 shadow-brand-600/30"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-wider text-white/70">{isPro ? "This week's drill" : "Today's lesson"}</div>
                <div className="mt-1 text-2xl font-black">{lesson.unitTitle}</div>
                <div className="mt-1 text-sm font-bold text-white/80">{isPro ? "~2 min" : "~5 min"} · {lesson.cards.length} cards</div>
              </div>
              <div className="text-4xl">{lesson.completed ? "🏆" : isPro ? "⚡" : "📚"}</div>
            </div>
            {!lesson.completed && concepts.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">You'll learn</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {concepts.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-sm font-extrabold">
                      {c.fromFeed && <Sparkles size={12} />} {c.term}
                    </span>
                  ))}
                </div>
                {fromFeed > 0 && <div className="mt-2 text-xs font-bold text-amber-200">✨ {fromFeed} from words you tapped in your feed</div>}
              </div>
            )}
            {lesson.completed ? (
              <div className="mt-4 rounded-2xl bg-white/20 p-3 text-center font-extrabold">✓ Done for today. Come back tomorrow to keep your streak.</div>
            ) : (
              <button onClick={() => nav(`/lesson/${lesson.id}`)} className="btn mt-4 w-full border-b-4 border-brand-200 bg-white text-brand-700 active:border-b-2">
                {isPro ? "Start drill" : user.lessonsCompleted === 0 ? "Start my first lesson" : "Start lesson"}
              </button>
            )}
          </motion.div>
        )}

        {/* Compact journey */}
        <section className="card p-4">
          <button onClick={() => setShowPath((s) => !s)} className="flex w-full items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Your journey · {lensMeta(user.lens).emoji} {lensMeta(user.lens).label} track</div>
              <div className="font-black">{current ? `${current.emoji} ${current.title}` : "Loading…"}</div>
            </div>
            <ChevronDown size={20} className={`text-stone-400 transition-transform ${showPath ? "rotate-180" : ""}`} />
          </button>
          {!units ? (
            <Skeleton className="mt-3 h-12" />
          ) : (
            <div className="mt-3 flex items-center">
              {units.map((u, i) => (
                <div key={u.id} className="flex flex-1 items-center last:flex-none">
                  <div
                    className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-b-4 text-lg ${
                      u.status === "done" ? "border-ok-700 bg-ok-500" : u.status === "current" ? "border-brand-800 bg-brand-600 ring-4 ring-brand-200" : "border-stone-300 bg-stone-200"
                    }`}
                    title={u.title}
                  >
                    <span className={u.status === "locked" ? "opacity-40 grayscale" : ""}>{u.emoji}</span>
                  </div>
                  {i < units.length - 1 && <div className={`mx-1 h-1 flex-1 rounded-full ${u.status === "done" ? "bg-ok-500" : "bg-stone-200"}`} />}
                </div>
              ))}
            </div>
          )}
          {current && (
            <div className="mt-3">
              <ProgressBar value={current.progress} className="h-2.5" color="bg-brand-500" />
              <div className="mt-1 text-xs font-bold text-stone-400">{Math.round(current.progress * 100)}% of {current.title}</div>
            </div>
          )}
          <AnimatePresence>
            {showPath && units && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 space-y-2 border-t-2 border-stone-100 pt-3">
                  {units.map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <span className={`text-xl ${u.status === "locked" ? "opacity-40 grayscale" : ""}`}>{u.emoji}</span>
                      <span className={`flex-1 text-sm font-extrabold ${u.status === "locked" ? "text-stone-400" : ""}`}>{u.title}</span>
                      {u.status === "done" ? <Check size={16} className="text-ok-600" strokeWidth={3} /> : u.status === "locked" ? <Lock size={14} className="text-stone-300" /> : <span className="text-xs font-black text-brand-600">{Math.round(u.progress * 100)}%</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>


      </div>
    </div>
  );
}
