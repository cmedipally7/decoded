import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { MascotSays } from "../components/Mascot";
import { Skeleton } from "../components/ui";
import { useApp } from "../context";
import type { Term } from "../types";

const ORDER = ["Foundations", "Models", "Building", "Business of AI", "Frontier"];
const EMOJI: Record<string, string> = { Foundations: "🧱", Models: "🧠", Building: "🛠️", "Business of AI": "💰", Frontier: "🚀" };

// Word bank: every word the user has learned, tappable for a quick refresher
export default function Words() {
  const { openTerm, viewLevel } = useApp();
  const nav = useNavigate();
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => { api.getMyWords().then((r) => setTerms(r.terms)); }, []);

  const groups = useMemo(() => {
    const f = (terms ?? []).filter((t) => t.term.toLowerCase().includes(q.toLowerCase()) || t.definitions.beginner.toLowerCase().includes(q.toLowerCase()));
    return ORDER.map((c) => ({ c, list: f.filter((t) => t.category === c) })).filter((g) => g.list.length);
  }, [terms, q]);

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => nav(-1)} className="text-stone-500 active:scale-90" aria-label="Back"><ArrowLeft size={24} strokeWidth={2.5} /></button>
        <h1 className="text-2xl font-black">Word bank</h1>
        {terms && <span className="chip ml-auto bg-brand-100 py-0.5 text-sm text-brand-700">📖 {terms.length}</span>}
      </div>
      <div className="space-y-4 px-4 pt-3">
        <MascotSays mood="point" size={60}>
          {terms?.length ? `You've learned ${terms.length} AI words! Tap any one for a quick refresher.` : "Words you learn will collect here."}
        </MascotSays>

        <label className="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-3 py-2.5 focus-within:border-brand-500">
          <Search size={18} className="text-stone-400" />
          <input id="word-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your words" className="w-full bg-transparent font-semibold outline-none" />
        </label>

        {!terms && <Skeleton className="h-64" />}
        {terms && groups.length === 0 && <p className="py-8 text-center font-bold text-stone-400">No words match “{q}”.</p>}

        {groups.map(({ c, list }) => (
          <section key={c}>
            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-stone-500">{EMOJI[c]} {c} · {list.length}</h2>
            <div className="space-y-2">
              {list.map((t, i) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.03 }}
                  onClick={() => openTerm(t.id)}
                  className="card flex w-full items-start gap-3 p-3 text-left active:scale-[0.99]"
                >
                  <span className="mt-0.5 rounded-lg bg-brand-100 px-2 py-0.5 text-sm font-black text-brand-700">{t.term}</span>
                  <span className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold text-stone-600">{t.definitions[viewLevel]}</span>
                </motion.button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
