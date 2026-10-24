import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { TermHighlighter } from "../components/PostCard";
import { Avatar, Markdown } from "../components/ui";
import { levelMeta, useApp } from "../context";
import type { ChatMessage, Post } from "../types";

import type { Lens } from "../types";
const LENS_STARTER: Record<Lens, string> = {
  investor: "What's the market implication?",
  builder: "How would I build this?",
  operator: "How would my team use this?",
  researcher: "What's the evidence?",
};
function startersFor(level: string, lens: Lens | null | undefined) {
  const lensQ = lens ? [LENS_STARTER[lens]] : [];
  if (level === "pro") return [...lensQ, "What's the counter-argument?", "Who is this person?"];
  if (level === "amateur") return [...lensQ, "Explain like I'm new", "How would I mention this in a meeting?"];
  return ["Explain like I'm new", ...lensQ, "How would I mention this in a meeting?"];
}

export default function Chat() {
  const { postId = "" } = useParams();
  const nav = useNavigate();
  const { getPost, rememberPosts, viewLevel, refreshUser, user } = useApp();
  const STARTERS = startersFor(user?.level ?? "beginner", user?.lens);
  const [post, setPost] = useState<Post | null>(getPost(postId) || null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(STARTERS);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pinOpen, setPinOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (post) return;
    Promise.all([api.getFeed(), api.getFeed({ source: "user" })]).then(([a, b]) => {
      const all = [...a.posts, ...b.posts];
      rememberPosts(all);
      setPost(all.find((p) => p.id === postId) || null);
    });
  }, [postId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setSuggestions([]);
    setTyping(true);
    if (next.length === 1) setPinOpen(false);
    try {
      const r = await api.chat(postId, next);
      setMsgs([...next, { role: "assistant", content: r.reply }]);
      setSuggestions(r.suggestions);
      refreshUser();
    } catch {
      setMsgs([...next, { role: "assistant", content: "Hmm, I couldn't answer that just now. Try again in a sec." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b-2 border-stone-100 bg-white px-4 pt-4 pb-3">
        <button onClick={() => nav(-1)} className="text-stone-500 active:scale-90"><ArrowLeft size={24} strokeWidth={2.5} /></button>
        <div className="flex-1">
          <div className="font-black leading-tight">Deep Dive</div>
          <div className="text-xs font-bold text-stone-400">Your AI tutor · explaining at {levelMeta(viewLevel).emoji} {levelMeta(viewLevel).label} level</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white"><Sparkles size={18} /></div>
      </div>

      {post && (
        <div className="border-b-2 border-stone-100 bg-white px-4 py-3">
          <button onClick={() => setPinOpen((o) => !o)} className="flex w-full items-center gap-2 text-left">
            <Avatar name={post.author.name} url={post.author.avatarUrl} size={28} />
            <span className="flex-1 truncate text-sm font-extrabold">{post.author.name} · <span className="text-stone-400">{post.topic}</span></span>
            <ChevronDown size={18} className={`text-stone-400 transition-transform ${pinOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {pinOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-2 text-sm">
                  <TermHighlighter text={post.tldr[viewLevel]} terms={viewLevel === "pro" ? post.terms.filter((t) => t.status !== "learning" && t.status !== "known") : post.terms} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-4 py-4">
        {msgs.length === 0 && (
          <div className="py-6 text-center">
            <div className="text-5xl">🧠</div>
            <p className="mt-2 font-extrabold">Ask anything about this post</p>
            <p className="text-sm font-semibold text-stone-500">No question is too basic.</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-[15px] font-semibold leading-relaxed ${m.role === "user" ? "rounded-br-lg bg-brand-600 text-white" : "rounded-bl-lg bg-brand-50 text-ink"}`}>
              {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex">
            <div className="flex gap-1 rounded-3xl rounded-bl-lg bg-brand-50 px-4 py-4">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-2 w-2 rounded-full bg-brand-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
              ))}
            </div>
          </div>
        )}
        {!typing && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="chip border-2 border-brand-200 bg-white text-brand-700 text-[13px] whitespace-normal text-left">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t-2 border-stone-100 bg-white px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3 font-semibold outline-none focus:border-brand-500 focus:bg-white"
        />
        <button type="submit" disabled={!input.trim() || typing} className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white disabled:opacity-40 active:scale-95">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
