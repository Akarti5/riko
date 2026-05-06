import { LocateFixed } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
  UrlTile,
} from "react-native-maps";
import { Colors } from "../constants/theme";
import { useRikoStore } from "../store/useStore";

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
      )
        .then((res) => res.json())
        .then((data) => {
          const address = data.address;
          const name =
            address.amenity ||
            address.shop ||
            address.building ||
            address.road ||
            address.suburb ||
            data.display_name.split(",")[0];
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
        {/* Standard OpenStreetMap Tiles (via German mirror to bypass 403 block on mobile) */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={-1}
          doubleTileSize={true} // Higher resolution on mobile
          tileCacheMaxAge={7 * 24 * 60 * 60} // 1 week cache for speed
        />

        {userLocation && (
          <Marker coordinate={userLocation} flat anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerInner} />
              </View>
            </View>
          </Marker>
        )}

        {destination && (
          <>
            <Marker coordinate={destination} pinColor={Colors.dark.orange} />
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(254, 102, 21, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FE6615",
  },
});
