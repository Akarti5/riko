import { LocateFixed } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
  UrlTile,
} from "react-native-maps";
import { Colors } from "../constants/theme";
import { useRikoStore } from "../store/useStore";

const RippleCircle = ({ delay = 0 }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 4,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

export default function MapComponent() {
  const mapRef = useRef<MapView>(null);
  const {
    userLocation,
    destination,
    isArmed,
    config,
    centerTrigger,
    setDestination,
  } = useRikoStore();

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    }
  }, [centerTrigger]);

  const onMapLongPress = (e: any) => {
    if (!isArmed) {
      const coord = e.nativeEvent.coordinate;
      setDestination(coord);

      // Reverse geocoding from OpenStreetMap Nominatim with more details
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.latitude}&lon=${coord.longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RikoApp/1.0 (Mobile; Android/iOS)',
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          const address = data.address || {};
          const name =
            address.amenity ||
            address.shop ||
            address.building ||
            address.road ||
            address.suburb ||
            data.display_name?.split(",")[0] ||
            "Selected Location";
          setDestination(coord, name);
        })
        .catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onLongPress={onMapLongPress}
        mapType="none" // Hide base map to show OSM tiles
      >
        {/* MapTiler OpenStreetMap style as per user request */}
        <UrlTile
          urlTemplate="https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.png?key=SHKJsJP0nENFEUm6CDSX"
          maximumZ={19}
          flipY={false}
          zIndex={-1}
          tileSize={256}
          tileCacheMaxAge={7 * 24 * 60 * 60}
        />

        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            flat 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10} // Ensure it is above the tile layer
          >
            <View style={styles.userMarkerContainer}>
              <RippleCircle delay={0} />
              <RippleCircle delay={1000} />
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerInner} />
              </View>
            </View>
          </Marker>
        )}

        {destination && (
          <>
            <Marker coordinate={destination} pinColor={Colors.dark.orange} tracksViewChanges={false} />
            <Circle
              center={destination}
              radius={config.radius}
              fillColor="rgba(254, 102, 21, 0.1)"
              strokeColor={Colors.dark.orange}
              strokeWidth={1}
            />
          </>
        )}
      </MapView>

        {/* Locate button moved to BottomCard */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userMarkerContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(66, 133, 244, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.6)",
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(66, 133, 244, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    zIndex: 2,
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4285F4",
  },
});
