import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRikoStore } from '../store/useStore';
import { Colors } from '../constants/theme';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;
const KNOB_SIZE = 64;
const TRACK_END = SLIDER_WIDTH - KNOB_SIZE - 8;

export default function AlarmScreen() {
  const { isAlarmFiring, destinationName, dismissAlarm, config } = useRikoStore();
  
  const player = useAudioPlayer(config.soundUri || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  const status = useAudioPlayerStatus(player);

  const pulse = useSharedValue(0);
  const screenOpacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  useEffect(() => {
    if (isAlarmFiring) {
      screenOpacity.value = withTiming(1, { duration: 300 });
      pulse.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      
      player.loop = true;
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
      translateX.value = 0;
      player.pause();
    }
  }, [isAlarmFiring]);

  const slideGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newX = startX.value + event.translationX;
      translateX.value = Math.max(0, Math.min(newX, TRACK_END));
    })
    .onEnd(() => {
      if (translateX.value > TRACK_END * 0.8) {
        translateX.value = withTiming(TRACK_END);
        runOnJS(dismissAlarm)();
      } else {
        translateX.value = withTiming(0);
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, TRACK_END * 0.5], [1, 0]),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: interpolate(screenOpacity.value, [0, 1], [height, 0]) }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.6, 0]),
  }));

  return (
    <Animated.View 
      style={[styles.container, containerStyle]} 
      pointerEvents={isAlarmFiring ? 'auto' : 'none'}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.ripple, pulseStyle]} />
        <Animated.View style={[styles.ripple, pulseStyle]} />

        <View style={styles.iconCircle}>
          <Bell size={64} color="#000" />
        </View>

        <Text style={styles.title}>ARRIVED</Text>
        <Text style={styles.destinationName}>{destinationName}</Text>
        <Text style={styles.message}>You have reached your destination radius.</Text>

        {/* Slide to Dismiss Bar */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.Text style={[styles.sliderTrackText, trackTextStyle]}>
              SLIDE TO DISMISS
            </Animated.Text>
            <GestureDetector gesture={slideGesture}>
              <Animated.View style={[styles.knob, knobStyle]}>
                <ChevronRight size={32} color="#FFF" />
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050b18',
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 80,
    lineHeight: 20,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 80,
    justifyContent: 'center',
    marginTop: 20,
  },
  sliderTrack: {
    width: '100%',
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 36,
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sliderTrackText: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
    marginLeft: 32,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: Colors.dark.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
