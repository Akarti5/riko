import { useLocationTracking } from './hooks/useLocation';
import RikoMap from './components/Map';
import BottomCard from './components/BottomCard';
import AlarmScreen from './components/AlarmScreen';
import MonitoringHUD from './components/MonitoringHUD';
import { useRikoStore } from './store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { LocateFixed } from 'lucide-react';

export default function App() {
  useLocationTracking();
  const triggerCenter = useRikoStore((state) => state.triggerCenter);

  return (
    <div className="fixed inset-0 overflow-hidden bg-background-base select-none">
      {/* Constellation Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-10 overflow-hidden">
        <svg width="100%" height="100%" className="text-accent-primary">
          <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <main className="relative w-full h-full">
        <RikoMap />
        
        {/* Top Overlay UI */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center bg-background-surface/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-auto"
          >
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center mr-3">
              <span className="font-display font-black text-xs text-background-base">R</span>
            </div>
            <div>
              <div className="text-[10px] text-accent-primary font-black uppercase tracking-widest leading-none">Rikô</div>
              <div className="text-sm font-display font-extrabold text-white">Transit Hub</div>
            </div>
          </motion.div>

          <button 
            onClick={triggerCenter}
            className="w-12 h-12 bg-background-surface/80 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-accent-primary shadow-xl pointer-events-auto active:scale-95 transition-transform"
          >
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>

        <MonitoringHUD />
        <BottomCard />
        <AlarmScreen />
      </main>
    </div>
  );
}
