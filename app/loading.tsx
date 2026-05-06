import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getUserName } from '@/lib/user-storage';

const MESSAGE = 'Preparing your live destination alarm map...';

export default function LoadingScreen() {
  const router = useRouter();
  const [typedCount, setTypedCount] = useState(0);
  const [name, setName] = useState('traveler');

  useEffect(() => {
    let isMounted = true;

    const loadName = async () => {
      const savedName = await getUserName();
      if (isMounted && savedName) {
        setName(savedName);
      }
    };

    loadName();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const typing = setInterval(() => {
      setTypedCount((count) => {
        if (count >= MESSAGE.length) {
          clearInterval(typing);
          return count;
        }
        return count + 1;
      });
    }, 45);

    const next = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3200);

    return () => {
      clearInterval(typing);
      clearTimeout(next);
    };
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.spinnerWrap}>
        <Feather name="loader" size={42} color="#FF6714" />
      </View>
      <ThemedText type="title" style={styles.title}>
        Welcome {name || 'traveler'}
      </ThemedText>
      <ThemedText style={styles.message}>{MESSAGE.slice(0, typedCount)}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  spinnerWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: '#FF6714',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  title: {
    color: '#e8eaf6',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#90a4ae',
    minHeight: 24,
  },
});
