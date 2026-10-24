import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import byteArt from "../assets/byte.png";

/**
 * Decoded's mascot: Byte, the curious corgi.
 * To swap the character, replace src/assets/byte.png (transparent PNG) and MASCOT_NAME.
 * Moods: wave (hello), think (working), cheer (success), point (look here).
 */
export const MASCOT_NAME = "Byte";
export type Mood = "wave" | "think" | "cheer" | "point";

const MOTION: Record<Mood, { animate: Record<string, number[] | number>; duration: number }> = {
  wave: { animate: { rotate: [0, -6, 6, -4, 0], y: [0, -2, 0] }, duration: 2.2 },   // happy tail-wag wiggle
  think: { animate: { rotate: -6, y: [0, -3, 0] }, duration: 2.6 },                  // head tilt
  cheer: { animate: { y: [0, -16, 0], scale: [1, 1.06, 1] }, duration: 0.7 },        // excited hops
  point: { animate: { rotate: 5, x: [0, 3, 0] }, duration: 1.4 },                    // leaning in
};

export function Mascot({ mood = "wave", size = 96 }: { mood?: Mood; size?: number }) {
  const reduce = useReducedMotion();
  const m = MOTION[mood];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.img
        src={byteArt}
        alt={`${MASCOT_NAME} the corgi`}
        draggable={false}
        className="h-full w-full select-none object-contain"
        style={{ imageRendering: "pixelated" }}
        animate={reduce ? undefined : m.animate}
        transition={{ repeat: Infinity, duration: m.duration, ease: "easeInOut", repeatDelay: mood === "wave" ? 0.6 : 0 }}
      />
      {mood === "think" && !reduce && (
        <div className="absolute -right-1 -top-1 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-brand-400"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}
      {mood === "cheer" && !reduce && (
        <>
          {["-left-2 top-2", "-right-2 top-0", "right-2 -top-3"].map((pos, i) => (
            <motion.span
              key={pos}
              className={`absolute ${pos} text-amber-400`}
              style={{ fontSize: size * 0.18 }}
              animate={{ scale: [0.6, 1.2, 0.6], rotate: [0, 30, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}
            >
              ✦
            </motion.span>
          ))}
        </>
      )}
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
