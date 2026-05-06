import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import {
  BellRing,
  ChevronDown,
  LocateFixed,
  MapPin,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  const snapPoints = useMemo(() => ["18%", "55%"], []);

  const handleToggleAlarm = () => {
    if (isArmed) {
      disarmAlarm();
    } else {
      armAlarm();
    }
  };

  const formatDistance = (m: number | null) => {
    if (m === null) return "--";
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  return (
    <>
      <View style={styles.bottomSheetWrapper} pointerEvents="box-none">
        <TouchableOpacity style={styles.locateButton} onPress={triggerCenter}>
          <LocateFixed size={22} color={Colors.dark.orange} />
        </TouchableOpacity>

        <BottomSheet
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
          activeOffsetX={[-999, 999]}
          activeOffsetY={[-5, 5]}
        >
          <BottomSheetView style={styles.container}>
            {/* Main Info Row (Matching the big numbers on web) */}
            <View style={styles.mainInfoRow}>
              <View style={styles.destinationBox}>
                <Text style={styles.destinationTitle} numberOfLines={1}>
                  {destinationName ||
                    (destination ? "Unnamed Location" : "None Selected")}
                </Text>
                <View style={styles.statusRow}>
                  <MapPin size={12} color={Colors.dark.orange} />
                  <Text style={styles.statusText}>
                    {isArmed ? "Tracking..." : "Ready To Track"}
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

            {/* Slider Section */}
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

              {/* Wrapper to help with gesture conflict */}
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

            {/* Sound Selector */}
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

            {/* Main Action Button */}
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
    backgroundColor: "#0F172A", // Deeper blue-black background from web
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handleIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 40,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 12,
  },
  mainInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  destinationBox: {
    flex: 1,
    paddingRight: 10,
  },
  destinationTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.dark.muted,
    marginLeft: 6,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  distanceBox: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  distanceValue: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", // Monospaced feel for numbers
    fontWeight: "900",
    color: Colors.dark.orange,
  },
  distanceLabel: {
    fontSize: 10,
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
    marginBottom: 24,
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
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },
  armButton: {
    backgroundColor: Colors.dark.orange,
    shadowColor: Colors.dark.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  disarmButton: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtonText: {
    fontSize: 18,
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
    bottom: "58%", // Just above the sheet
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
