import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import { PostCard } from "../components/PostCard";
import { StreakHeader } from "../components/Layout";
import { LevelToggle, Skeleton } from "../components/ui";
import { useApp } from "../context";
import type { Archetype, Post } from "../types";

type Filter = "all" | Archetype | "mine";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "researcher", label: "🔬 Researchers" },
  { id: "builder", label: "🛠️ Builders" },
  { id: "investor", label: "💰 Investors" },
  { id: "operator", label: "⚙️ Operators" },
  { id: "mine", label: "✨ My Decodes" },
];

export default function Pulse() {
  const { viewLevel, setViewLevel, rememberPosts, feedVersion, bumpFeed, setDecodeOpen, user, toast } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshFeed() {
    setRefreshing(true);
    try {
      const result = await api.refreshFeed();
      bumpFeed();
      toast(result.added > 0 ? `Added ${result.added} new posts` : "Feed is up to date");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setPosts(null);
    const f = filter === "all" ? undefined : filter === "mine" ? { source: "user" as const } : { archetype: filter };
    api.getFeed(f).then((r) => {
      rememberPosts(r.posts);
      setPosts(r.posts);
    });
  }, [filter, feedVersion]);

  return (
    <div className="pb-28">
      <StreakHeader />
      <div className="px-4 pt-2">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black">Pulse</h1>
            <p className="font-semibold text-stone-500">What AI people are saying today</p>
          </div>
          {user && (
            <div className="text-right">
              <div className="text-2xl font-black text-ok-600 tabular-nums">{user.feedFluency}%</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-stone-400 leading-tight">feed you<br />can read</div>
            </div>
          )}
        </div>
        <div className="mt-3">
          <LevelToggle value={viewLevel} onChange={setViewLevel} />
        </div>
        <button onClick={refreshFeed} disabled={refreshing} className="btn-ghost mt-3 w-full">
          {refreshing ? "Fetching new posts…" : "Refresh"}
        </button>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`chip border-2 transition-colors ${filter === f.id ? "border-brand-600 bg-brand-600 text-white" : "border-stone-200 bg-white text-stone-600"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-4 px-4">
        {!posts &&
          [0, 1, 2].map((i) => (
            <div key={i} className="card space-y-3 p-4">
              <div className="flex gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-10 flex-1" /></div>
              <Skeleton className="h-16" />
              <Skeleton className="h-10" />
            </div>
          ))}
        {posts?.length === 0 && filter === "mine" && (
          <div className="card p-8 text-center">
            <div className="text-5xl">🔍</div>
            <h3 className="mt-3 text-xl font-black">No decodes yet</h3>
            <p className="mt-1 font-semibold text-stone-500">Saw a post you didn't get? Paste it and we'll explain it at your level.</p>
            <button onClick={() => setDecodeOpen(true)} className="btn-primary mt-4">
              <Sparkles size={18} /> Decode your first post
            </button>
          </div>
        )}
        {posts?.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 5) * 0.05 }}>
            <PostCard post={p} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
