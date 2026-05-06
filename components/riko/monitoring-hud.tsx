import { StyleSheet, Text, View } from 'react-native';
import { useRikoStore } from '@/lib/riko-store';

export default function MonitoringHUD() {
  const isArmed = useRikoStore((state) => state.isArmed);
  const distance = useRikoStore((state) => state.distance);

  if (!isArmed || distance === null) return null;

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={styles.haloOuter} />
      <View style={styles.haloInner} />
      <Text style={styles.label}>APPROACH</Text>
      <Text style={styles.value}>{distance > 1000 ? (distance / 1000).toFixed(1) : Math.round(distance)}</Text>
      <Text style={styles.unit}>{distance > 1000 ? 'KILOMETERS' : 'METERS'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: '34%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 7,
  },
  haloOuter: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 10,
    borderColor: 'rgba(121, 134, 203, 0.14)',
  },
  haloInner: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    borderWidth: 2,
    borderColor: 'rgba(121, 134, 203, 0.5)',
  },
  label: {
    color: '#90a4ae',
    fontSize: 10,
    letterSpacing: 3.5,
    marginBottom: 8,
    fontWeight: '800',
  },
  value: {
    color: '#ffffff',
    fontSize: 52,
    fontWeight: '900',
  },
  unit: {
    color: '#80cbc4',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 3,
    fontWeight: '700',
  },
});
