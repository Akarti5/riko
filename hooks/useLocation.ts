import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect } from 'react';
import { useRikoStore, haversineDistance } from '../store/useStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

const LOCATION_TASK_NAME = 'background-location-task';
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function useLocationTracking() {
  const setUserLocation = useRikoStore((state) => state.setUserLocation);
  
  // Prevent screen from dimming while app is in foreground
  useKeepAwake();

  useEffect(() => {
    let foregroundSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') return;

        foregroundSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 1,
            timeInterval: 500,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );

        if (isExpoGo && Platform.OS === 'android') return;

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            deferredUpdatesInterval: 5000,
            
            // CRITICAL: Ensure tracking stays alive when app is killed or phone is locked
            showsBackgroundLocationIndicator: true,
            
            foregroundService: {
              notificationTitle: 'Rikô Active',
              notificationBody: 'Proximity alarm is monitoring your destination...',
              notificationColor: '#FE6615',
            },
          });
        }
      } catch (error) {}
    };

    startTracking();

    return () => {
      if (foregroundSubscription) {
        foregroundSubscription.remove();
      }
    };
  }, [setUserLocation]);
}

// Background Task Definition
try {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error) return;
    if (data) {
      const { locations } = data;
      const location = locations[0];
      if (location) {
        const state = useRikoStore.getState();
        const currentLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        if (state.destination && state.isArmed && !state.isAlarmFiring) {
          const dist = haversineDistance(currentLoc, state.destination);
          if (dist <= state.config.radius) {
            useRikoStore.getState().setUserLocation(currentLoc);
            
            if (!(isExpoGo && Platform.OS === 'android')) {
              try {
                const Notifications = require('expo-notifications');
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "Arrived near destination!",
                    body: `You are within ${state.config.radius}m of ${state.destinationName}.`,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                  },
                  trigger: null,
                });
              } catch (e) {}
            }
          }
        }
      }
    }
  });
} catch (e) {}
