import { motion, AnimatePresence } from 'motion/react';
import { useRikoStore } from '../store/useStore';
import { Bell, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AlarmScreen() {
  const { isAlarmFiring, destinationName, dismissAlarm } = useRikoStore();
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isAlarmFiring) {
      // Logic for audio could go here
      // For now we just use a beep or visual-only in first iteration
    }
    return () => clearInterval(interval);
  }, [isAlarmFiring]);

  const handleDismissStart = () => {
    const start = Date.now();
    const duration = 2000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setHoldProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        dismissAlarm();
        setHoldProgress(0);
      }
    }, 16);

    const cleanup = () => {
      clearInterval(interval);
      setHoldProgress(0);
    };

    window.addEventListener('mouseup', cleanup);
    window.addEventListener('touchend', cleanup);
  };

  if (!isAlarmFiring) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#050b18] flex flex-col items-center justify-center p-6 overflow-hidden"
      >
        {/* Pulsing Background Glow */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-accent-primary/20 rounded-full blur-[120px]"
        />

        <div className="relative z-10 text-center flex flex-col items-center max-w-sm">
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="w-24 h-24 bg-accent-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(121,134,203,0.5)] mb-8"
          >
            <Bell className="w-12 h-12 text-background-base" fill="currentColor" />
          </motion.div>

          <h1 className="text-5xl font-display font-black text-white mb-4 leading-tight">
            YOU HAVE<br />ARRIVED
          </h1>

          <div className="flex items-center justify-center bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 mb-12">
            <MapPin className="w-5 h-5 text-accent-secondary mr-2" />
            <span className="text-text-primary font-medium tracking-wide">
              {destinationName}
            </span>
          </div>

          <div className="w-full space-y-4">
            <button
              onMouseDown={handleDismissStart}
              onTouchStart={handleDismissStart}
              className="relative w-full h-20 bg-accent-primary rounded-3xl overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-[16ms]"
                style={{ width: `${holdProgress * 100}%` }}
              />
              <span className="relative z-10 font-display font-black text-xl text-background-base uppercase tracking-widest">
                Hold to Dismiss
              </span>
            </button>

            <button
              onClick={dismissAlarm}
              className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl font-display font-bold text-text-muted hover:bg-white/10 transition-colors"
            >
              Snooze (300m)
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 text-text-muted/30 font-mono text-[10px] uppercase tracking-[0.3em]">
          Rikô System Alert
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
