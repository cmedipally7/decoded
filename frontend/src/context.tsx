import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Lens, Level, Post, User } from "./types";

interface Ctx {
  user: User | null;
  setUser: (u: User) => void;
  refreshUser: () => Promise<void>;
  viewLevel: Level;
  setViewLevel: (l: Level) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  // global sheets
  termId: string | null;
  openTerm: (id: string) => void;
  closeTerm: () => void;
  decodeOpen: boolean;
  setDecodeOpen: (b: boolean) => void;
  // post cache (for chat page)
  rememberPosts: (p: Post[]) => void;
  getPost: (id: string) => Post | undefined;
  feedVersion: number;
  bumpFeed: () => void;
  xpFlash: number;
}

const AppCtx = createContext<Ctx>(null!);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [viewLevel, setViewLevel] = useState<Level>("beginner");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [termId, setTermId] = useState<string | null>(null);
  const [decodeOpen, setDecodeOpen] = useState(false);
  const [feedVersion, setFeedVersion] = useState(0);
  const [xpFlash, setXpFlash] = useState(0);
  const posts = useRef<Map<string, Post>>(new Map());
  const toastTimer = useRef<number>();
  const prevXp = useRef<number | null>(null);
  const prevLevel = useRef<Level | null>(null);

  const setUser = useCallback((u: User) => {
    if (prevXp.current !== null && u.xp > prevXp.current) setXpFlash((n) => n + 1);
    prevXp.current = u.xp;
    setUserState(u);
    // Follow the user's level whenever it changes (onboarding, persona switch, settings)
    if (prevLevel.current !== u.level) {
      setViewLevel(u.level);
      prevLevel.current = u.level;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await api.getMe();
    setUser(u);
  }, [setUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const value: Ctx = {
    user,
    setUser: (u) => {
      setUser(u);
    },
    refreshUser,
    viewLevel,
    setViewLevel,
    toast,
    toastMsg,
    termId,
    openTerm: setTermId,
    closeTerm: () => setTermId(null),
    decodeOpen,
    setDecodeOpen,
    rememberPosts: (ps) => ps.forEach((p) => posts.current.set(p.id, p)),
    getPost: (id) => posts.current.get(id),
    feedVersion,
    bumpFeed: () => setFeedVersion((v) => v + 1),
    xpFlash,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const LEVELS: { id: Level; emoji: string; label: string }[] = [
  { id: "beginner", emoji: "🌱", label: "Beginner" },
  { id: "amateur", emoji: "🌿", label: "Amateur" },
  { id: "pro", emoji: "🌳", label: "Pro" },
];
export const levelMeta = (l: Level) => LEVELS.find((x) => x.id === l)!;

export const LENSES: { id: Lens; emoji: string; label: string; noun: string; blurb: string }[] = [
  { id: "researcher", emoji: "🔬", label: "Research", noun: "researchers", blurb: "Papers, models, what's actually new" },
  { id: "builder", emoji: "🛠️", label: "Building", noun: "builders", blurb: "Products, tools, shipping with AI" },
  { id: "investor", emoji: "💰", label: "Investing", noun: "investors", blurb: "Markets, moats, where money flows" },
  { id: "operator", emoji: "⚙️", label: "Operating", noun: "operators", blurb: "Rolling AI out at work and on teams" },
];
export const lensMeta = (l: Lens | null | undefined) => LENSES.find((x) => x.id === l) ?? LENSES[3];
