import { motion, AnimatePresence } from 'motion/react';
import { useRikoStore } from '../store/useStore';

export default function MonitoringHUD() {
  const isArmed = useRikoStore((state) => state.isArmed);
  const distance = useRikoStore((state) => state.distance);
  const radius = useRikoStore((state) => state.config.radius);

  const progress = distance !== null ? Math.max(0, Math.min(1, distance / (radius * 2))) : 1;

  return (
    <AnimatePresence>
      {isArmed && distance !== null && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Progress Arc SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-white/5"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray="691.15"
                  animate={{ strokeDashoffset: 691.15 * progress }}
                  className="text-accent-primary"
                  strokeLinecap="round"
                  transition={{ type: 'spring', damping: 20 }}
                />
              </svg>

              <div className="text-center z-10">
                <div className="text-[10px] text-text-muted font-black uppercase tracking-[0.4em] mb-1">Approach</div>
                <div className="text-5xl font-display font-black text-white">
                  {distance > 1000 ? (distance/1000).toFixed(1) : Math.round(distance)}
                </div>
                <div className="text-xs text-accent-secondary font-bold uppercase tracking-wider mt-1">
                  {distance > 1000 ? 'Kilometers' : 'Meters'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Screen Edge Alert Glow when Monitoring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-0 border-[20px] border-accent-primary/20 blur-xl"
          />
        </>
      )}
    </AnimatePresence>
  );
}
