import { motion } from "framer-motion";
import { BookOpen, Flame, Newspaper, Sparkles, User as UserIcon, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
      <motion.div
        className="flex items-center gap-1 font-black text-flame-500 shrink-0"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
      >
        <Flame size={22} fill="currentColor" />
        <span className="tabular-nums">{user.streak}</span>
      </motion.div>
    </div>
  );
}

const TABS = [
  { to: "/learn", label: "Learn", Icon: BookOpen },
  { to: "/pulse", label: "Pulse", Icon: Newspaper },
  { to: "/people", label: "People", Icon: Users },
  { to: "/me", label: "Me", Icon: UserIcon },
];

export function TabLayout() {
  const { setDecodeOpen } = useApp();
  const loc = useLocation();
  const showFab = loc.pathname.startsWith("/pulse") || loc.pathname.startsWith("/learn");
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
      <nav className="z-20 grid grid-cols-4 border-t-2 border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className="flex flex-col items-center gap-0.5 py-2.5">
            {({ isActive }) => (
              <>
                <div className={`rounded-xl px-4 py-1 transition-colors ${isActive ? "bg-brand-100 text-brand-600" : "text-stone-400"}`}>
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
