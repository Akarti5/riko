import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
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

  const hasInitiallyCentered = useRef(false);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Manual center via button
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

  // Initial auto-center when location first acquired
  useEffect(() => {
    if (userLocation && !hasInitiallyCentered.current && mapRef.current) {
      mapRef.current.setCamera({
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        zoom: 15,
      });
      hasInitiallyCentered.current = true;
    }
  }, [userLocation]);

  // Auto-fit both markers when destination is set
  useEffect(() => {
    if (destination && userLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 180, right: 80, bottom: 180, left: 80 },
          animated: true,
        },
      );
    }
  }, [destination]);

  // Remove consecutive duplicate words from a string (case-insensitive)
  const deduplicateName = (name: string): string => {
    const words = name.split(/\s+/);
    const deduplicated: string[] = [];

    for (let i = 0; i < words.length; i++) {
      if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
        deduplicated.push(words[i]);
      }
    }

    return deduplicated.join(" ");
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const onMapLongPress = (e: any) => {
    if (!isArmed) {
      const coord = e.nativeEvent.coordinate;

      // Set temporary state while loading
      setDestination(coord, "Searching...");

      const url = `https://api.maptiler.com/geocoding/${coord.longitude},${coord.latitude}.json?key=SHKJsJP0nENFEUm6CDSX`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const features = data.features || [];

          // Filter out roads and other non-place features
          const validPlaces = features.filter((f: any) => {
            const name = (
              f.text ||
              f.place_name?.split(",")[0] ||
              ""
            ).toLowerCase();
            const isRoad =
              name.startsWith("route ") ||
              name.startsWith("lalana ") ||
              name.startsWith("rue ");
            return !isRoad;
          });

          // Sort by distance to pinned coordinate and pick the closest
          const sortedByDistance = validPlaces.sort((a: any, b: any) => {
            const distA = calculateDistance(
              coord.latitude,
              coord.longitude,
              a.center[1],
              a.center[0],
            );
            const distB = calculateDistance(
              coord.latitude,
              coord.longitude,
              b.center[1],
              b.center[0],
            );
            return distA - distB;
          });

          const closestPlace = sortedByDistance[0] || features[0];

          if (closestPlace) {
            // Extract name the same way as search results - prioritize place_name
            let name = (
              closestPlace.place_name?.split(",")[0] ||
              closestPlace.text ||
              ""
            ).trim();
            // Remove consecutive duplicate words
            name = deduplicateName(name);
            setDestination(coord, name || "Pinned Location");
          } else {
            setDestination(coord, "Pinned Location");
          }
        })
        .catch((error) => {
          console.error("Reverse geocoding error:", error);
          setDestination(coord, "Pinned Location");
        });
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
        mapType="none"
      >
        <UrlTile
          urlTemplate="https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.png?key=SHKJsJP0nENFEUm6CDSX"
          maximumZ={19}
          zIndex={-10}
          tileSize={256}
        />

        {destination && (
          <>
            <Marker
              coordinate={destination}
              pinColor={Colors.dark.orange}
              zIndex={1}
            />
            <Circle
              center={destination}
              radius={config.radius}
              fillColor="rgba(254, 102, 21, 0.1)"
              strokeColor={Colors.dark.orange}
              strokeWidth={1}
              zIndex={0}
            />
          </>
        )}

        {userLocation && (
          <Marker
            key={`user-${userLocation.latitude}-${userLocation.longitude}`}
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={100}
            tracksViewChanges={true} // Essential for initial render of custom marker views
          >
            <View style={styles.markerBox}>
              <View style={styles.accuracyCircle} />
              <View style={styles.centerDot} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { ...StyleSheet.absoluteFillObject },
  markerBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  accuracyCircle: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(66, 133, 244, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(66, 133, 244, 0.4)",
  },
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4285F4",
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
});
