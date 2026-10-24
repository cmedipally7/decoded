import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Flame, Newspaper, Sparkles, Star, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { StreakHeader } from "../components/Layout";
import { Mascot, MascotSays } from "../components/Mascot";
import { PostCard } from "../components/PostCard";
import { Avatar, ProgressBar, Skeleton } from "../components/ui";
import { lensMeta, useApp } from "../context";
import type { Lesson, Post, Quest } from "../types";

const ACTION_ICON = { lesson: BookOpen, pulse: Newspaper, decode: Sparkles, people: Users };

// Home for every level: today's quests, then the one thing to do next
export default function Today() {
  const { user, rememberPosts, setDecodeOpen, viewLevel } = useApp();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (user && !user.onboarded) nav("/welcome", { replace: true });
  }, [user]);
  useEffect(() => {
    api.getTodayLesson().then(setLesson);
  }, [user?.queuedTermsCount, user?.lessonDoneToday, user?.level, user?.lens]);
  useEffect(() => {
    api.getFeed().then((r) => { rememberPosts(r.posts); setPosts(r.posts); });
  }, [user?.lens, user?.level]);

  const concepts = (lesson?.cards.filter((c) => c.type === "concept") ?? []) as Extract<Lesson["cards"][number], { type: "concept" }>[];
  const inTheWild = useMemo(() => {
    if (!posts || !concepts.length) return [];
    const ids = new Set(concepts.map((c) => c.termId));
    return posts.filter((p) => p.terms.some((t) => ids.has(t.id))).slice(0, 2);
  }, [posts, lesson]);

  if (!user) return null;
  const lm = lensMeta(user.lens);
  const streakQuest = user.quests[0];
  const done = user.quests.filter((q) => q.done).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const go = (q: Quest) => {
    if (q.action === "decode") return setDecodeOpen(true);
    if (q.action === "lesson") return lesson && !lesson.completed ? nav(`/lesson/${lesson.id}`) : nav("/learn");
    nav(`/${q.action}`);
  };

  const bubble = streakQuest?.done
    ? `Streak saved! 🔥 ${user.streak} days. Bonus quests earn extra XP.`
    : user.level === "beginner"
    ? "One lesson, 5 minutes. That's all it takes today."
    : user.level === "amateur"
    ? "A lesson or 3 posts keeps your streak going."
    : `5 posts and one deep dive and you're current on what ${lm.noun} are saying.`;

  return (
    <div className="pb-24">
      <StreakHeader />
      <div className="space-y-5 px-4 pt-1">
        <div>
          <h1 className="text-2xl font-black">{greet}, {user.name}</h1>
          <div className="mt-2">
            <MascotSays mood={streakQuest?.done ? "cheer" : "wave"} size={60}>{bubble}</MascotSays>
          </div>
        </div>

        {/* Quests */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="text-lg font-black">Today's quests</h2>
            <span className="text-sm font-extrabold text-stone-400">{done}/{user.quests.length}</span>
          </div>
          <div className="mt-2 divide-y-2 divide-stone-100">
            {user.quests.map((q) => {
              const Icon = ACTION_ICON[q.action];
              return (
                <button key={q.id} onClick={() => go(q)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-stone-50">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                      q.done ? "bg-ok-500 text-white" : q.kind === "streak" ? "bg-flame-100 text-flame-500" : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    {q.done ? <Check size={22} strokeWidth={3} /> : q.kind === "streak" ? <Flame size={22} fill="currentColor" /> : <Star size={20} fill="currentColor" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    {q.kind === "streak" && <div className="text-[10px] font-black uppercase tracking-wider text-flame-600">Keeps your streak</div>}
                    <div className={`font-extrabold leading-snug ${q.done ? "text-stone-400 line-through" : ""}`}>{q.title}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={q.progress / q.target} className="h-2" color={q.done ? "bg-ok-500" : q.kind === "streak" ? "bg-flame-500" : "bg-amber-400"} />
                      <span className="shrink-0 text-xs font-extrabold tabular-nums text-stone-400">{q.progress}/{q.target}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs font-black text-amber-600">+{q.xp} XP</span>
                    {!q.done && <Icon size={16} className="text-stone-300" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Reason to come back tomorrow */}
        {streakQuest?.done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border-2 border-brand-200 bg-brand-50 p-4">
            {/* Byte does victory zoomies across the card */}
            <div className="relative -mx-4 -mt-4 mb-2 h-14">
              <motion.div className="absolute bottom-0" initial={{ left: "-20%" }} animate={{ left: ["-20%", "105%", "105%", "-20%", "40%"] }} transition={{ duration: 4, times: [0, 0.35, 0.5, 0.85, 1], ease: "easeInOut" }}>
                <motion.div animate={{ scaleX: [1, 1, -1, -1, 1] }} transition={{ duration: 4, times: [0, 0.35, 0.5, 0.85, 1] }}>
                  <Mascot mood="cheer" size={52} />
                </motion.div>
              </motion.div>
              <div className="absolute bottom-1 left-4 text-xs font-black text-brand-400">🐾 🐾 🐾</div>
            </div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Tomorrow</div>
            <div className="mt-1 font-black text-brand-900">
              {user.queuedTermsCount > 0
                ? `Your lesson will include ${user.queuedTermsCount} word${user.queuedTermsCount > 1 ? "s" : ""} you tapped today ✨`
                : "Tap words you don't know in Pulse and they'll be in tomorrow's lesson ✨"}
            </div>
            <div className="mt-1 text-sm font-semibold text-brand-700">Come back to make it 🔥 {user.streak + 1} days.</div>
          </motion.div>
        )}

        {/* Feed fluency: the north-star number, shown only here */}
        <div className="card flex items-center gap-4 p-4">
          <div className="text-center">
            <div className="text-2xl font-black tabular-nums text-ok-600">{user.feedFluency}%</div>
            <div className="text-[10px] font-extrabold uppercase leading-tight text-stone-400">feed<br />fluency</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold leading-snug">You can read {user.feedFluency}% of today's AI feed</div>
            <ProgressBar value={user.feedFluency / 100} className="mt-2 h-2.5" />
            <div className="mt-1 text-xs font-bold text-stone-400">{user.wordsKnown} words known</div>
          </div>
        </div>

        {/* Up next: lesson-first for beginners and amateurs, posts-first for pros */}
        {user.level !== "pro" && lesson && !lesson.completed && (
          <section>
            <h2 className="text-lg font-black">Up next</h2>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => nav(`/lesson/${lesson.id}`)}
              className="mt-2 w-full rounded-3xl bg-brand-600 p-4 text-left text-white shadow-lg shadow-brand-600/25"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl">📚</div>
                <div className="min-w-0 flex-1">
                  <div className="font-black">{lesson.unitTitle}</div>
                  <div className="text-sm font-bold text-white/80">~5 min · {concepts.length} new words</div>
                </div>
                <ArrowRight className="shrink-0" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {concepts.map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold">
                    {c.fromFeed && <Sparkles size={11} />} {c.term}
                  </span>
                ))}
              </div>
            </motion.button>
            {inTheWild.length > 0 && (
              <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
                {inTheWild.map((p) => {
                  const hit = p.terms.find((t) => concepts.some((c) => c.termId === t.id));
                  return (
                    <button key={p.id} onClick={() => nav(`/chat/${p.id}`)} className="card w-[250px] shrink-0 p-3 text-left active:scale-[0.98]">
                      <div className="flex items-center gap-2">
                        <Avatar name={p.author.name} url={p.author.avatarUrl} size={26} />
                        <div className="min-w-0 truncate text-sm font-extrabold">{p.author.name}</div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-stone-700">{p.tldr[viewLevel]}</p>
                      {hit && <span className="mt-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-700">uses “{hit.term}”</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {user.level !== "beginner" && (
          <section>
            <h2 className="text-lg font-black">For {lm.noun}, right now</h2>
            <div className="mt-2 space-y-4">
              {!posts && <Skeleton className="h-48" />}
              {posts?.slice(0, 3).map((p) => <PostCard key={p.id} post={p} trackRead />)}
            </div>
            <button onClick={() => nav("/pulse")} className="btn-ghost mt-4 w-full">
              Open Pulse <ArrowRight size={16} />
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
