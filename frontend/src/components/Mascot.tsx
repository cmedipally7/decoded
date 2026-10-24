import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "framer-motion";
import { useState, type ReactNode } from "react";
import bodyArt from "../assets/byte_body.png";
import headArt from "../assets/byte_head.png";
import tailArt from "../assets/byte_tail.png";

/**
 * Byte, Decoded's corgi mascot, rigged from the pixel art as three layers
 * (body, head, tail) plus blinking eyelids, so it can move like a character:
 * breathing, head tilts, tail wags, blinks, hops and a droop when you miss one.
 * Tap Byte for a happy hop.
 */
export const MASCOT_NAME = "Byte";
export type Mood = "wave" | "think" | "cheer" | "point" | "sad";

const FUR = "rgb(249,165,70)";
const LAYER = "absolute inset-0 h-full w-full select-none pointer-events-none";
const PIXEL = { imageRendering: "pixelated" as const };

type Pose = {
  root: TargetAndTransition; rootT: Transition;
  body: TargetAndTransition; bodyT: Transition;
  head: TargetAndTransition; headT: Transition;
  tail: TargetAndTransition; tailT: Transition;
};

const loop = (duration: number, extra: Transition = {}): Transition => ({ repeat: Infinity, duration, ease: "easeInOut", ...extra });

const POSES: Record<Mood, Pose> = {
  // Happy idle: breathing, gentle head bob, busy tail
  wave: {
    root: { y: [0, -3, 0] }, rootT: loop(1.6),
    body: { scaleY: [1, 0.96, 1], scaleX: [1, 1.025, 1] }, bodyT: loop(1.6),
    head: { rotate: [0, -5, 0, 4, 0] }, headT: loop(2.8),
    tail: { rotate: [-18, 22, -18] }, tailT: loop(0.4),
  },
  // Curious head tilt, slow tail
  think: {
    root: { y: [0, -1.5, 0] }, rootT: loop(2.2),
    body: { scaleY: [1, 0.98, 1] }, bodyT: loop(2.2),
    head: { rotate: [-12, -9, -12] }, headT: loop(2.2),
    tail: { rotate: [-6, 10, -6] }, tailT: loop(1.2),
  },
  // Excited hops with squash and stretch, tail going wild
  cheer: {
    root: { y: [0, -26, 0, 0], rotate: [0, -4, 0, 0] }, rootT: loop(0.75, { times: [0, 0.4, 0.75, 1] }),
    body: { scaleY: [0.88, 1.08, 0.9, 1], scaleX: [1.1, 0.95, 1.08, 1] }, bodyT: loop(0.75, { times: [0, 0.4, 0.75, 1] }),
    head: { rotate: [0, 6, -6, 0] }, headT: loop(0.75),
    tail: { rotate: [-28, 30, -28] }, tailT: loop(0.22),
  },
  // Leaning in to show you something
  point: {
    root: { x: [0, 4, 0], rotate: 4 }, rootT: loop(1.4),
    body: { scaleY: [1, 0.97, 1] }, bodyT: loop(1.4),
    head: { rotate: [6, 10, 6] }, headT: loop(1.4),
    tail: { rotate: [-18, 20, -18] }, tailT: loop(0.45),
  },
  // Missed one: droopy head, still tail, small sigh
  sad: {
    root: { y: 3 }, rootT: { duration: 0.4 },
    body: { scaleY: [0.95, 0.93, 0.95], scaleX: 1.03 }, bodyT: loop(2.4),
    head: { rotate: 9, y: 4 }, headT: { duration: 0.4 },
    tail: { rotate: [-30, -26, -30] }, tailT: loop(2.4),
  },
};

function Eyelid({ left, mood }: { left: string; mood: Mood }) {
  const closedFor = mood === "cheer" ? 0.55 : mood === "sad" ? 0.45 : 0; // happy squint / sleepy lids
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ left, top: "33%", width: "8.6%", height: "10.8%", background: FUR, originY: 0, borderBottom: "2px solid rgba(120,60,15,0.85)" }}
      initial={{ scaleY: 0 }}
      animate={closedFor ? { scaleY: closedFor } : { scaleY: [0, 0, 1, 0, 0] }}
      transition={closedFor ? { duration: 0.15 } : { repeat: Infinity, duration: 3.6, times: [0, 0.9, 0.93, 0.96, 1] }}
    />
  );
}

export function Mascot({ mood = "wave", size = 96, interactive = true }: { mood?: Mood; size?: number; interactive?: boolean }) {
  const [boop, setBoop] = useState(0);
  const active: Mood = boop ? "cheer" : mood;
  const p = POSES[active];
  const tap = () => {
    if (!interactive) return;
    setBoop((b) => b + 1);
    window.setTimeout(() => setBoop(0), 1300);
  };
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} onClick={tap} role="img" aria-label={`${MASCOT_NAME} the corgi`}>
      <motion.div key={active} className="absolute inset-0" style={{ originX: 0.5, originY: 1 }} animate={p.root} transition={p.rootT}>
        {/* tail sits behind the body */}
        <motion.img src={tailArt} className={LAYER} style={{ ...PIXEL, originX: 0.27, originY: 0.76 }} animate={p.tail} transition={p.tailT} draggable={false} alt="" />
        <motion.img src={bodyArt} className={LAYER} style={{ ...PIXEL, originX: 0.5, originY: 0.97 }} animate={p.body} transition={p.bodyT} draggable={false} alt="" />
        <motion.div className="absolute inset-0" style={{ originX: 0.51, originY: 0.64 }} animate={p.head} transition={p.headT}>
          <img src={headArt} className={LAYER} style={PIXEL} draggable={false} alt="" />
          <Eyelid left="43%" mood={active} />
          <Eyelid left="65.6%" mood={active} />
        </motion.div>
      </motion.div>

      {active === "think" && (
        <div className="absolute -right-1 top-0 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-400" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
          ))}
        </div>
      )}
      {active === "cheer" &&
        ["-left-2 top-3", "-right-2 top-1", "right-3 -top-3"].map((pos, i) => (
          <motion.span
            key={pos}
            className={`pointer-events-none absolute ${pos} text-amber-400`}
            style={{ fontSize: Math.max(10, size * 0.18) }}
            animate={{ scale: [0.5, 1.25, 0.5], rotate: [0, 40, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.2 }}
          >
            ✦
          </motion.span>
        ))}
      {active === "sad" && (
        <motion.span className="pointer-events-none absolute right-0 top-2 text-sky-400" style={{ fontSize: Math.max(10, size * 0.16) }} animate={{ y: [0, 6, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          💧
        </motion.span>
      )}
      <AnimatePresence>
        {boop > 0 && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.6 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[11px] font-black text-white"
          >
            Woof!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Byte with a speech bubble to its right */
export function MascotSays({ children, mood = "wave", size = 72 }: { children: ReactNode; mood?: Mood; size?: number }) {
  return (
    <div className="flex items-end gap-2">
      <Mascot mood={mood} size={size} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -6 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="relative mb-3 min-w-0 flex-1 rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 font-bold leading-snug shadow-card"
      >
        <span className="absolute -left-[9px] bottom-4 h-4 w-4 rotate-45 border-b-2 border-l-2 border-stone-200 bg-white" />
        <span className="relative">{children}</span>
      </motion.div>
    </div>
  );
}
