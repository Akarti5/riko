import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import {
  BellRing,
  ChevronDown,
  ChevronUp,
  LocateFixed,
  MapPin,
} from "lucide-react-native";
import React, { useMemo, useState, useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { Colors } from "../constants/theme";
import { useRikoStore } from "../store/useStore";
import SoundPicker from "./SoundPicker";

export default function BottomCard() {
  const {
    destination,
    destinationName,
    isArmed,
    config,
    distance,
    setRadius,
    armAlarm,
    disarmAlarm,
    triggerCenter,
  } = useRikoStore();
  const [isSoundPickerVisible, setIsSoundPickerVisible] = useState(false);
  
  // Arrow animation
  const arrowAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: -5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const snapPoints = useMemo(() => ["13%", "55%"], []);

  const handleToggleAlarm = () => {
    if (isArmed) {
      disarmAlarm();
    } else {
      armAlarm();
    }
  };

  const formatDistance = (m: number | null) => {
    if (m === null) return "--";
    if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
    return `${Math.round(m)}m`;
  };

  // Custom Handle with animated arrow
  const CustomHandle = () => (
    <View style={styles.handleContainer}>
      <Animated.View style={{ transform: [{ translateY: arrowAnim }] }}>
        <ChevronUp size={20} color={Colors.dark.orange} strokeWidth={3} />
      </Animated.View>
    </View>
  );

  return (
    <>
      <View style={styles.bottomSheetWrapper} pointerEvents="box-none">
        <TouchableOpacity style={styles.locateButton} onPress={triggerCenter}>
          <LocateFixed size={22} color={Colors.dark.orange} />
        </TouchableOpacity>

        <BottomSheet
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleComponent={CustomHandle}
          activeOffsetX={[-999, 999]}
          activeOffsetY={[-5, 5]}
        >
          <BottomSheetView style={styles.container}>
            {/* Main Info Row (Always Visible in Collapsed State) */}
            <View style={styles.mainInfoRow}>
              <View style={styles.destinationBox}>
                <Text style={styles.destinationTitle} numberOfLines={1}>
                  {destinationName ||
                    (destination ? "Unnamed Location" : "None Selected")}
                </Text>
                <View style={styles.statusRow}>
                  <MapPin size={12} color={Colors.dark.orange} />
                  <Text style={styles.statusText}>
                    {isArmed ? "TRACKING..." : "READY TO TRACK"}
                  </Text>
                </View>
              </View>

              <View style={styles.distanceBox}>
                <Text style={styles.distanceValue}>
                  {formatDistance(distance)}
                </Text>
                <Text style={styles.distanceLabel}>DISTANCE</Text>
              </View>
            </View>

            {/* Hidden Content in Collapsed State (Bottom Sheet takes care of this via clipping) */}
            <View style={styles.divider} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ALARM RADIUS</Text>
                <Text style={styles.radiusValue}>
                  {config.radius >= 1000
                    ? `${(config.radius / 1000).toFixed(1)}km`
                    : `${config.radius}m`}
                </Text>
              </View>

              <View onStartShouldSetResponder={() => true}>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={1000}
                  step={50}
                  value={config.radius}
                  onValueChange={setRadius}
                  minimumTrackTintColor={Colors.dark.orange}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                  thumbTintColor={Colors.dark.orange}
                  disabled={isArmed}
                />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLimitText}>100m</Text>
                <Text style={styles.sliderLimitText}>1km</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.soundCard}
              onPress={() => !isArmed && setIsSoundPickerVisible(true)}
              disabled={isArmed}
            >
              <View style={styles.soundIconContainer}>
                <BellRing size={20} color={Colors.dark.orange} />
              </View>
              <View style={styles.soundContent}>
                <Text style={styles.soundLabel}>Alarm Sound</Text>
                <Text style={styles.soundName}>{config.soundName}</Text>
              </View>
              {!isArmed && <ChevronDown size={20} color={Colors.dark.muted} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isArmed ? styles.disarmButton : styles.armButton,
                !destination && styles.disabledButton,
              ]}
              onPress={handleToggleAlarm}
              disabled={!destination}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: isArmed ? "#FFF" : "#000" },
                ]}
              >
                {isArmed ? "DISARM ALARM" : "ARM ALARM"}
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </View>

      <SoundPicker
        isVisible={isSoundPickerVisible}
        onClose={() => setIsSoundPickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  mainInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    height: 60, // Fixed height for first line consistency
  },
  destinationBox: {
    flex: 1,
    paddingRight: 10,
  },
  destinationTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusText: {
    fontSize: 9,
    color: Colors.dark.orange,
    marginLeft: 6,
    fontWeight: "900",
    letterSpacing: 2,
  },
  distanceBox: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  distanceValue: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "900",
    color: "#FFF",
  },
  distanceLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: Colors.dark.muted,
    letterSpacing: 2,
    marginTop: -2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.dark.muted,
    letterSpacing: 2,
  },
  radiusValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFF",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  sliderLimitText: {
    fontSize: 10,
    color: Colors.dark.muted,
    fontWeight: "600",
  },
  soundCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 24,
  },
  soundIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(254, 102, 21, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  soundContent: {
    flex: 1,
  },
  soundLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.dark.muted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  soundName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  actionButton: {
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  armButton: {
    backgroundColor: Colors.dark.orange,
  },
  disarmButton: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: "#334155",
  },
  bottomSheetWrapper: {
    ...StyleSheet.absoluteFillObject,
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
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
