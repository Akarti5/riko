import { Check, Volume2, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRikoStore } from '@/lib/riko-store';

const SOUNDS = [
  { id: 'radar', name: 'Radar Transit', desc: 'Sharp digital pulse' },
  { id: 'beacon', name: 'Deep Beacon', desc: 'Low frequency resonance' },
  { id: 'nebula', name: 'Nebula Rise', desc: 'Ethereal synth swell' },
  { id: 'cosmos', name: 'Cosmic Chime', desc: 'Crystal clear bells' },
  { id: 'signal', name: 'Alert Signal', desc: 'Classic urgent tone' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SoundPicker({ visible, onClose }: Props) {
  const selected = useRikoStore((state) => state.config.soundId);
  const setSoundId = useRikoStore((state) => state.setSoundId);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Sound</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={18} color="#90a4ae" />
          </Pressable>
        </View>

        <View style={styles.list}>
          {SOUNDS.map((sound) => {
            const active = selected === sound.id;
            return (
              <Pressable
                key={sound.id}
                onPress={() => setSoundId(sound.id)}
                style={[styles.item, active && styles.itemActive]}>
                <View style={styles.itemLeft}>
                  <View style={[styles.itemIcon, active && styles.itemIconActive]}>
                    <Volume2 size={16} color={active ? '#050b18' : '#90a4ae'} />
                  </View>
                  <View>
                    <Text style={[styles.itemTitle, active && styles.itemTitleActive]}>{sound.name}</Text>
                    <Text style={styles.itemDesc}>{sound.desc}</Text>
                  </View>
                </View>
                {active && <Check size={18} color="#7986cb" />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheet: {
    backgroundColor: '#0d1b3e',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 10,
  },
  item: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemActive: {
    borderColor: '#7986cb',
    backgroundColor: 'rgba(121,134,203,0.1)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconActive: {
    backgroundColor: '#7986cb',
  },
  itemTitle: {
    color: '#e8eaf6',
    fontSize: 15,
    fontWeight: '800',
  },
  itemTitleActive: {
    color: '#fff',
  },
  itemDesc: {
    color: '#90a4ae',
    fontSize: 11,
    marginTop: 2,
  },
});
