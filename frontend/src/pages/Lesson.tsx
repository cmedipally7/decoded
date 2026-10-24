import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { ProgressBar } from "../components/ui";
import { useApp } from "../context";
import type { Card, Lesson as LessonT } from "../types";

type Verdict = { correct: boolean; explanation: string; answer?: string } | null;

export default function Lesson() {
  const nav = useNavigate();
  const { setUser } = useApp();
  const [lesson, setLesson] = useState<LessonT | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    api.getTodayLesson().then((l) => {
      setLesson(l);
      setQueue(l.cards.map((_, i) => i));
    });
  }, []);

  if (!lesson || queue.length === 0) {
    return <div className="grid flex-1 place-items-center text-stone-400 font-bold">Loading lesson…</div>;
  }

  const card = lesson.cards[queue[0]];
  const total = lesson.cards.length;

  const check = async () => {
    if (card.type === "mcq" || card.type === "real_post" || card.type === "fill_blank") {
      if (selected === null) return;
      const correct = selected === card.answerIndex;
      setVerdict({ correct, explanation: card.explanation, answer: card.options[card.answerIndex] });
      api.answerCard(lesson.id, card.id, correct).then((r) => setUser(r.user));
    }
  };

  const advance = async (requeue = false) => {
    const rest = queue.slice(1);
    const nextQ = requeue ? [...rest, queue[0]] : rest;
    if (!requeue) setDoneCount((d) => d + 1);
    setSelected(null);
    setVerdict(null);
    if (nextQ.length === 0) {
      setFinishing(true);
      const res = await api.completeLesson(lesson.id);
      setUser(res.user);
      nav(`/lesson/${lesson.id}/done`, { replace: true, state: res });
      return;
    }
    setQueue(nextQ);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={() => nav("/learn")} className="text-stone-400 active:scale-90">
          <X size={28} strokeWidth={2.5} />
        </button>
        <ProgressBar value={doneCount / total} className="h-4" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${queue[0]}-${queue.length}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
          >
            <CardView card={card} selected={selected} onSelect={setSelected} locked={!!verdict} onMatchDone={() => {
              api.answerCard(lesson.id, card.id, true).then((r) => setUser(r.user));
              setVerdict({ correct: true, explanation: "All pairs matched!" });
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action / verdict banner */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <AnimatePresence mode="wait">
          {verdict ? (
            <motion.div
              key="verdict"
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              exit={{ y: 120 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className={`px-5 pt-5 pb-6 ${verdict.correct ? "bg-ok-100" : "bg-bad-100"}`}
            >
              <div className={`flex items-center gap-2 text-xl font-black ${verdict.correct ? "text-ok-700" : "text-bad-700"}`}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} className={`grid h-8 w-8 place-items-center rounded-full ${verdict.correct ? "bg-ok-500" : "bg-bad-500"} text-white`}>
                  {verdict.correct ? <Check size={20} strokeWidth={3.5} /> : <X size={20} strokeWidth={3.5} />}
                </motion.div>
                {verdict.correct ? "Nice! +10 XP" : "Not quite"}
              </div>
              {!verdict.correct && verdict.answer && <p className="mt-2 font-extrabold text-bad-700">Answer: {verdict.answer}</p>}
              <p className={`mt-1 text-sm font-semibold ${verdict.correct ? "text-ok-700" : "text-bad-700"}`}>{verdict.explanation}</p>
              <button disabled={finishing} onClick={() => advance(!verdict.correct)} className={`${verdict.correct ? "btn-ok" : "btn-bad"} mt-4 w-full`}>
                {finishing ? "Saving…" : "Continue"}
              </button>
            </motion.div>
          ) : card.type === "concept" ? (
            <motion.div key="got" className="border-t-2 border-stone-100 bg-paper px-5 pt-4 pb-6">
              <button onClick={() => advance()} disabled={finishing} className="btn-primary w-full">Got it</button>
            </motion.div>
          ) : card.type === "match" ? null : (
            <motion.div key="check" className="border-t-2 border-stone-100 bg-paper px-5 pt-4 pb-6">
              <button onClick={check} disabled={selected === null} className="btn-ok w-full">Check</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Options({ options, selected, onSelect, locked }: { options: string[]; selected: number | null; onSelect: (i: number) => void; locked: boolean }) {
  return (
    <div className="mt-5 space-y-3">
      {options.map((o, i) => (
        <button
          key={i}
          disabled={locked}
          onClick={() => onSelect(i)}
          className={`w-full rounded-2xl border-2 border-b-4 p-4 text-left font-bold transition-all active:translate-y-[2px] ${
            selected === i ? "border-brand-500 bg-brand-50 text-brand-800" : "border-stone-200 bg-white"
          }`}
        >
          <span className={`mr-3 inline-grid h-7 w-7 place-items-center rounded-lg border-2 text-xs ${selected === i ? "border-brand-500 text-brand-600" : "border-stone-200 text-stone-400"}`}>{i + 1}</span>
          {o}
        </button>
      ))}
    </div>
  );
}

function CardView({ card, selected, onSelect, locked, onMatchDone }: { card: Card; selected: number | null; onSelect: (i: number) => void; locked: boolean; onMatchDone: () => void }) {
  switch (card.type) {
    case "concept":
      return (
        <div className="pt-4">
          <div className="flex flex-wrap gap-2">
            <span className="chip bg-brand-100 text-brand-700 text-xs">NEW WORD</span>
            {card.fromFeed && (
              <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="chip bg-amber-100 text-amber-800 text-xs">
                <Sparkles size={12} /> From your feed
              </motion.span>
            )}
          </div>
          <h2 className="mt-4 text-4xl font-black leading-tight">{card.term}</h2>
          <p className="mt-4 text-lg font-semibold leading-relaxed">{card.explanation}</p>
          <div className="mt-6 rounded-2xl border-2 border-brand-100 bg-brand-50 p-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-brand-600">💡 Think of it like</div>
            <p className="mt-1 text-[17px] font-bold text-brand-800">{card.analogy}</p>
          </div>
        </div>
      );
    case "mcq":
      return (
        <div className="pt-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Choose the answer</div>
          <h2 className="mt-2 text-2xl font-black">{card.question}</h2>
          <Options options={card.options} selected={selected} onSelect={onSelect} locked={locked} />
        </div>
      );
    case "real_post":
      return (
        <div className="pt-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Read a real post</div>
          <div className="mt-3 rounded-2xl border-l-4 border-brand-400 bg-white p-4 shadow-card">
            <div className="text-sm font-extrabold text-stone-500">{card.author}</div>
            <p className="mt-1 font-semibold leading-relaxed">"{card.postSnippet}"</p>
          </div>
          <h2 className="mt-5 text-xl font-black">{card.question}</h2>
          <Options options={card.options} selected={selected} onSelect={onSelect} locked={locked} />
        </div>
      );
    case "fill_blank": {
      const [a, b] = card.sentence.split("___");
      return (
        <div className="pt-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Fill in the blank</div>
          <p className="mt-4 text-2xl font-black leading-snug">
            {a}
            <span className={`mx-1 inline-block min-w-[110px] rounded-xl border-b-4 px-2 text-center ${selected !== null ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 text-transparent"}`}>
              {selected !== null ? card.options[selected] : "____"}
            </span>
            {b}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {card.options.map((o, i) => (
              <button
                key={i}
                disabled={locked}
                onClick={() => onSelect(i)}
                className={`rounded-2xl border-2 border-b-4 px-4 py-3 font-extrabold active:translate-y-[2px] ${selected === i ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-200 bg-white"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "match":
      return <MatchCard pairs={card.pairs} onDone={onMatchDone} />;
  }
}

function MatchCard({ pairs, onDone }: { pairs: { left: string; right: string }[]; onDone: () => void }) {
  const rights = useMemo(() => [...pairs.map((p) => p.right)].sort(() => Math.random() - 0.5), [pairs]);
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const tapRight = (r: string) => {
    if (selLeft === null) return;
    if (pairs[selLeft].right === r) {
      const m = new Set(matched).add(selLeft);
      setMatched(m);
      setSelLeft(null);
      if (m.size === pairs.length) setTimeout(onDone, 350);
    } else {
      setWrong(r);
      setTimeout(() => setWrong(null), 450);
      setSelLeft(null);
    }
  };
  const rightMatched = (r: string) => [...matched].some((i) => pairs[i].right === r);

  return (
    <div className="pt-4">
      <div className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Match the pairs</div>
      <h2 className="mt-2 text-2xl font-black">Tap a word, then its meaning</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {pairs.map((p, i) => (
            <motion.button
              key={p.left}
              disabled={matched.has(i)}
              onClick={() => setSelLeft(i)}
              animate={{ opacity: matched.has(i) ? 0.35 : 1 }}
              className={`flex min-h-[72px] w-full items-center justify-center rounded-2xl border-2 border-b-4 p-2 text-center font-extrabold ${
                matched.has(i) ? "border-ok-500 bg-ok-50 text-ok-700" : selLeft === i ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-200 bg-white"
              }`}
            >
              {p.left}
            </motion.button>
          ))}
        </div>
        <div className="space-y-3">
          {rights.map((r) => (
            <motion.button
              key={r}
              disabled={rightMatched(r)}
              onClick={() => tapRight(r)}
              animate={wrong === r ? { x: [0, -8, 8, -6, 6, 0] } : { opacity: rightMatched(r) ? 0.35 : 1 }}
              transition={{ duration: 0.35 }}
              className={`flex min-h-[72px] w-full items-center justify-center rounded-2xl border-2 border-b-4 p-2 text-center text-[13px] font-bold leading-tight ${
                rightMatched(r) ? "border-ok-500 bg-ok-50 text-ok-700" : wrong === r ? "border-bad-500 bg-bad-50 text-bad-700" : "border-stone-200 bg-white"
              }`}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
