import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * PLACEHOLDER MASCOT. Swap the <svg> below for the real mascot art (SVG, PNG or Lottie)
 * and keep the same props, so every screen that uses it updates at once.
 * Moods: wave (hello), think (working), cheer (success), point (look here).
 */
export type Mood = "wave" | "think" | "cheer" | "point";

export function Mascot({ mood = "wave", size = 96 }: { mood?: Mood; size?: number }) {
  const eyeY = mood === "think" ? 46 : 50;
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={mood === "cheer" ? { y: [0, -10, 0] } : { y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: mood === "cheer" ? 0.8 : 2.4, ease: "easeInOut" }}
      className="shrink-0"
    >
      <svg viewBox="0 0 120 120" width={size} height={size} aria-label="Decoded mascot">
        {/* antenna */}
        <line x1="60" y1="22" x2="60" y2="10" stroke="#5B21B6" strokeWidth="4" strokeLinecap="round" />
        <motion.circle cx="60" cy="9" r="6" fill="#F97316" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} />
        {/* body */}
        <rect x="18" y="22" width="84" height="80" rx="28" fill="#7C3AED" />
        <rect x="18" y="86" width="84" height="16" rx="8" fill="#6D28D9" />
        {/* face plate */}
        <rect x="28" y="32" width="64" height="48" rx="20" fill="#F5F3FF" />
        {/* eyes */}
        {mood === "cheer" ? (
          <>
            <path d="M40 52 q6 -8 12 0" stroke="#1C1917" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M68 52 q6 -8 12 0" stroke="#1C1917" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <motion.ellipse cx="46" cy={eyeY} rx="5" ry="6.5" fill="#1C1917" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 0.25, repeatDelay: 3.5 }} style={{ originY: `${eyeY}px` }} />
            <motion.ellipse cx="74" cy={eyeY} rx="5" ry="6.5" fill="#1C1917" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 0.25, repeatDelay: 3.5 }} style={{ originY: `${eyeY}px` }} />
            <circle cx="48" cy={eyeY - 2} r="1.8" fill="#fff" />
            <circle cx="76" cy={eyeY - 2} r="1.8" fill="#fff" />
          </>
        )}
        {/* cheeks */}
        <circle cx="37" cy="64" r="4" fill="#F9A8D4" opacity="0.8" />
        <circle cx="83" cy="64" r="4" fill="#F9A8D4" opacity="0.8" />
        {/* mouth */}
        {mood === "think" ? (
          <line x1="54" y1="68" x2="66" y2="66" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" />
        ) : (
          <path d={mood === "cheer" ? "M48 63 q12 14 24 0 z" : "M51 64 q9 8 18 0"} stroke="#1C1917" strokeWidth="3.5" fill={mood === "cheer" ? "#1C1917" : "none"} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* arms */}
        {mood === "wave" ? (
          <motion.rect x="98" y="40" width="12" height="30" rx="6" fill="#7C3AED" style={{ originX: "104px", originY: "68px" }} animate={{ rotate: [10, -25, 10] }} transition={{ repeat: Infinity, duration: 0.9 }} />
        ) : mood === "cheer" ? (
          <>
            <rect x="6" y="30" width="12" height="30" rx="6" fill="#7C3AED" transform="rotate(25 12 58)" />
            <rect x="102" y="30" width="12" height="30" rx="6" fill="#7C3AED" transform="rotate(-25 108 58)" />
          </>
        ) : mood === "point" ? (
          <rect x="100" y="56" width="22" height="11" rx="5.5" fill="#7C3AED" />
        ) : (
          <rect x="44" y="76" width="12" height="22" rx="6" fill="#6D28D9" transform="rotate(-30 50 86)" />
        )}
      </svg>
    </motion.div>
  );
}

/** Mascot with a speech bubble to its right */
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
