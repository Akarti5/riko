# RIKÔ - Destination Alarm Transit Assistant

RIKÔ is a high-performance transit companion designed for travelers who fall asleep on trains, buses, or in ride-shares. It uses real-time GPS geofencing to ensure you never miss your stop.

## Core Features
- **Dark Mode Aesthetic**: A midnight-inspired interface optimized for night travel.
- **Precision Geofencing**: Set a custom alarm radius (200m to 2km).
- **Hardened Alarm**: Full-screen takeover with hold-to-dismiss logic to prevent accidental wake-up silences.
- **Live Distance Tracking**: Real-time counter showing exactly how far you are from your destination.

## Mobile Implementation Roadmap (Expo)

This web prototype demonstrates the UI and core logic. For a production mobile deployment, follow these steps:

### 1. Permissions configuration
Add the following to your `app.json` / `Info.plist` / `AndroidManifest.xml`:
- **iOS**: `NSLocationAlwaysAndWhenInUseUsageDescription`, `UIBackgroundModes: ['location', 'audio']`
- **Android**: `ACCESS_BACKGROUND_LOCATION`, `WAKE_LOCK`, `FOREGROUND_SERVICE`

### 2. Geofencing with Expo Task Manager
Use `expo-location` with `startGeofencingAsync`.
```typescript
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const GEOFENCE_TASK_NAME = 'riko-geofence-alarm';

TaskManager.defineTask(GEOFENCE_TASK_NAME, ({ data: { eventType, region }, error }) => {
  if (error) return;
  if (eventType === Location.GeofencingEventType.Enter) {
    // Trigger alarm notification or foreground service
  }
});
```

### 3. Native Alarm Reliability
To bypass silent mode on Android:
- Use a **Foreground Service** with a high-priority notification.
- Use `audioAttributes` with `CONTENT_TYPE_SONIFICATION` and `USAGE_ALARM`.

### 4. Critical Alerts on iOS
Request the `com.apple.developer.usernotifications.critical-alerts` entitlement to play sound even when the device is muted.

## Tech Stack (Web Prototype)
- **Vite + React 18**
- **Tailwind CSS 4**
- **Zustand** (State Management)
- **Leaflet** (Mapping)
- **Motion (Framer Motion)** (Animations)
- **Lucide React** (Icons)
