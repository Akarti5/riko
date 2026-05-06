import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { useRikoStore } from '../store/useStore';
import { Colors } from '../constants/theme';
import { Bell, XCircle } from 'lucide-react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const DEFAULT_ALARM_URI = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function AlarmScreen() {
  const { isAlarmFiring, destinationName, dismissAlarm, config } = useRikoStore();
  
  // Keep player alive to avoid loading latency
  const player = useAudioPlayer(config.soundUri || DEFAULT_ALARM_URI);
  const status = useAudioPlayerStatus(player);

  const pulse = useSharedValue(0);
  const screenOpacity = useSharedValue(0);

  useEffect(() => {
    if (isAlarmFiring) {
      // Instant visual transition
      screenOpacity.value = withTiming(1, { duration: 300 });
      
      pulse.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      
      // INSTANT PLAYBACK
      player.loop = true;
      player.seekTo(0);
      player.play();

      const interval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 2000);
      
      return () => {
        player.pause();
        player.seekTo(0);
        clearInterval(interval);
      };
    } else {
      screenOpacity.value = withTiming(0, { duration: 300 });
      pulse.value = 0;
      player.pause();
      player.seekTo(0);
    }
  }, [isAlarmFiring, player]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: interpolate(screenOpacity.value, [0, 1], [height, 0]) }],
  }));

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.5]) }],
      opacity: interpolate(pulse.value, [0, 1], [0.6, 0]),
    };
  });

  // Stay mounted for zero-latency trigger, but use pointerEvents to allow map interaction when hidden
  return (
    <Animated.View 
      style={[styles.container, containerStyle]} 
      pointerEvents={isAlarmFiring ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        {/* Animated Ripples */}
        <Animated.View style={[styles.ripple, pulseStyle]} />
        <Animated.View style={[styles.ripple, pulseStyle]} />

        <View style={styles.iconCircle}>
          <Bell size={64} color="#000" />
        </View>

        <Text style={styles.title}>ARRIVED</Text>
        <Text style={styles.destinationName}>{destinationName}</Text>
        <Text style={styles.message}>You have reached your destination radius.</Text>

        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={dismissAlarm}
        >
          <XCircle size={24} color="#FFF" />
          <Text style={styles.dismissText}>DISMISS ALARM</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  ripple: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    backgroundColor: Colors.dark.orange,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.dark.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: Colors.dark.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.dark.orange,
    letterSpacing: 4,
  },
  destinationName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: Colors.dark.muted,
    textAlign: 'center',
    marginBottom: 80,
    lineHeight: 24,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dismissText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
    marginLeft: 12,
    letterSpacing: 1,
  },
});
