import { motion, AnimatePresence } from 'motion/react';
import { Radio, Check, Volume2, X } from 'lucide-react';
import { useRikoStore } from '../store/useStore';

const SOUNDS = [
  { id: 'radar', name: 'Radar Transit', desc: 'Sharp digital pulse' },
  { id: 'beacon', name: 'Deep Beacon', desc: 'Low frequency resonance' },
  { id: 'nebula', name: 'Nebula Rise', desc: 'Ethereal synth swell' },
  { id: 'cosmos', name: 'Cosmic Chime', desc: 'Crystal clear bells' },
  { id: 'signal', name: 'Alert Signal', desc: 'Classic urgent tone' },
];

interface SoundPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SoundPicker({ isOpen, onClose }: SoundPickerProps) {
  const { config, setSoundId } = useRikoStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[70] bg-background-surface rounded-t-[40px] border-t border-white/10 p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-display font-black text-white">Select Sound</h3>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setSoundId(sound.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    config.soundId === sound.id
                      ? 'bg-accent-primary/10 border-accent-primary text-accent-primary'
                      : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center text-left">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                      config.soundId === sound.id ? 'bg-accent-primary text-background-base' : 'bg-white/5'
                    }`}>
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-display font-bold ${config.soundId === sound.id ? 'text-white' : 'text-text-primary'}`}>
                        {sound.name}
                      </div>
                      <div className="text-xs opacity-60 font-medium">{sound.desc}</div>
                    </div>
                  </div>
                  {config.soundId === sound.id && (
                    <Check className="w-5 h-5 stroke-[3px]" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-accent-primary text-background-base rounded-2xl font-display font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Confirm Selection
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
