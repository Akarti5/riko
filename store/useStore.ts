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

/**
 * HIGH-PERFORMANCE DISTANCE CALCULATION
 * Optimized for 0.1s (10Hz) updates on mobile hardware.
 * Uses Equirectangular approximation which is significantly faster than Haversine
 * for local distances (under 100km) as it avoids multiple sin/cos/atan2 calls.
 */
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS = 6371000; // in meters

export const calculateDistance = (p1: Location, p2: Location): number => {
  const lon1 = p1.longitude * DEG_TO_RAD;
  const lon2 = p2.longitude * DEG_TO_RAD;
  const lat1 = p1.latitude * DEG_TO_RAD;
  const lat2 = p2.latitude * DEG_TO_RAD;

  const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  const y = lat2 - lat1;
  
  return Math.sqrt(x * x + y * y) * EARTH_RADIUS;
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
        const { destination, isArmed, config, isAlarmFiring } = get();
        
        let newDistance = null;
        let firingState = isAlarmFiring;

        if (destination) {
          newDistance = calculateDistance(loc, destination);
          if (isArmed && !isAlarmFiring && newDistance <= config.radius) {
            firingState = true;
          }
        }

        // BATCH UPDATE: Single state change for better performance at 10Hz
        set({ 
          userLocation: loc, 
          distance: newDistance,
          isAlarmFiring: firingState 
        });
      },

      setDestination: (loc, name) => {
        const { userLocation } = get();
        const dist = userLocation ? calculateDistance(userLocation, loc) : null;
        
        set({ 
          destination: loc, 
          destinationName: name || (loc ? 'Unnamed Location' : null),
          distance: dist
        });
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
        destinationName: state.destinationName,
        isArmed: state.isArmed
      }),
    }
  )
);
