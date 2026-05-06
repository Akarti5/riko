import { Bell, MapPin } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRikoStore } from '@/lib/riko-store';

export default function AlarmScreen() {
  const isAlarmFiring = useRikoStore((state) => state.isAlarmFiring);
  const destinationName = useRikoStore((state) => state.destinationName);
  const dismissAlarm = useRikoStore((state) => state.dismissAlarm);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isAlarmFiring) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 850, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 850, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isAlarmFiring, pulseAnim]);

  const startHold = () => {
    const started = Date.now();
    holdRef.current = setInterval(() => {
      const progress = Math.min((Date.now() - started) / 2000, 1);
      setHoldProgress(progress);
      if (progress >= 1) {
        clearInterval(holdRef.current as ReturnType<typeof setInterval>);
        holdRef.current = null;
        setHoldProgress(0);
        dismissAlarm();
      }
    }, 16);
  };

  const endHold = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
    setHoldProgress(0);
  };

  if (!isAlarmFiring) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.glow, { opacity: pulseAnim }]} />
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Bell size={40} color="#050b18" fill="#050b18" />
        </View>
        <Text style={styles.title}>YOU HAVE ARRIVED</Text>
        <View style={styles.pill}>
          <MapPin size={16} color="#80cbc4" />
          <Text style={styles.pillText}>{destinationName ?? 'Selected Destination'}</Text>
        </View>

        <Pressable style={styles.dismissBtn} onPressIn={startHold} onPressOut={endHold}>
          <View style={[styles.dismissProgress, { width: `${holdProgress * 100}%` }]} />
          <Text style={styles.dismissText}>HOLD TO DISMISS</Text>
        </Pressable>

        <Pressable style={styles.snoozeBtn} onPress={dismissAlarm}>
          <Text style={styles.snoozeText}>Snooze (300m)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: '#050b18',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  glow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(121,134,203,0.35)',
  },
  center: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#7986cb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 40,
    textAlign: 'center',
    fontWeight: '900',
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 22,
  },
  pillText: {
    color: '#e8eaf6',
    fontWeight: '600',
  },
  dismissBtn: {
    width: '100%',
    height: 74,
    borderRadius: 22,
    backgroundColor: '#7986cb',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dismissProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dismissText: {
    color: '#050b18',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  snoozeBtn: {
    width: '100%',
    height: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  snoozeText: {
    color: '#90a4ae',
    fontWeight: '700',
  },
});
