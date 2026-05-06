import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRikoStore } from '../store/useStore';
import { Colors } from '../constants/theme';
import { X, Check, Volume2, Plus, Play, Pause } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const SYSTEM_SOUNDS = [
  { id: 'default', name: 'System Default', desc: 'Standard device alert' },
  { id: 'radar', name: 'Radar Pulse', desc: 'Sharp digital tone' },
  { id: 'beacon', name: 'Deep Beacon', desc: 'Low resonance alert' },
];

interface SoundPickerProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SoundPicker({ isVisible, onClose }: SoundPickerProps) {
  const { config, setSound } = useRikoStore();
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  
  const player = useAudioPlayer(currentUri);
  const status = useAudioPlayerStatus(player);

  const togglePlayback = async (uri: string | null) => {
    if (!uri) return;
    
    // If it's a different sound, switch to it
    if (uri !== currentUri) {
      setCurrentUri(uri);
      // We need to wait for the next render for player to update, 
      // but usually player.play() works if currentUri was already set.
    }

    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  // Ensure music stops when closing the modal
  const handleClose = () => {
    player.pause();
    onClose();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSound(asset.uri, asset.name);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Sound</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color={Colors.dark.muted} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>SYSTEM SOUNDS</Text>
            {SYSTEM_SOUNDS.map((sound) => {
              const isActive = config.soundUri === null && config.soundName === sound.name;
              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[styles.soundItem, isActive && styles.activeItem]}
                  onPress={() => setSound(null, sound.name)}
                >
                  <View style={styles.soundInfo}>
                    <View style={styles.iconContainer}>
                      <Volume2 color={Colors.dark.orange} size={20} />
                    </View>
                    <View>
                      <Text style={styles.soundName}>{sound.name}</Text>
                      <Text style={styles.soundDesc}>{sound.desc}</Text>
                    </View>
                  </View>
                  {isActive && <Check color={Colors.dark.orange} size={20} />}
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>CUSTOM SOUND</Text>
            {config.soundUri && (
              <View style={[styles.soundItem, styles.activeItem]}>
                <TouchableOpacity 
                  style={styles.soundInfo} 
                  onPress={() => setSound(config.soundUri, config.soundName)}
                >
                  <View style={styles.iconContainer}>
                    <Volume2 color={Colors.dark.orange} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.soundName} numberOfLines={1}>{config.soundName}</Text>
                    <Text style={styles.soundDesc}>Custom user sound</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.actionGroup}>
                  <TouchableOpacity 
                    style={styles.playButton} 
                    onPress={() => togglePlayback(config.soundUri)}
                  >
                    {status.playing && currentUri === config.soundUri ? (
                      <Pause color="#FFF" size={16} fill="#FFF" />
                    ) : (
                      <Play color="#FFF" size={16} fill="#FFF" />
                    )}
                  </TouchableOpacity>
                  <Check color={Colors.dark.orange} size={20} />
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={pickDocument}>
              <Plus color={Colors.dark.orange} size={20} />
              <Text style={styles.addButtonText}>Choose from device</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.confirmButton} onPress={handleClose}>
            <Text style={styles.confirmButtonText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '70%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark.muted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeItem: {
    borderColor: Colors.dark.orange,
    backgroundColor: 'rgba(254, 102, 21, 0.05)',
  },
  soundInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(254, 102, 21, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  soundDesc: {
    fontSize: 12,
    color: Colors.dark.muted,
    marginTop: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.dark.orange,
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.dark.orange,
    fontWeight: '700',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: Colors.dark.orange,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  confirmButtonText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
