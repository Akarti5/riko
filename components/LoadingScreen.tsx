import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';


export default function LoadingScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    // Breathing pulse animation on the logo container
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
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
        {/* Use ActivityIndicator instead of SVG — SVG can crash on Huawei/non-GMS devices */}
        <ActivityIndicator
          size={80}
          color={Colors.dark.orange}
        />
        <View style={styles.centerDot} />
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>RIKÔ</Text>
        <Text style={styles.subtitle}>ACQUIRING POSITION...</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}> © By Eddy Francisco. All rights reserved.</Text>
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
