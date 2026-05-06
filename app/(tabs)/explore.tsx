import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0d1b3e', dark: '#0d1b3e' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#FF6714"
          name="location.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Setup</ThemedText>
      </ThemedView>
      <ThemedText>Configure RIKO before you arm your destination alarm.</ThemedText>
      <Collapsible title="Map and destination">
        <ThemedText>
          Use a full dark map style. Tap anywhere to drop a destination pin and render a geofence
          circle with live visual feedback.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Tracking and geofence">
        <ThemedText>
          Start GPS updates using <ThemedText type="defaultSemiBold">watchPositionAsync</ThemedText>{' '}
          and recalculate Haversine distance every update until geofence entry.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Alarm behavior">
        <ThemedText>
          Keep the alarm loud and persistent, show a full-screen arrival takeover, and require an
          intentional dismiss action.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Design system">
        <ThemedText>
          Dark mode only with deep navy surfaces. Use <ThemedText type="defaultSemiBold">#FF6714</ThemedText>{' '}
          for active accents, CTAs, and beacon highlights.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#FF6714',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
