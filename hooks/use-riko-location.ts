import * as Location from 'expo-location';
import { useEffect } from 'react';
import { useRikoStore } from '@/lib/riko-store';

export function useRikoLocationTracking() {
  const setUserLocation = useRikoStore((state) => state.setUserLocation);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
      );
    };

    void start();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [setUserLocation]);
}
