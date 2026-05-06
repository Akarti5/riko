import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRikoStore } from '../store/useStore';
import { Colors } from '../constants/theme';
import { Navigation, Clock } from 'lucide-react-native';

export default function MonitoringHUD() {
  const { distance, isArmed } = useRikoStore();

  if (!isArmed || distance === null) return null;

  const displayDistance = distance > 1000 
    ? `${(distance / 1000).toFixed(1)} km` 
    : `${Math.round(distance)} m`;

  return (
    <View style={styles.container}>
      <View style={styles.hudItem}>
        <Navigation size={14} color={Colors.dark.orange} />
        <Text style={styles.label}>DISTANCE</Text>
        <Text style={styles.value}>{displayDistance}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.hudItem}>
        <Clock size={14} color={Colors.dark.orange} />
        <Text style={styles.label}>STATUS</Text>
        <Text style={[styles.value, { color: Colors.dark.orange }]}>TRACKING</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  hudItem: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 9,
    color: Colors.dark.muted,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  value: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'System', // Syne isn't loaded yet, keeping it system for now
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
});
