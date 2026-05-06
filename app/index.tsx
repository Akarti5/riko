import React, { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import AlarmScreen from "../components/AlarmScreen";
import BottomCard from "../components/BottomCard";
import DestinationHeader from "../components/DestinationHeader";
import MapComponent from "../components/MapComponent";
import MonitoringHUD from "../components/MonitoringHUD";
import LoadingScreen from "../components/LoadingScreen";
import { useLocationTracking } from "../hooks/useLocation";
import { useRikoStore } from "../store/useStore";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const userLocation = useRikoStore((state) => state.userLocation);
  const [showLoading, setShowLoading] = useState(true);

  // Initialize location tracking
  useLocationTracking();

  useEffect(() => {
    // Hide loading screen only when location is acquired
    if (userLocation) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      {showLoading && <LoadingScreen />}
      
      {/* Map is at the bottom of the stack */}
      <MapComponent />

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

      {/* Search Bar */}
      <DestinationHeader />

      {/* Interactive UI */}
      <BottomCard />

      {/* Monitoring HUD Overlay (centered) */}
      <MonitoringHUD />

      {/* Highest Priority Overlay: Alarm Screen */}
      <AlarmScreen />
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
});
