import { create } from 'zustand';

interface Location {
  lat: number;
  lng: number;
}

interface AlarmConfig {
  soundId: string;
  radius: number; // in meters
}

interface RikoState {
  userLocation: Location | null;
  destination: Location | null;
  destinationName: string | null;
  isArmed: boolean;
  isAlarmFiring: boolean;
  config: AlarmConfig;
  distance: number | null; // in meters
  centerTrigger: number;

  setUserLocation: (loc: Location) => void;
  setDestination: (loc: Location, name?: string) => void;
  setRadius: (radius: number) => void;
  setSoundId: (id: string) => void;
  armAlarm: () => void;
  disarmAlarm: () => void;
  dismissAlarm: () => void;
  updateDistance: (dist: number) => void;
  triggerCenter: () => void;
}

const haversineDistance = (p1: Location, p2: Location): number => {
  const R = 6371e3; // meters
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
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
    soundId: 'default',
    radius: 500,
  },

  setUserLocation: (loc) => {
    set({ userLocation: loc });
    const { destination, isArmed, config } = get();
    if (destination) {
      const dist = haversineDistance(loc, destination);
      set({ distance: dist });
      
      if (isArmed && dist <= config.radius) {
        set({ isAlarmFiring: true });
      }
    }
  },

  setDestination: (loc, name) => {
    set({ destination: loc, destinationName: name || 'Selected Destination' });
    const { userLocation } = get();
    if (userLocation) {
      set({ distance: haversineDistance(userLocation, loc) });
    }
  },

  setRadius: (radius) => set((state) => ({ config: { ...state.config, radius } })),
  setSoundId: (id) => set((state) => ({ config: { ...state.config, soundId: id } })),
  
  armAlarm: () => {
    const { destination } = get();
    if (destination) {
      set({ isArmed: true });
    }
  },

  disarmAlarm: () => set({ isArmed: false, isAlarmFiring: false }),
  dismissAlarm: () => set({ isAlarmFiring: false, isArmed: false }),
  updateDistance: (dist) => set({ distance: dist }),
  triggerCenter: () => set((state) => ({ centerTrigger: state.centerTrigger + 1 })),
}));
