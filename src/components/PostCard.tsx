import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context";
import type { Post, TermRef } from "../types";
import { ArchetypePill, Avatar, SourceIcon, timeAgo } from "./ui";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Underlines each term (case-insensitive, longest first, non-overlapping). Returns nodes + which terms were found. */
export function highlight(text: string, terms: TermRef[], onTap: (id: string) => void) {
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
  const ranges: { start: number; end: number; id: string }[] = [];
  const found = new Set<string>();
  for (const t of sorted) {
    const re = new RegExp(`\\b${esc(t.term)}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const start = m.index, end = start + m[0].length;
      if (!ranges.some((r) => start < r.end && end > r.start)) {
        ranges.push({ start, end, id: t.id });
        found.add(t.id);
      }
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let cur = 0;
  ranges.forEach((r, i) => {
    if (r.start > cur) nodes.push(text.slice(cur, r.start));
    nodes.push(
      <button key={i} className="term-btn" onClick={(e) => { e.stopPropagation(); onTap(r.id); }}>
        {text.slice(r.start, r.end)}
      </button>,
    );
    cur = r.end;
  });
  if (cur < text.length) nodes.push(text.slice(cur));
  return { nodes, found };
}

export function TermHighlighter({ text, terms, showMissing = true }: { text: string; terms: TermRef[]; showMissing?: boolean }) {
  const { openTerm } = useApp();
  const { nodes, found } = highlight(text, terms, openTerm);
  const uniq = terms.filter((t, i) => terms.findIndex((x) => x.id === t.id) === i);
  const missing = uniq.filter((t) => !found.has(t.id));
  return (
    <>
      <p className="leading-relaxed">{nodes}</p>
      {showMissing && missing.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-stone-500">Also in this post:</span>
          {missing.map((t) => (
            <button key={t.id} onClick={() => openTerm(t.id)} className="chip bg-brand-50 text-brand-700 py-1 text-xs border border-brand-200">
              {t.term}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function PostCard({ post, compact = false, showActions = true }: { post: Post; compact?: boolean; showActions?: boolean }) {
  const { viewLevel } = useApp();
  const nav = useNavigate();
  const [showOrig, setShowOrig] = useState(false);
  return (
    <motion.article layout className="card p-4">
      <header className="flex items-center gap-3">
        <Avatar name={post.author.name} url={post.author.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-extrabold">{post.author.name}</span>
            <SourceIcon source={post.source} url={post.url} />
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="truncate">{post.author.handle}</span>
            <span>·</span>
            <span>{timeAgo(post.publishedAt)}</span>
            {post.source !== "user" && <ArchetypePill a={post.author.archetype} />}
            {post.source === "user" && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-brand-700">Decoded</span>}
          </div>
        </div>
      </header>

      {post.topic && <div className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-brand-600">{post.topic}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={viewLevel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-1 text-[15px]"
        >
          <TermHighlighter text={post.tldr[viewLevel]} terms={post.terms} />
        </motion.div>
      </AnimatePresence>

      {!compact && (
        <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm">
          <span className="font-extrabold">💡 Why it matters: </span>
          {post.whyItMatters}
        </div>
      )}

      {!compact && (
        <>
          <button onClick={() => setShowOrig((s) => !s)} className="mt-3 flex items-center gap-1 text-xs font-bold text-stone-500">
            <ChevronDown size={14} className={`transition-transform ${showOrig ? "rotate-180" : ""}`} />
            {showOrig ? "Hide original" : "Show original post"}
          </button>
          <AnimatePresence>
            {showOrig && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-2 rounded-xl bg-stone-50 p-3 text-sm text-stone-700 border-l-4 border-stone-300">
                  <TermHighlighter text={post.text} terms={post.terms} showMissing={false} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {showActions && (
        <footer className="mt-4 flex gap-2">
          <button onClick={() => nav(`/chat/${post.id}`)} className="btn-primary flex-1 min-h-[42px] text-xs">
            <MessageCircle size={16} /> Dive deeper
          </button>
          {post.url && (
            <a href={post.url} target="_blank" rel="noreferrer" className="btn-ghost min-h-[42px] text-xs px-4">
              <ExternalLink size={16} />
            </a>
          )}
        </footer>
      )}
    </motion.article>
  );
}
