import { motion } from "framer-motion";

/** Five paw prints that fill up with the user's percentile among Decoded learners */
export function PawMeter({ pct, size = 14 }: { pct: number; size?: number }) {
  const filled = Math.max(1, Math.round(pct / 20));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Ahead of ${pct}% of learners`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: i % 2 ? 12 : -12 }}
          transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
          style={{ fontSize: size, filter: i < filled ? "none" : "grayscale(1)", opacity: i < filled ? 1 : 0.25 }}
        >
          🐾
        </motion.span>
      ))}
    </div>
  );
}
