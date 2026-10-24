import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { levelMeta, LEVELS, useApp } from "../context";
import type { Archetype, Level, Source } from "../types";

export function ProgressBar({ value, className = "", color = "bg-ok-500" }: { value: number; className?: string; color?: string }) {
  return (
    <div className={`h-3 w-full rounded-full bg-stone-200 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full ${color} relative`}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/40" />
      </motion.div>
    </div>
  );
}

export function BottomSheet({ open, onClose, children, tall = false }: { open: boolean; onClose: () => void; children: ReactNode; tall?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl flex flex-col ${tall ? "max-h-[92%]" : "max-h-[80%]"}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-stone-300" />
            </div>
            <div className="overflow-y-auto no-scrollbar px-5 pb-6 pt-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Toast() {
  const { toastMsg } = useApp();
  return (
    <AnimatePresence>
      {toastMsg && (
        <motion.div
          className="absolute left-1/2 top-4 z-[60] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-xl whitespace-nowrap"
          initial={{ y: -40, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: -40, opacity: 0, x: "-50%" }}
        >
          {toastMsg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LevelToggle({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <div className="flex rounded-2xl bg-stone-100 p-1">
      {LEVELS.map((l) => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`relative flex-1 rounded-xl px-2 py-2 text-sm font-extrabold transition-colors ${value === l.id ? "text-brand-700" : "text-stone-500"}`}
        >
          {value === l.id && (
            <motion.div layoutId="lvl-pill" className="absolute inset-0 rounded-xl bg-white shadow" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          )}
          <span className="relative">
            {l.emoji} {l.label}
          </span>
        </button>
      ))}
    </div>
  );
}

const ARCH: Record<Archetype, { label: string; cls: string; emoji: string }> = {
  researcher: { label: "Researcher", cls: "bg-sky-100 text-sky-700", emoji: "🔬" },
  builder: { label: "Builder", cls: "bg-emerald-100 text-emerald-700", emoji: "🛠️" },
  investor: { label: "Investor", cls: "bg-amber-100 text-amber-800", emoji: "💰" },
  operator: { label: "Operator", cls: "bg-pink-100 text-pink-700", emoji: "⚙️" },
};
export const archMeta = (a: Archetype) => ARCH[a];

export function ArchetypePill({ a }: { a: Archetype }) {
  const m = ARCH[a];
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${m.cls}`}>{m.label}</span>;
}

const AV_COLORS = ["bg-brand-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"];
export function Avatar({ name, url, size = 40 }: { name: string; url: string | null; size?: number }) {
  const initials = name.replace(/^Dr\.\s*/, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const color = AV_COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AV_COLORS.length];
  if (url) return <img src={url} alt={name} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className={`${color} shrink-0 rounded-full grid place-items-center text-white font-extrabold`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

export function SourceIcon({ source, url }: { source: Source; url: string | null }) {
  const s = source === "user" && url ? (/(x|twitter)\.com/.test(url) ? "x" : /linkedin/.test(url) ? "linkedin" : /substack/.test(url) ? "substack" : "user") : source;
  if (s === "x") return <span className="grid h-5 w-5 place-items-center rounded bg-black text-[11px] font-black text-white">𝕏</span>;
  if (s === "linkedin") return <span className="grid h-5 w-5 place-items-center rounded bg-[#0A66C2] text-[10px] font-black text-white">in</span>;
  if (s === "substack") return <span className="grid h-5 w-5 place-items-center rounded bg-[#FF6719] text-[11px] font-black text-white">S</span>;
  return <span className="grid h-5 w-5 place-items-center rounded bg-brand-600 text-[11px] font-black text-white">✨</span>;
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function LevelChip({ level }: { level: Level }) {
  const m = levelMeta(level);
  return (
    <span className="chip bg-brand-100 text-brand-700 py-1">
      {m.emoji} {m.label}
    </span>
  );
}

export function LoadingSteps({ steps, done }: { steps: string[]; done: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timers = steps.slice(1).map((_, i) => window.setTimeout(() => setActive((a) => Math.max(a, i + 1)), (i + 1) * 1500));
    return () => timers.forEach(clearTimeout);
  }, [steps]);
  return (
    <div className="space-y-3 py-2">
      {steps.map((s, i) => {
        const complete = done || i < active;
        const running = !complete && i === active;
        return (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: i <= active || done ? 1 : 0.35, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className={`grid h-8 w-8 place-items-center rounded-full ${complete ? "bg-ok-500 text-white" : running ? "bg-brand-100 text-brand-600" : "bg-stone-100 text-stone-400"}`}>
              {complete ? <Check size={18} strokeWidth={3} /> : running ? <Loader2 size={18} className="animate-spin" /> : <span className="text-sm font-bold">{i + 1}</span>}
            </div>
            <span className={`font-bold ${complete ? "text-ink" : running ? "text-brand-700" : "text-stone-400"}`}>{s}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-stone-200 ${className}`} />;
}

// Minimal markdown: **bold**, *italic*, > quotes, • / - bullets, line breaks
export function Markdown({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) =>
      part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.startsWith("*") && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>,
    );
  return (
    <div className="space-y-2">
      {text.split(/\n\n+/).map((block, i) => {
        if (block.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-brand-300 pl-3 italic text-stone-700">{inline(block.slice(2))}</blockquote>;
        const lines = block.split("\n");
        if (lines.every((l) => /^(•|-)\s/.test(l)))
          return (
            <ul key={i} className="space-y-1">
              {lines.map((l, j) => <li key={j} className="flex gap-2"><span>•</span><span>{inline(l.replace(/^(•|-)\s/, ""))}</span></li>)}
            </ul>
          );
        return <p key={i}>{lines.map((l, j) => <span key={j}>{inline(l)}{j < lines.length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}
