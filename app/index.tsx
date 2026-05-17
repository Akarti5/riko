import React, { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import { MapPin } from "lucide-react-native";
import AlarmScreen from "../components/AlarmScreen";
import BottomCard from "../components/BottomCard";
import DestinationHeader from "../components/DestinationHeader";
import MapComponent from "../components/MapComponent";
import MonitoringHUD from "../components/MonitoringHUD";
import LoadingScreen from "../components/LoadingScreen";
import UpdateChecker from "../components/UpdateChecker";
import { useLocationTracking } from "../hooks/useLocation";
import { useRikoStore } from "../store/useStore";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const userLocation = useRikoStore((state) => state.userLocation);
  const destination = useRikoStore((state) => state.destination);
  const [showLoading, setShowLoading] = useState(true);
  const [hasAcquiredLocation, setHasAcquiredLocation] = useState(false);

  // Initialize location tracking
  useLocationTracking();

  useEffect(() => {
    // Hide loading screen when location is acquired
    if (userLocation) {
      setHasAcquiredLocation(true);
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userLocation]);

  useEffect(() => {
    // HARD FALLBACK: Always hide loading screen after 8 seconds.
    // This ensures non-GMS devices (Huawei) don't get stuck forever
    // when location APIs fail silently without GMS.
    const fallbackTimer = setTimeout(() => {
      setShowLoading(false);
    }, 8000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <View style={styles.container}>
      {showLoading && <LoadingScreen />}
      
      {/* Map is at the bottom of the stack */}
      {hasAcquiredLocation && <MapComponent />}

      {/* Constellation Overlay - ported from web */}
      <View style={styles.constellationOverlay} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern
              id="dotPattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <Circle cx="2" cy="2" r="1" fill="#FE6615" opacity={0.2} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotPattern)" />
        </Svg>
      </View>

      {/* Instructional Hint */}
      {!destination && !showLoading && (
        <View style={styles.hintContainer} pointerEvents="none">
          <View style={styles.hintBubble}>
            <MapPin size={14} color="#FE6615" />
            <Text style={styles.hintText}>LONG-PRESS MAP TO SET ALARM</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <DestinationHeader />

      {/* Interactive UI */}
      <BottomCard />

      {/* Monitoring HUD Overlay (centered) */}
      <MonitoringHUD />

      {/* Highest Priority Overlay: Alarm Screen */}
      <AlarmScreen />

      {/* Global Update Notification */}
      <UpdateChecker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  constellationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.3,
  },
  bottomSheetWrapper: {
    flex: 1,
  },
  locateButton: {
    position: "absolute",
    bottom: "58%",
    right: 20,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  hintContainer: {
    position: "absolute",
    top: 140, // Below the search header
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  hintBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(254, 102, 21, 0.3)",
    gap: 8,
  },
  hintText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
