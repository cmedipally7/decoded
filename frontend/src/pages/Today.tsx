import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { StreakHeader } from "../components/Layout";
import { PostCard } from "../components/PostCard";
import { ProgressBar, Skeleton } from "../components/ui";
import { lensMeta, useApp } from "../context";
import type { Lesson, Post } from "../types";

// Amateur home: one lesson and a few posts, side by side
export default function Today() {
  const { user, rememberPosts } = useApp();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const lm = lensMeta(user?.lens);

  useEffect(() => {
    api.getTodayLesson().then(setLesson);
  }, [user?.queuedTermsCount, user?.lessonDoneToday, user?.level]);
  useEffect(() => {
    api.getFeed().then((r) => {
      rememberPosts(r.posts);
      setPosts(r.posts.slice(0, 3));
    });
  }, [user?.lens]);

  if (!user) return null;
  const g = user.dailyGoal;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="pb-28">
      <StreakHeader />
      <div className="px-4 pt-2">
        <h1 className="text-3xl font-black">{greet}, {user.name}</h1>
        <p className="font-semibold text-stone-500">Your 10 minutes of AI for today.</p>

        <div className={`mt-4 rounded-2xl border-2 p-4 ${g.met ? "border-ok-500 bg-ok-50" : "border-flame-500/30 bg-flame-100/50"}`}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-wider text-stone-500">Today's goal</div>
            {g.met && <span className="chip bg-ok-500 py-0.5 text-xs text-white"><Check size={12} strokeWidth={3} /> Streak saved</span>}
          </div>
          <div className="mt-1 text-lg font-black">{g.label}</div>
          <ProgressBar value={g.progress / g.target} color={g.met ? "bg-ok-500" : "bg-flame-500"} className="mt-2" />
          <div className="mt-2 flex gap-4 text-sm font-bold text-stone-600">
            <span className="flex items-center gap-1">{user.lessonDoneToday ? <Check size={14} className="text-ok-600" strokeWidth={3} /> : <BookOpen size={14} />} Lesson</span>
            <span className="text-stone-300">or</span>
            <span className="flex items-center gap-1">{g.progress >= 3 && !user.lessonDoneToday ? <Check size={14} className="text-ok-600" strokeWidth={3} /> : <Newspaper size={14} />} {user.lessonDoneToday ? 3 : g.progress}/3 posts</span>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-black">1 · Your lesson</h2>
        {!lesson ? (
          <Skeleton className="mt-2 h-24" />
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => !lesson.completed && nav(`/lesson/${lesson.id}`)}
            className={`mt-2 flex w-full items-center gap-4 rounded-2xl p-4 text-left text-white shadow-lg ${lesson.completed ? "bg-ok-500 shadow-ok-500/25" : "bg-brand-600 shadow-brand-600/25"}`}
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl">{lesson.completed ? "🏆" : "📚"}</div>
            <div className="min-w-0 flex-1">
              <div className="font-black">{lesson.unitTitle}</div>
              <div className="text-sm font-bold text-white/80">
                {lesson.completed ? "Done. Nice work." : `${lesson.cards.filter((c) => c.type === "concept").length} new words · ~5 min`}
              </div>
              {!lesson.completed && lesson.cards.some((c) => c.type === "concept" && c.fromFeed) && (
                <div className="mt-1 text-xs font-extrabold text-amber-200">✨ Includes words you tapped in your feed</div>
              )}
            </div>
            {!lesson.completed && <ArrowRight className="shrink-0" />}
          </motion.button>
        )}

        <div className="mt-6 flex items-baseline justify-between">
          <h2 className="text-lg font-black">2 · Read 3 posts for {lm.noun}</h2>
        </div>
        <p className="text-sm font-semibold text-stone-500">Tap any underlined word and it joins tomorrow's lesson.</p>
        <div className="mt-3 space-y-4">
          {!posts && <Skeleton className="h-48" />}
          {posts?.map((p) => <PostCard key={p.id} post={p} trackRead />)}
        </div>
        <button onClick={() => nav("/pulse")} className="btn-ghost mt-4 w-full">
          See the full Pulse <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
