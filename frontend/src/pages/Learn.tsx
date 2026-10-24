import { motion } from "framer-motion";
import { Check, Lock, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { StreakHeader } from "../components/Layout";
import { Skeleton } from "../components/ui";
import { useApp } from "../context";
import type { Lesson, PathUnit } from "../types";

export default function Learn() {
  const { user } = useApp();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [units, setUnits] = useState<PathUnit[] | null>(null);

  useEffect(() => {
    if (user && !user.onboarded) nav("/welcome", { replace: true });
  }, [user]);

  useEffect(() => {
    api.getTodayLesson().then(setLesson);
    api.getPath().then((r) => setUnits(r.units));
  }, [user?.queuedTermsCount, user?.streak, user?.level]);

  const fromFeed = lesson?.cards.filter((c) => c.type === "concept" && c.fromFeed).length ?? 0;
  const newWords = lesson?.cards.filter((c) => c.type === "concept").length ?? 0;
  const offsets = [0, 56, 0, -56, 0];

  return (
    <div className="pb-28">
      <StreakHeader />
      <div className="px-4 pt-2">
        {user?.level === "pro" ? (
          <>
            <h1 className="text-3xl font-black">New this week ⚡</h1>
            <p className="font-semibold text-stone-500">Terms coined or trending in the last 7 days. Two minutes and you're current.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black">Hi {user?.name ?? "there"} 👋</h1>
            <p className="font-semibold text-stone-500">
              {user?.level === "beginner" ? "Start here. 5 minutes a day, no jargon." : "5 minutes a day to speak AI fluently."}
            </p>
          </>
        )}

        {!lesson ? (
          <Skeleton className="mt-4 h-48" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 overflow-hidden rounded-3xl p-5 text-white shadow-lg ${lesson.completed ? "bg-ok-500 shadow-ok-500/30" : "bg-brand-600 shadow-brand-600/30"}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-white/70">Today's lesson</div>
                <div className="mt-1 text-2xl font-black">{lesson.unitTitle}</div>
                <div className="mt-1 text-sm font-bold text-white/80">
                  {newWords} new words · {lesson.cards.length} cards · ~5 min
                </div>
              </div>
              <div className="text-4xl">{lesson.completed ? "🏆" : "📚"}</div>
            </div>
            {fromFeed > 0 && !lesson.completed && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-extrabold"
              >
                <Sparkles size={14} /> {fromFeed} word{fromFeed > 1 ? "s" : ""} from your feed
              </motion.div>
            )}
            {lesson.completed ? (
              <div className="mt-4 rounded-2xl bg-white/20 p-3 text-center font-extrabold">✓ Done for today! Come back tomorrow to keep your streak.</div>
            ) : (
              <button onClick={() => nav(`/lesson/${lesson.id}`)} className="btn mt-4 w-full bg-white text-brand-700 border-b-4 border-brand-200 active:border-b-2">
                Start lesson
              </button>
            )}
          </motion.div>
        )}

        {user && user.queuedTermsCount > 0 && lesson?.completed && (
          <div className="mt-3 rounded-2xl border-2 border-brand-200 bg-brand-50 p-3 text-sm font-bold text-brand-700">
            ✨ {user.queuedTermsCount} word{user.queuedTermsCount > 1 ? "s" : ""} from your feed queued for tomorrow
          </div>
        )}

        <h2 className="mt-8 text-lg font-black">{user?.level === "pro" ? "The full path" : "Your path"}</h2>
        <div className="relative mt-10 flex flex-col items-center gap-12 pb-6">
          {!units && <Skeleton className="h-64 w-full" />}
          {units?.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center"
              style={{ transform: `translateX(${offsets[i % offsets.length]}px)` }}
            >
              <div className="relative">
                {u.status === "current" && (
                  <>
                    <motion.div className="absolute -inset-2 rounded-full border-4 border-brand-300" animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} />
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-1 text-xs font-black text-brand-600 shadow-card border-2 border-brand-100">
                      {Math.round(u.progress * 100)}% done
                    </div>
                  </>
                )}
                <button
                  onClick={() => u.status !== "locked" && lesson && !lesson.completed && nav(`/lesson/${lesson.id}`)}
                  className={`relative grid h-[76px] w-[76px] place-items-center rounded-full border-b-[6px] text-3xl transition-transform active:translate-y-1 ${
                    u.status === "done" ? "bg-ok-500 border-ok-700" : u.status === "current" ? "bg-brand-600 border-brand-800" : "bg-stone-200 border-stone-300"
                  }`}
                >
                  <span className={u.status === "locked" ? "grayscale opacity-50" : ""}>{u.emoji}</span>
                  <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-white shadow">
                    {u.status === "done" ? <Check size={16} className="text-ok-600" strokeWidth={3} /> : u.status === "locked" ? <Lock size={14} className="text-stone-400" /> : <Star size={14} className="text-amber-500" fill="currentColor" />}
                  </div>
                </button>
              </div>
              <div className={`mt-2 text-sm font-extrabold ${u.status === "locked" ? "text-stone-400" : "text-ink"}`}>{u.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
