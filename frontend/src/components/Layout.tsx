import { motion } from "framer-motion";
import { BookOpen, Flame, Newspaper, Sparkles, Sun, User as UserIcon, Users, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { levelMeta, useApp } from "../context";
import { DecodeSheet, TermSheet } from "./Sheets";
import { ProgressBar, Toast } from "./ui";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center md:py-6">
      <div className="relative flex h-full w-full max-w-[420px] flex-col overflow-hidden bg-paper md:h-[min(900px,100%)] md:rounded-[2.5rem] md:shadow-2xl md:ring-8 md:ring-ink">
        {children}
        <DecodeSheet />
        <TermSheet />
        <Toast />
      </div>
    </div>
  );
}

const XP_PER_LEVEL = 300;

export function StreakHeader() {
  const { user, xpFlash } = useApp();
  const [bump, setBump] = useState(0);
  useEffect(() => { if (xpFlash) setBump((b) => b + 1); }, [xpFlash]);
  if (!user) return <div className="h-[60px]" />;
  const lm = levelMeta(user.level);
  const into = (user.xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
      <div className="chip bg-brand-100 text-brand-700 shrink-0" title={lm.label}>
        <span className="text-base">{lm.emoji}</span>
      </div>
      <div className="flex-1">
        <ProgressBar value={into} color="bg-brand-500" className="h-3" />
      </div>
      <motion.div key={`xp${bump}`} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-black text-brand-600 text-sm shrink-0 tabular-nums">
        {user.xp} XP
      </motion.div>
      <GoalRing />
    </div>
  );
}

/** Streak flame wrapped in a ring that fills as today's goal is met */
export function GoalRing() {
  const { user } = useApp();
  if (!user) return null;
  const g = user.dailyGoal;
  const frac = Math.min(1, g.progress / g.target);
  const r = 17, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center" title={`Today's goal: ${g.label} (${g.progress}/${g.target})`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#E7E5E4" strokeWidth="4" />
        <motion.circle
          cx="22" cy="22" r={r} fill="none" stroke={g.met ? "#F97316" : "#FDBA74"} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - frac) }} transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </svg>
      <motion.div
        key={user.streak}
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        className={`flex flex-col items-center leading-none font-black ${g.met ? "text-flame-500" : "text-stone-400"}`}
      >
        <Flame size={14} fill="currentColor" />
        <span className="text-[11px] tabular-nums">{user.streak}</span>
      </motion.div>
    </div>
  );
}

const TAB_DEFS = {
  today: { to: "/today", label: "Today", Icon: Sun },
  learn: { to: "/learn", label: "Learn", Icon: BookOpen },
  drills: { to: "/learn", label: "New", Icon: Zap },
  pulse: { to: "/pulse", label: "Pulse", Icon: Newspaper },
  people: { to: "/people", label: "People", Icon: Users },
  me: { to: "/me", label: "Me", Icon: UserIcon },
};
// Tab order follows the level: course-first, balanced, or feed-first
const TABS_BY_LEVEL = {
  beginner: [TAB_DEFS.learn, TAB_DEFS.pulse, TAB_DEFS.people, TAB_DEFS.me],
  amateur: [TAB_DEFS.today, TAB_DEFS.learn, TAB_DEFS.pulse, TAB_DEFS.people, TAB_DEFS.me],
  pro: [TAB_DEFS.pulse, TAB_DEFS.drills, TAB_DEFS.people, TAB_DEFS.me],
};

export function TabLayout() {
  const { setDecodeOpen, user } = useApp();
  const loc = useLocation();
  if (user && !user.onboarded) return <Navigate to="/welcome" replace />;
  const TABS = TABS_BY_LEVEL[user?.level ?? "beginner"];
  const showFab = ["/pulse", "/learn", "/today"].some((p) => loc.pathname.startsWith(p));
  return (
    <>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
      {showFab && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setDecodeOpen(true)}
          className="absolute bottom-[84px] right-4 z-30 flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 font-extrabold text-white shadow-lg shadow-brand-600/40 border-b-4 border-brand-800"
        >
          <Sparkles size={18} /> Decode
        </motion.button>
      )}
      <nav style={{ gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))` }} className="z-20 grid border-t-2 border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={label} to={to} className="flex flex-col items-center gap-0.5 py-2.5">
            {({ isActive }) => (
              <>
                <div className={`rounded-xl px-3 py-1 transition-colors ${isActive ? "bg-brand-100 text-brand-600" : "text-stone-400"}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.75 : 2.25} />
                </div>
                <span className={`text-[11px] font-extrabold ${isActive ? "text-brand-600" : "text-stone-400"}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
