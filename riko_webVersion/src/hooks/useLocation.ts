/** @license SPDX-License-Identifier: Apache-2.0 */
import { useEffect } from 'react';
import { useRikoStore } from '../store/useStore';

export function useLocationTracking() {
  const setUserLocation = useRikoStore((state) => state.setUserLocation);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [setUserLocation]);
}
