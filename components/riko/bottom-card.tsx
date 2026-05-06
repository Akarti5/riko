import { ChevronUp, LocateFixed, MapPin, Volume2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRikoStore } from '@/lib/riko-store';

type Props = {
  onOpenSoundPicker: () => void;
};

const clampRadius = (value: number) => Math.max(200, Math.min(2000, value));

export default function BottomCard({ onOpenSoundPicker }: Props) {
  const destination = useRikoStore((state) => state.destination);
  const destinationName = useRikoStore((state) => state.destinationName);
  const distance = useRikoStore((state) => state.distance);
  const radius = useRikoStore((state) => state.config.radius);
  const soundId = useRikoStore((state) => state.config.soundId);
  const isArmed = useRikoStore((state) => state.isArmed);
  const setRadius = useRikoStore((state) => state.setRadius);
  const armAlarm = useRikoStore((state) => state.armAlarm);
  const disarmAlarm = useRikoStore((state) => state.disarmAlarm);
  const triggerCenter = useRikoStore((state) => state.triggerCenter);

  const ratio = (radius - 200) / 1800;
  const formattedDistance =
    distance === null ? '-- m' : distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`;

  return (
    <View style={styles.outer}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.title}>
            {destinationName ?? 'Set Destination'}
          </Text>
          <View style={styles.subRow}>
            <MapPin size={14} color="#7986cb" />
            <Text style={styles.subText}>
              {isArmed ? 'Scanning position...' : destination ? 'Ready to track' : 'Tap map to pin your stop'}
            </Text>
          </View>
        </View>

        <View style={styles.distanceWrap}>
          <Text style={styles.distanceValue}>{formattedDistance}</Text>
          <Text style={styles.distanceLabel}>DISTANCE</Text>
        </View>
      </View>

      {!isArmed && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.smallLabel}>ALARM RADIUS</Text>
            <Text style={styles.radiusValue}>{radius}m</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(4, ratio * 100)}%` }]} />
          </View>
          <View style={styles.rowBetween}>
            <Pressable style={styles.radiusButton} onPress={() => setRadius(clampRadius(radius - 100))}>
              <Text style={styles.radiusButtonText}>-100m</Text>
            </Pressable>
            <Pressable style={styles.radiusButton} onPress={() => setRadius(clampRadius(radius + 100))}>
              <Text style={styles.radiusButtonText}>+100m</Text>
            </Pressable>
          </View>

          <Pressable style={styles.soundCard} onPress={onOpenSoundPicker}>
            <View style={styles.soundLeft}>
              <View style={styles.soundIcon}>
                <Volume2 size={16} color="#7986cb" />
              </View>
              <View>
                <Text style={styles.soundTitle}>Alarm Sound</Text>
                <Text style={styles.soundSub}>{soundId}</Text>
              </View>
            </View>
            <ChevronUp size={16} color="#90a4ae" />
          </Pressable>
        </>
      )}

      <View style={styles.footerActions}>
        <Pressable style={styles.centerButton} onPress={triggerCenter}>
          <LocateFixed size={16} color="#7986cb" />
        </Pressable>
        {!isArmed ? (
          <Pressable style={[styles.cta, !destination && styles.ctaDisabled]} onPress={armAlarm} disabled={!destination}>
            <Text style={styles.ctaText}>ARM ALARM</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.ctaDisarm} onPress={disarmAlarm}>
            <Text style={styles.ctaDisarmText}>DISARM</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    zIndex: 9,
    backgroundColor: 'rgba(13, 27, 62, 0.94)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subText: {
    color: '#90a4ae',
    fontSize: 12,
  },
  distanceWrap: {
    alignItems: 'flex-end',
  },
  distanceValue: {
    color: '#80cbc4',
    fontSize: 24,
    fontWeight: '900',
  },
  distanceLabel: {
    color: '#90a4ae',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  smallLabel: {
    color: '#e8eaf6',
    fontSize: 11,
    letterSpacing: 1.3,
    fontWeight: '700',
  },
  radiusValue: {
    color: '#7986cb',
    fontWeight: '700',
  },
  track: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    marginTop: 8,
  },
  fill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#7986cb',
  },
  radiusButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    marginTop: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  radiusButtonText: {
    color: '#e8eaf6',
    fontWeight: '600',
  },
  soundCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  soundIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(121,134,203,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundTitle: {
    color: '#e8eaf6',
    fontWeight: '700',
  },
  soundSub: {
    color: '#90a4ae',
    fontSize: 12,
    marginTop: 2,
  },
  footerActions: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  centerButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#7986cb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    color: '#050b18',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  ctaDisarm: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  ctaDisarmText: {
    color: '#ef4444',
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
