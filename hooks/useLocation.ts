import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useRikoStore, calculateDistance } from '../store/useStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, Vibration } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

const LOCATION_TASK_NAME = 'background-location-task';
const IS_EXPO_GO = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Notification ID for tracking updates
const MONITORING_NOTIFICATION_ID = 'riko-monitoring';

// Notification channel setup for Android (required for vibration)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('riko-alarm', {
    name: 'Rikô Alarms',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 200, 500],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
    enableVibrate: true,
    bypassDnd: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    }
  });
}

export function useLocationTracking() {
  const { setUserLocation, isArmed, destination, destinationName, config } = useRikoStore();
  
  useKeepAwake();

  useEffect(() => {
    let foregroundSubscription: Location.LocationSubscription | null = null;

    const setupTracking = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') return;

      // Request notification permissions
      await Notifications.requestPermissionsAsync();

      // FAST FIX: Get last known or quick position immediately to hide loading screen
      const quickPos = await Location.getLastKnownPositionAsync();
      if (quickPos) {
        setUserLocation({
          latitude: quickPos.coords.latitude,
          longitude: quickPos.coords.longitude,
        });
      } else {
        // If no last known, get a fast (low accuracy) fix
        const fastPos = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced 
        }).catch(() => null);
        if (fastPos) {
          setUserLocation({
            latitude: fastPos.coords.latitude,
            longitude: fastPos.coords.longitude,
          });
        }
      }

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
              notificationTitle: `Tracking ${destinationName}`,
              notificationBody: 'Calculating distance...',
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

    // Update in-app state (this will be seen when the app is reopened)
    state.setUserLocation(currentLoc);

    if (state.destination && state.isArmed) {
      const dist = calculateDistance(currentLoc, state.destination);
      const formattedDist = dist > 1000 
        ? `${(dist / 1000).toFixed(1)}km` 
        : `${Math.round(dist)}m`;

      // Update the Primary (and only) Notification
      if (!state.isAlarmFiring) {
        // We update the foreground service directly to avoid duplicate notifications
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0,
          deferredUpdatesInterval: 100,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: `Tracking ${state.destinationName}`,
            notificationBody: `Distance: ${formattedDist}`,
            notificationColor: '#FE6615',
          },
        });

        // Trigger alarm if within radius
        if (dist <= state.config.radius) {
          // Intense "Rapid Pulse" vibration
          Vibration.vibrate([0, 800, 200, 800, 200, 800, 200, 800]);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🚨 ARRIVED NEAR DESTINATION!",
              body: `Wake up! You are within ${state.config.radius}m of ${state.destinationName}.`,
              sound: true, // This will use the ALARM stream defined in the channel
              priority: Notifications.AndroidNotificationPriority.MAX,
              vibrate: [0, 1000, 500, 1000],
              categoryIdentifier: 'alarm',
            },
            trigger: {
              channelId: 'riko-alarm'
            } as any,
          });
        }
      }
    }
  });
} catch (e) {}
