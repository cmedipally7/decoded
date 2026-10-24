import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock, Play, Sparkles, Trophy, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { StreakHeader } from "../components/Layout";
import { MascotSays } from "../components/Mascot";
import { ProgressBar, Skeleton } from "../components/ui";
import { lensMeta, useApp } from "../context";
import type { Lesson, PathDay, PathUnit } from "../types";

const when = (d: PathDay) => (d.inDays <= 0 ? "Today" : d.inDays === 1 ? "Tomorrow" : `In ${d.inDays} days`);

export default function Learn() {
  const { user } = useApp();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [units, setUnits] = useState<PathUnit[] | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [coachOff, setCoachOff] = useState(false);

  useEffect(() => {
    if (user && !user.onboarded) nav("/welcome", { replace: true });
  }, [user]);
  useEffect(() => {
    api.getTodayLesson().then(setLesson);
    api.getPath().then((r) => setUnits(r.units));
  }, [user?.queuedTermsCount, user?.streak, user?.level, user?.lens, user?.lessonDoneToday]);

  if (!user) return null;
  const isPro = user.level === "pro";
  const feedWords = (lesson?.cards.filter((c) => c.type === "concept" && c.fromFeed) ?? []) as Extract<Lesson["cards"][number], { type: "concept" }>[];
  const currentIdx = units?.findIndex((u) => u.status === "current") ?? -1;
  const startLesson = () => lesson && !lesson.completed && nav(`/lesson/${lesson.id}`);
  const showCoach = !coachOff && user.lessonsCompleted === 0 && !user.lessonDoneToday && !isPro;

  return (
    <div className="pb-24">
      <StreakHeader />
      <div className="space-y-4 px-4 pt-1">
        {showCoach ? (
          <div className="relative">
            <MascotSays mood="point">
              This is your course. Each chapter is a few days, one short lesson a day. Today's is ready below.
            </MascotSays>
            <button onClick={() => setCoachOff(true)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full text-stone-400" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-black">Learn</h1>
            <p className="font-semibold text-stone-500">
              {units && currentIdx >= 0 ? `Chapter ${currentIdx + 1} of ${units.length} · ` : ""}
              {lensMeta(user.lens).emoji} {lensMeta(user.lens).label} track
            </p>
          </div>
        )}

        {/* Pros: weekly catch-up drill comes first; the course is there to fill gaps */}
        {isPro && lesson && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={startLesson}
            className={`flex w-full items-center gap-3 rounded-3xl p-4 text-left text-white shadow-lg ${lesson.completed ? "bg-ok-500 shadow-ok-500/25" : "bg-brand-600 shadow-brand-600/25"}`}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20">{lesson.completed ? <Check strokeWidth={3} /> : <Zap />}</div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-white/70">This week's catch-up</div>
              <div className="font-black">{lesson.completed ? "Done. You're current." : "3 fresh terms · 2 min"}</div>
              {!lesson.completed && (
                <div className="mt-1 truncate text-sm font-bold text-white/85">
                  {lesson.cards.filter((c) => c.type === "concept").map((c) => (c as { term: string }).term).join(" · ")}
                </div>
              )}
            </div>
            {!lesson.completed && <Play className="shrink-0" fill="currentColor" />}
          </motion.button>
        )}
        {isPro && <p className="pt-2 text-sm font-bold text-stone-400">The full course, if you want to fill gaps:</p>}

        {!units && <Skeleton className="h-96" />}
        {units?.map((u, i) => {
          const isOpen = open[u.id] ?? u.status === "current";
          const doneDays = u.days.filter((d) => d.status === "done").length;
          const allTerms = u.days.flatMap((d) => d.terms);
          return (
            <motion.section
              key={u.id}
              layout
              className={`overflow-hidden rounded-3xl border-2 ${
                u.status === "current" ? "border-brand-200 bg-white shadow-card" : u.status === "done" ? "border-ok-100 bg-ok-50" : "border-stone-200 bg-white/60"
              }`}
            >
              {/* Chapter header */}
              <button onClick={() => setOpen((o) => ({ ...o, [u.id]: !isOpen }))} className="flex w-full items-center gap-3 p-4 text-left">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-b-4 text-2xl ${
                    u.status === "done" ? "border-ok-700 bg-ok-500" : u.status === "current" ? "border-brand-800 bg-brand-600" : "border-stone-300 bg-stone-200"
                  }`}
                >
                  <span className={u.status === "locked" ? "opacity-50 grayscale" : ""}>{u.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                    Chapter {i + 1} · {u.days.length} days
                  </div>
                  <div className={`text-lg font-black leading-tight ${u.status === "locked" ? "text-stone-500" : ""}`}>{u.title}</div>
                  {u.status === "current" && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={doneDays / u.days.length} className="h-2" color="bg-brand-500" />
                      <span className="shrink-0 text-xs font-extrabold text-stone-400">{doneDays}/{u.days.length}</span>
                    </div>
                  )}
                  {u.status === "done" && <div className="text-sm font-bold text-ok-700">Completed ✓</div>}
                  {u.status === "locked" && !isOpen && (
                    <div className="mt-0.5 truncate text-sm font-semibold text-stone-400">
                      You'll learn: {allTerms.slice(0, 3).map((t) => t.term).join(", ")}
                      {allTerms.length > 3 ? ` +${allTerms.length - 3}` : ""}
                    </div>
                  )}
                </div>
                <ChevronDown size={20} className={`shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Days timeline */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <ol className="relative px-4 pb-4">
                      <div className="absolute bottom-8 left-[33px] top-1 w-0.5 bg-stone-200" />
                      {u.days.map((d) => (
                        <DayRow key={d.id} d={d} locked={u.status === "locked"} feedWords={d.status === "today" ? feedWords.map((c) => c.term) : []} onStart={!isPro ? startLesson : undefined} />
                      ))}
                      <li className="relative flex items-center gap-3 pt-1">
                        <div className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ${u.status === "done" ? "bg-amber-400 text-white" : "bg-stone-100 text-stone-300"}`}>
                          <Trophy size={16} />
                        </div>
                        <span className={`text-sm font-extrabold ${u.status === "done" ? "text-amber-700" : "text-stone-400"}`}>
                          {u.status === "done" ? "Chapter complete" : `Chapter checkpoint after day ${u.days.length}`}
                        </span>
                      </li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}

function DayRow({ d, feedWords, onStart, locked }: { d: PathDay; feedWords: string[]; onStart?: () => void; locked: boolean }) {
  if (d.status === "today") {
    return (
      <li className="relative flex gap-3 pb-4">
        <div className="relative z-10 mt-3 h-9 w-9 shrink-0 self-start">
          <motion.div className="absolute -inset-1.5 rounded-full bg-brand-200" animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }} transition={{ repeat: Infinity, duration: 1.8 }} />
          <div className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">{d.n}</div>
        </div>
        <div className="min-w-0 flex-1 rounded-2xl border-2 border-brand-500 bg-brand-50 p-3">
          <div className="text-[11px] font-black uppercase tracking-wider text-brand-600">Today · Day {d.n}</div>
          <div className="font-black">{d.title}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {d.terms.map((t) => (
              <span key={t.id} className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${t.status === "learning" || t.status === "known" ? "bg-white text-stone-400 line-through" : "bg-white text-brand-700"}`}>
                {t.term}
              </span>
            ))}
            {feedWords.map((w) => (
              <span key={w} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                <Sparkles size={11} /> {w}
              </span>
            ))}
          </div>
          {feedWords.length > 0 && <div className="mt-1.5 text-xs font-bold text-amber-700">✨ Plus words you saved from your feed</div>}
          {onStart && (
            <button onClick={onStart} className="btn-primary mt-3 min-h-[42px] w-full text-xs">
              <Play size={14} fill="currentColor" /> Start · 5 min
            </button>
          )}
        </div>
      </li>
    );
  }
  const done = d.status === "done";
  return (
    <li className="relative flex gap-3 pb-4">
      <div
        className={`relative z-10 mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${
          done ? "bg-ok-500 text-white" : "border-2 border-dashed border-stone-300 bg-white text-stone-400"
        }`}
      >
        {done ? <Check size={16} strokeWidth={3} /> : locked ? <Lock size={13} /> : d.n}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className={`font-extrabold leading-snug ${done ? "text-stone-500" : "text-ink"}`}>
            <span className="text-stone-400">Day {d.n} · </span>
            {d.title}
          </div>
          {!done && <span className="shrink-0 text-[11px] font-black uppercase text-stone-400">{when(d)}</span>}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {d.terms.map((t) => (
            <span
              key={t.id}
              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${done ? "bg-ok-100 text-ok-700" : "border border-dashed border-stone-300 text-stone-500"}`}
            >
              {t.term}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}
