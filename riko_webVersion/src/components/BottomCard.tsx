import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Bell, Radio, ChevronUp, ChevronDown, CheckCircle2, Volume2 } from 'lucide-react';
import { useRikoStore } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SoundPicker from './SoundPicker';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BottomCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const {
    destination,
    destinationName,
    distance,
    config,
    isArmed,
    setRadius,
    armAlarm,
    disarmAlarm
  } = useRikoStore();

  const formattedDistance = distance 
    ? distance > 1000 
      ? (distance / 1000).toFixed(1) + ' km'
      : Math.round(distance) + ' m'
    : '-- m';

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-8 pointer-events-none">
        <motion.div
          layout
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          className="max-w-md mx-auto w-full bg-background-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
        >
          {/* Handle */}
          <div 
            className="flex flex-col items-center py-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mb-1" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-white mb-1 truncate">
                  {destinationName || 'Set Destination'}
                </h2>
                <div className="flex items-center text-text-muted text-sm capitalize">
                  <MapPin className="w-4 h-4 mr-1 text-accent-primary" />
                  {isArmed ? 'Scanning position...' : (destination ? 'Ready to track' : 'Tap on map to pin your stop')}
                </div>
              </div>
              {distance !== null && (
                <div className="text-right pl-4">
                  <span className="block text-2xl font-display font-extrabold text-accent-secondary">
                    {formattedDistance}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-text-muted">Distance</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {(isExpanded || !isArmed) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  {/* Radius Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                        Alarm Radius
                      </label>
                      <span className="text-xs font-mono text-accent-primary">{config.radius}m</span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="range"
                        min="200"
                        max="2000"
                        step="100"
                        value={config.radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        disabled={isArmed}
                        className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent-primary disabled:opacity-50"
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-text-muted font-medium">
                      <span>200m</span>
                      <span>2km</span>
                    </div>
                  </div>

                  {/* Sound Selector */}
                  <div 
                    onClick={() => !isArmed && setIsSoundPickerOpen(true)}
                    className={cn(
                      "flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors cursor-pointer",
                      !isArmed && "hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center mr-4">
                        <Volume2 className="w-5 h-5 text-accent-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">Alarm Sound</div>
                        <div className="text-xs text-text-muted underline decoration-accent-primary/30">Radar Transit</div>
                      </div>
                    </div>
                    {!isArmed && <ChevronUp className="w-4 h-4 text-text-muted" />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6">
              {!isArmed ? (
                <button
                  onClick={armAlarm}
                  disabled={!destination}
                  className={cn(
                    "group relative w-full py-4 rounded-2xl font-display font-extrabold text-lg transition-all duration-300 overflow-hidden",
                    destination 
                      ? "bg-accent-primary text-background-base shadow-[0_0_20px_rgba(121,134,203,0.3)] hover:scale-[1.02] active:scale-[0.98]" 
                      : "bg-white/5 text-text-muted border border-white/5 cursor-not-allowed"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center uppercase tracking-widest">
                    Arm Alarm
                  </span>
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={disarmAlarm}
                    className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-display font-black uppercase tracking-wider hover:bg-red-500/20 transition-all text-sm"
                  >
                    Disarm
                  </button>
                  <div className="flex-[2] flex items-center justify-center bg-accent-primary/10 border border-accent-primary/20 text-accent-primary rounded-2xl px-4 animate-pulse">
                    <Bell className="w-4 h-4 mr-2" />
                    <span className="font-display font-black uppercase tracking-wider text-sm">Monitoring</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <SoundPicker 
        isOpen={isSoundPickerOpen} 
        onClose={() => setIsSoundPickerOpen(false)} 
      />
    </>
  );
}
