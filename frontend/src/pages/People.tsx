import { useEffect, useState } from "react";
import { api } from "../api";
import { StreakHeader } from "../components/Layout";
import { MascotSays } from "../components/Mascot";
import { archMeta, Avatar, Skeleton } from "../components/ui";
import { lensMeta, levelMeta, useApp } from "../context";
import type { Archetype, Author } from "../types";

const ORDER: { a: Archetype; blurb: string }[] = [
  { a: "researcher", blurb: "Where new ideas come from" },
  { a: "builder", blurb: "What's actually possible today" },
  { a: "investor", blurb: "Where the money is going" },
  { a: "operator", blurb: "How AI shows up at work" },
];

export default function People() {
  const { toast, user } = useApp();
  const lens = user?.lens;
  const order = lens ? [...ORDER.filter((o) => o.a === lens), ...ORDER.filter((o) => o.a !== lens)] : ORDER;
  const [authors, setAuthors] = useState<Author[] | null>(null);
  useEffect(() => { api.getAuthors().then((r) => setAuthors(r.authors)); }, []);

  const toggle = async (au: Author) => {
    setAuthors((as) => as!.map((x) => (x.id === au.id ? { ...x, following: !x.following } : x)));
    await api.follow(au.id, !au.following);
    if (!au.following) toast(`Following ${au.name} · boosted in Pulse`);
  };

  return (
    <div className="pb-24">
      <StreakHeader />
      <div className="px-4 pt-2">
        <h1 className="text-3xl font-black">People</h1>
        <p className="font-semibold text-stone-500">Who to follow, and why. A balanced diet of AI voices.</p>
        <div className="mt-3"><MascotSays mood="point" size={56}>Start with 2 {lensMeta(lens).noun} from your lens. Their posts show up first in Pulse.</MascotSays></div>
      </div>
      <div className="mt-4 space-y-6 px-4">
        {!authors && <Skeleton className="h-64" />}
        {authors &&
          order.map(({ a, blurb }) => {
            const list = authors.filter((x) => x.archetype === a);
            if (!list.length) return null;
            const m = archMeta(a);
            return (
              <section key={a}>
                {a === lens && <div className="mb-1 text-xs font-extrabold uppercase tracking-wider text-brand-600">Start here · your lens</div>}
                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg font-black">{m.emoji} {m.label}s</h2>
                  <span className="text-sm font-bold text-stone-400">{blurb}</span>
                </div>
                <div className="mt-2 space-y-3">
                  {list.map((au) => (
                    <div key={au.id} className="card flex gap-3 p-4">
                      <Avatar name={au.name} url={au.avatarUrl} size={48} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-extrabold">{au.name}</div>
                            <div className="text-xs font-bold text-stone-400">{au.handle} · {levelMeta(au.difficulty).emoji} {levelMeta(au.difficulty).label}</div>
                          </div>
                          <button
                            onClick={() => toggle(au)}
                            className={`shrink-0 rounded-xl border-2 border-b-4 px-3 py-1.5 text-xs font-extrabold uppercase active:translate-y-[2px] ${
                              au.following ? "border-stone-200 bg-white text-stone-500" : "border-brand-800 bg-brand-600 text-white"
                            }`}
                          >
                            {au.following ? "Following" : "Follow"}
                          </button>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-stone-700">{au.whyFollow}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}
