import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useRikoStore, haversineDistance } from '../store/useStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

const LOCATION_TASK_NAME = 'background-location-task';
const IS_EXPO_GO = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Notification ID for tracking updates
const MONITORING_NOTIFICATION_ID = 'riko-monitoring';

export function useLocationTracking() {
  const { setUserLocation, isArmed, destination, destinationName, config } = useRikoStore();
  
  useKeepAwake();

  useEffect(() => {
    let foregroundSubscription: Location.LocationSubscription | null = null;

    const setupTracking = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') return;

      // Always track in foreground for the map and circular HUD
      foregroundSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0,
          timeInterval: 100, // 0.1s ultra-high frequency ping
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      // Handle Background Logic based on isArmed
      if (isArmed && destination) {
        if (IS_EXPO_GO && Platform.OS === 'android') return;

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 0,
            deferredUpdatesInterval: 100,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'Rikô Tracking Active',
              notificationBody: `Monitoring distance to ${destinationName}...`,
              notificationColor: '#FE6615',
            },
          });
        }
      } else {
        // Stop background task if disarmed
        const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRunning) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          await Notifications.dismissNotificationAsync(MONITORING_NOTIFICATION_ID).catch(() => {});
        }
      }
    };

    setupTracking();

    return () => {
      foregroundSubscription?.remove();
    };
  }, [isArmed, destination]);
}

// Background Task Definition
try {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
    if (error || !data) return;
    
    const { locations } = data;
    const location = locations[0];
    if (!location) return;

    const state = useRikoStore.getState();
    const currentLoc = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Update in-app state
    state.setUserLocation(currentLoc);

    if (state.destination && state.isArmed) {
      const dist = haversineDistance(currentLoc, state.destination);
      const formattedDist = dist > 1000 
        ? `${(dist / 1000).toFixed(1)}km` 
        : `${Math.round(dist)}m`;

      // Update the "Approach" notification
      if (!state.isAlarmFiring) {
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        await Notifications.scheduleNotificationAsync({
          identifier: MONITORING_NOTIFICATION_ID,
          content: {
            title: `Rikô: ${formattedDist} left`,
            body: `Approaching ${state.destinationName}`,
            sticky: true,
          },
          trigger: null,
        });

        // Trigger alarm if within radius
        if (dist <= state.config.radius) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Arrived near destination!",
              body: `You are within ${state.config.radius}m of ${state.destinationName}.`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          });
        }
      }
    }
  });
} catch (e) {}
