import { motion } from "framer-motion";
import { Check, ClipboardPaste, Link2, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context";
import type { Post, Term } from "../types";
import { ByteChase, Mascot } from "./Mascot";
import { PostCard } from "./PostCard";
import { BottomSheet, LoadingSteps, Skeleton } from "./ui";

export function TermSheet() {
  const { termId, closeTerm, viewLevel, toast, refreshUser } = useApp();
  const [term, setTerm] = useState<Term | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!termId) return;
    setTerm(null);
    api.getTerm(termId).then(setTerm).catch(() => closeTerm());
  }, [termId]);

  const add = async () => {
    if (!term) return;
    setAdding(true);
    await api.queueTerm(term.id);
    setTerm({ ...term, status: "queued" });
    setAdding(false);
    toast("✨ Added to tomorrow's lesson · +5 XP");
    refreshUser();
  };

  const known = term && (term.status === "learning" || term.status === "known");
  return (
    <BottomSheet open={!!termId} onClose={closeTerm}>
      {!term ? (
        <div className="space-y-3 py-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-extrabold uppercase tracking-wider text-brand-600">{term.category}</div>
              <h2 className="text-3xl font-black">{term.term}</h2>
            </div>
            <Mascot mood={term.status === "queued" ? "cheer" : term.status === "learning" || term.status === "known" ? "wave" : "think"} size={64} />
          </div>
          <p className="text-[17px] leading-relaxed">{term.definitions[viewLevel]}</p>
          <div className="rounded-2xl bg-brand-50 p-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-brand-600">Think of it like</div>
            <p className="mt-1 font-bold text-brand-800">{term.analogy}</p>
          </div>
          {known ? (
            <div className="btn bg-ok-50 text-ok-700 w-full border-2 border-ok-100">
              <Check size={18} strokeWidth={3} /> You know this one
            </div>
          ) : term.status === "queued" ? (
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="btn-ok w-full">
              <Check size={18} strokeWidth={3} /> Added to tomorrow's lesson
            </motion.div>
          ) : (
            <button onClick={add} disabled={adding} className="btn-primary w-full">
              <Plus size={18} strokeWidth={3} /> Add to tomorrow's lesson
            </button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

// Edit these to your 3 rehearsed demo links
export const SAMPLE_LINKS = [
  { label: "𝕏 post", value: "https://x.com/leobuilds/status/1999" },
  { label: "LinkedIn post", value: "https://www.linkedin.com/posts/someone_ai-activity-123" },
  { label: "Substack", value: "https://example.substack.com/p/token-prices" },
];

type Phase = "idle" | "loading" | "success" | "needsText";

export function DecodeSheet() {
  const { decodeOpen, setDecodeOpen, bumpFeed, rememberPosts, refreshUser } = useApp();
  const nav = useNavigate();
  const [input, setInput] = useState("");
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [reason, setReason] = useState("");

  const reset = () => {
    setInput(""); setPendingUrl(null); setPasteText(""); setPhase("idle"); setDone(false); setPost(null); setReason("");
  };
  const close = () => {
    setDecodeOpen(false);
    window.setTimeout(reset, 300);
  };

  const run = async (body: { url?: string; text?: string }) => {
    setPhase("loading");
    setDone(false);
    try {
      const r = await api.decode(body);
      if (r.ok) {
        setDone(true);
        await new Promise((res) => setTimeout(res, 450));
        setPost(r.post);
        rememberPosts([r.post]);
        setPhase("success");
        bumpFeed();
        refreshUser();
      } else {
        setPendingUrl(r.url);
        setReason("This site hides its posts from us. Paste the text instead 👇");
        setPhase("needsText");
      }
    } catch {
      setPendingUrl(body.url || null);
      setReason("Couldn't reach that link. Paste the text instead 👇");
      setPhase("needsText");
    }
  };

  const submit = () => {
    const v = input.trim();
    if (!v) return;
    if (/^https?:\/\//i.test(v)) run({ url: v });
    else run({ text: v });
  };

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setInput(t);
    } catch { /* clipboard blocked: ignore */ }
  };

  return (
    <BottomSheet open={decodeOpen} onClose={close} tall>
      {phase === "idle" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-black">Decode any post ✨</h2>
            <p className="text-stone-500 font-semibold">Paste a link from X, LinkedIn or Substack, or the post text itself.</p>
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://x.com/… or paste the text"
              rows={4}
              className="w-full resize-none rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 pr-12 font-semibold outline-none focus:border-brand-500 focus:bg-white"
            />
            <button onClick={paste} title="Paste" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white border-2 border-stone-200 text-stone-600 active:scale-95">
              <ClipboardPaste size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-stone-400 self-center">Try:</span>
            {SAMPLE_LINKS.map((s) => (
              <button key={s.label} onClick={() => setInput(s.value)} className="chip bg-stone-100 text-stone-700 text-xs">
                <Link2 size={12} /> {s.label}
              </button>
            ))}
          </div>
          <button onClick={submit} disabled={!input.trim()} className="btn-primary w-full">
            <Sparkles size={18} /> Decode
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="space-y-4 py-4">
          <ByteChase size={72} label={<><span className="text-2xl">Decoding…</span><div className="text-sm font-bold text-stone-500">Byte is chasing down the jargon</div></>} />
          <LoadingSteps steps={["Fetching post", "Spotting jargon", "Writing your TL;DR"]} done={done} />
        </div>
      )}

      {phase === "needsText" && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
            <p className="font-extrabold text-amber-900">{reason}</p>
            {pendingUrl && <p className="mt-1 truncate text-xs font-semibold text-amber-700">{pendingUrl}</p>}
          </div>
          <textarea
            autoFocus
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the post text here…"
            rows={6}
            className="w-full resize-none rounded-2xl border-2 border-stone-200 bg-stone-50 p-4 font-semibold outline-none focus:border-brand-500 focus:bg-white"
          />
          <div className="flex gap-2">
            <button onClick={reset} className="btn-ghost">Back</button>
            <button onClick={() => run({ url: pendingUrl || undefined, text: pasteText })} disabled={!pasteText.trim()} className="btn-primary flex-1">
              <Sparkles size={18} /> Decode text
            </button>
          </div>
        </div>
      )}

      {phase === "success" && post && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-ok-600">
            <Mascot mood="cheer" size={44} interactive={false} /> Decoded · saved to My Decodes
          </div>
          <PostCard post={post} showActions={false} />
          <p className="text-center text-xs font-bold text-stone-400">Tap an underlined word to add it to tomorrow's lesson</p>
          <div className="flex gap-2">
            <button onClick={reset} className="btn-ghost">Decode another</button>
            <button onClick={() => { close(); nav(`/chat/${post.id}`); }} className="btn-primary flex-1">Dive deeper</button>
          </div>
        </motion.div>
      )}
    </BottomSheet>
  );
}
