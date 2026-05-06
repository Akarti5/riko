import { create } from 'zustand';

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

interface AlarmConfig {
  soundId: string;
  radius: number;
}

interface RikoState {
  userLocation: LocationPoint | null;
  destination: LocationPoint | null;
  destinationName: string | null;
  isArmed: boolean;
  isAlarmFiring: boolean;
  distance: number | null;
  centerTrigger: number;
  config: AlarmConfig;
  setUserLocation: (loc: LocationPoint) => void;
  setDestination: (loc: LocationPoint, name?: string) => void;
  setRadius: (radius: number) => void;
  setSoundId: (id: string) => void;
  armAlarm: () => void;
  disarmAlarm: () => void;
  dismissAlarm: () => void;
  triggerCenter: () => void;
}

const haversineDistance = (p1: LocationPoint, p2: LocationPoint): number => {
  const R = 6371e3;
  const f1 = (p1.latitude * Math.PI) / 180;
  const f2 = (p2.latitude * Math.PI) / 180;
  const df = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dl = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useRikoStore = create<RikoState>((set, get) => ({
  userLocation: null,
  destination: null,
  destinationName: null,
  isArmed: false,
  isAlarmFiring: false,
  distance: null,
  centerTrigger: 0,
  config: {
    soundId: 'radar',
    radius: 500,
  },
  setUserLocation: (loc) => {
    set({ userLocation: loc });
    const { destination, isArmed, config } = get();
    if (!destination) return;
    const dist = haversineDistance(loc, destination);
    set({ distance: dist });
    if (isArmed && dist <= config.radius) {
      set({ isAlarmFiring: true });
    }
  },
  setDestination: (loc, name) => {
    set({ destination: loc, destinationName: name ?? 'Selected Destination' });
    const userLocation = get().userLocation;
    if (userLocation) {
      set({ distance: haversineDistance(userLocation, loc) });
    }
  },
  setRadius: (radius) => set((state) => ({ config: { ...state.config, radius } })),
  setSoundId: (id) => set((state) => ({ config: { ...state.config, soundId: id } })),
  armAlarm: () => {
    if (get().destination) {
      set({ isArmed: true });
    }
  },
  disarmAlarm: () => set({ isArmed: false, isAlarmFiring: false }),
  dismissAlarm: () => set({ isAlarmFiring: false, isArmed: false }),
  triggerCenter: () => set((state) => ({ centerTrigger: state.centerTrigger + 1 })),
}));
