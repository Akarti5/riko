import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Dynamic detection of Expo Go
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export default function RootLayout() {
  useEffect(() => {
    async function setupNotifications() {
      // 1. Skip entirely on Android Expo Go to avoid the hard error
      if (Platform.OS === 'android' && isExpoGo) {
        console.warn('Notifications disabled in Expo Go. Use Development Build for full feature set.');
        return;
      }

      try {
        // Use require to avoid top-level import side effects
        const Notifications = require('expo-notifications');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      } catch (e) {
        // Fail silently if library is missing or restricted
      }
    }

    setupNotifications();
  }, []);

  const appDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.surface,
      text: Colors.dark.text,
      primary: Colors.dark.orange,
      border: Colors.dark.border,
      notification: Colors.dark.orange,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={appDarkTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
