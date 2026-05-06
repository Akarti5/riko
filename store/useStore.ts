import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Location {
  latitude: number;
  longitude: number;
}

interface AlarmConfig {
  soundUri: string | null;
  soundName: string;
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
  setSound: (uri: string | null, name: string) => void;
  armAlarm: () => void;
  disarmAlarm: () => void;
  dismissAlarm: () => void;
  updateDistance: (dist: number) => void;
  triggerCenter: () => void;
}

export const haversineDistance = (p1: Location, p2: Location): number => {
  const R = 6371e3; // meters
  const phi1 = (p1.latitude * Math.PI) / 180;
  const phi2 = (p2.latitude * Math.PI) / 180;
  const dphi = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dlambda = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dphi / 2) * Math.sin(dphi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useRikoStore = create<RikoState>()(
  persist(
    (set, get) => ({
      userLocation: null,
      destination: null,
      destinationName: null,
      isArmed: false,
      isAlarmFiring: false,
      distance: null,
      centerTrigger: 0,
      config: {
        soundUri: null,
        soundName: 'Default System',
        radius: 500,
      },

      setUserLocation: (loc) => {
        set({ userLocation: loc });
        const { destination, isArmed, config, isAlarmFiring } = get();
        if (destination) {
          const dist = haversineDistance(loc, destination);
          set({ distance: dist });
          
          if (isArmed && !isAlarmFiring && dist <= config.radius) {
            set({ isAlarmFiring: true });
          }
        }
      },

      setDestination: (loc, name) => {
        set({ destination: loc, destinationName: name || (loc ? 'Unnamed Location' : null) });
        const { userLocation } = get();
        if (userLocation) {
          set({ distance: haversineDistance(userLocation, loc) });
        }
      },

      setRadius: (radius) => set((state) => ({ config: { ...state.config, radius } })),
      setSound: (uri, name) => set((state) => ({ config: { ...state.config, soundUri: uri, soundName: name } })),
      
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
    }),
    {
      name: 'riko-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        config: state.config, 
        destination: state.destination, 
        destinationName: state.destinationName 
      }),
    }
  )
);
