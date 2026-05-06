import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRikoStore } from '../store/useStore';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 260;
const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function MonitoringHUD() {
  const { distance, isArmed, config } = useRikoStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isArmed && distance !== null) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Calculate progress (distance / (radius * 2) like in web version)
      const progress = Math.max(0, Math.min(1, distance / (config.radius * 2)));
      Animated.spring(progressAnim, {
        toValue: progress,
        useNativeDriver: false, // SVG props often don't support native driver for strokeDashoffset
        damping: 20,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isArmed, distance, config.radius]);

  if (!isArmed || distance === null) return null;

  const displayDistance = distance > 1000 
    ? (distance / 1000).toFixed(1) 
    : Math.round(distance);
    
  const unitLabel = distance > 1000 ? 'KILOMETERS' : 'METERS';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
      <View style={styles.hudWrapper}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
          {/* Background Ring */}
          <Circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="12"
          />
          {/* Progress Ring */}
          <AnimatedCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={Colors.dark.orange}
            strokeWidth="12"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, CIRCUMFERENCE],
            })}
            strokeLinecap="round"
            rotation="-90"
            origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
          />
        </Svg>

        <View style={styles.textContainer}>
          <Text style={styles.approachText}>APPROACH</Text>
          <Text style={styles.distanceValue}>{displayDistance}</Text>
          <Text style={styles.unitText}>{unitLabel}</Text>
        </View>
      </View>
      
      {/* Glow Effect */}
      <View style={styles.glowOverlay} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    pointerEvents: 'none',
  },
  hudWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  approachText: {
    fontSize: 10,
    color: Colors.dark.muted,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 56,
    color: '#FFF',
    fontWeight: '900',
    includeFontPadding: false,
  },
  unitText: {
    fontSize: 12,
    color: Colors.dark.orange,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 20,
    borderColor: 'rgba(254, 102, 21, 0.05)',
    borderRadius: 40,
  },
});
