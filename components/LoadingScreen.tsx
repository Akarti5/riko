import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import { Colors } from '../constants/theme';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Elegant breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width="120" height="120" viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="45"
              stroke={Colors.dark.orange}
              strokeWidth="2"
              fill="none"
              strokeDasharray="150, 100"
              opacity={0.3}
            />
            <Circle
              cx="50"
              cy="50"
              r="35"
              stroke={Colors.dark.orange}
              strokeWidth="4"
              fill="none"
              strokeDasharray="80, 150"
            />
          </Svg>
        </Animated.View>
        <View style={styles.centerDot} />
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>RIKÔ</Text>
        <Text style={styles.subtitle}>ACQUIRING POSITION...</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>HIGH-PRECISION TRANSIT HUB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.orange,
    shadowColor: Colors.dark.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 8,
    marginLeft: 8, // Center offset fix for letter spacing
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark.orange,
    letterSpacing: 2,
    marginTop: 12,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 3,
  },
});
