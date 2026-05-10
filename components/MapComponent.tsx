import React, { useEffect, useRef, useState, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { 
  Map, 
  Camera, 
  Marker, 
  GeoJSONSource, 
  Layer, 
  type MapRef,
  type CameraRef
} from "@maplibre/maplibre-react-native";
import { Colors } from "../constants/theme";
import { useRikoStore } from "../store/useStore";

// Set the tile server / style
const MAPTILER_KEY = "SHKJsJP0nENFEUm6CDSX";
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

export default function MapComponent() {
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const {
    userLocation,
    destination,
    isArmed,
    config,
    centerTrigger,
    setDestination,
  } = useRikoStore();

  const [hasInitiallyCentered, setHasInitiallyCentered] = useState(false);

  // Manual center via button
  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.easeTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 500,
      });
    }
  }, [centerTrigger]);

  // Initial auto-center when location first acquired
  useEffect(() => {
    if (userLocation && !hasInitiallyCentered && cameraRef.current) {
      cameraRef.current.easeTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 1000,
      });
      setHasInitiallyCentered(true);
    }
  }, [userLocation]);

  // Auto-fit both markers when destination is set
  useEffect(() => {
    if (destination && userLocation && cameraRef.current) {
      const west = Math.min(userLocation.longitude, destination.longitude);
      const south = Math.min(userLocation.latitude, destination.latitude);
      const east = Math.max(userLocation.longitude, destination.longitude);
      const north = Math.max(userLocation.latitude, destination.latitude);
      
      cameraRef.current.fitBounds(
        [west, south, east, north],
        { padding: { top: 100, right: 100, bottom: 100, left: 100 }, duration: 1000 }
      );
    }
  }, [destination]);

  // Helper to create a circle polygon for the geofence
  const circleGeoJSON = useMemo(() => {
    if (!destination) return null;
    
    const points = 64;
    const radiusInMeters = config.radius;
    const coords = {
      latitude: destination.latitude,
      longitude: destination.longitude,
    };
    
    const km = radiusInMeters / 1000;
    const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    const ret = [];
    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [ret],
          },
        },
      ],
    };
  }, [destination, config.radius]);

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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const onMapLongPress = async (e: any) => {
    if (!isArmed) {
      const coord = {
        latitude: e.nativeEvent.lngLat[1],
        longitude: e.nativeEvent.lngLat[0],
      };

      setDestination(coord, "Searching...");

      const url = `https://api.maptiler.com/geocoding/${coord.longitude},${coord.latitude}.json?key=${MAPTILER_KEY}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        const features = data.features || [];

        const validPlaces = features.filter((f: any) => {
          const name = (f.text || f.place_name?.split(",")[0] || "").toLowerCase();
          const isRoad = name.startsWith("route ") || name.startsWith("lalana ") || name.startsWith("rue ");
          return !isRoad;
        });

        const sortedByDistance = validPlaces.sort((a: any, b: any) => {
          const distA = calculateDistance(coord.latitude, coord.longitude, a.center[1], a.center[0]);
          const distB = calculateDistance(coord.latitude, coord.longitude, b.center[1], b.center[0]);
          return distA - distB;
        });

        const closestPlace = sortedByDistance[0] || features[0];

        if (closestPlace) {
          let name = (closestPlace.place_name?.split(",")[0] || closestPlace.text || "").trim();
          name = deduplicateName(name);
          setDestination(coord, name || "Pinned Location");
        } else {
          setDestination(coord, "Pinned Location");
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setDestination(coord, "Pinned Location");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={STYLE_URL}
        onLongPress={onMapLongPress}
        logo={false}
        attribution={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [userLocation?.longitude || 0, userLocation?.latitude || 0],
            zoom: 12,
          }}
        />

        {destination && (
          <>
            <Marker
              id="destinationMarker"
              lngLat={[destination.longitude, destination.latitude]}
            >
              <View style={[styles.markerDot, { backgroundColor: Colors.dark.orange }]} />
            </Marker>

            {circleGeoJSON && (
              <GeoJSONSource id="geofenceSource" data={circleGeoJSON as any}>
                <Layer
                  id="geofenceFill"
                  type="fill"
                  paint={{
                    "fill-color": Colors.dark.orange,
                    "fill-opacity": 0.1,
                  }}
                />
                <Layer
                  id="geofenceOutline"
                  type="line"
                  paint={{
                    "line-color": Colors.dark.orange,
                    "line-width": 2,
                  }}
                />
              </GeoJSONSource>
            )}
          </>
        )}

        {userLocation && (
          <Marker
            id="userLocation"
            lngLat={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.markerBox}>
              <View style={styles.accuracyCircle} />
              <View style={styles.centerDot} />
            </View>
          </Marker>
        )}
      </Map>
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
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
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
