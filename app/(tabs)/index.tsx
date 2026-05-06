import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AlarmScreen from '@/components/riko/alarm-screen';
import BottomCard from '@/components/riko/bottom-card';
import MonitoringHUD from '@/components/riko/monitoring-hud';
import RikoMap from '@/components/riko/riko-map';
import SoundPicker from '@/components/riko/sound-picker';
import { useRikoLocationTracking } from '@/hooks/use-riko-location';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [soundPickerVisible, setSoundPickerVisible] = useState(false);

  useRikoLocationTracking();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.constellation} />
      <View style={styles.mapWrap}>
        <RikoMap />
      </View>

      <View style={styles.topOverlay} pointerEvents="none">
        <View style={styles.brandCard}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>R</Text>
          </View>
          <View>
            <Text style={styles.brandMini}>RIKO</Text>
            <Text style={styles.brandMain}>Transit Hub</Text>
          </View>
        </View>
      </View>

      <MonitoringHUD />
      <BottomCard onOpenSoundPicker={() => setSoundPickerVisible(true)} />
      <AlarmScreen />
      <SoundPicker visible={soundPickerVisible} onClose={() => setSoundPickerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050b18',
  },
  mapWrap: {
    flex: 1,
  },
  constellation: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    zIndex: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandCard: {
    backgroundColor: 'rgba(13,27,62,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7986cb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#050b18',
    fontWeight: '900',
  },
  brandMini: {
    color: '#7986cb',
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: '800',
  },
  brandMain: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
