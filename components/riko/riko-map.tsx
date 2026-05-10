import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Map, Camera, Marker, GeoJSONSource, Layer, type MapRef, type CameraRef } from '@maplibre/maplibre-react-native';
import { useRikoStore } from '@/lib/riko-store';

const MAPTILER_KEY = 'SHKJsJP0nENFEUm6CDSX';
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

export default function RikoMap() {
  const mapRef = useRef<MapRef | null>(null);
  const cameraRef = useRef<CameraRef | null>(null);
  const userLocation = useRikoStore((state) => state.userLocation);
  const destination = useRikoStore((state) => state.destination);
  const radius = useRikoStore((state) => state.config.radius);
  const centerTrigger = useRikoStore((state) => state.centerTrigger);
  const isArmed = useRikoStore((state) => state.isArmed);
  const setDestination = useRikoStore((state) => state.setDestination);

  useEffect(() => {
    if (!userLocation || !cameraRef.current) return;
    cameraRef.current.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 15,
      duration: 450,
    });
  }, [centerTrigger, userLocation]);

  const circleGeoJSON = useMemo(() => {
    if (!destination) return null;
    const points = 64;
    const radiusInMeters = radius;
    const coords = { latitude: destination.latitude, longitude: destination.longitude };
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
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [ret] },
      }],
    };
  }, [destination, radius]);

  return (
    <View style={{ flex: 1 }}>
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={STYLE_URL}
        logo={false}
        attribution={false}
        onPress={(event) => {
          if (!isArmed) {
            const coord = {
              latitude: (event as any).geometry.coordinates[1],
              longitude: (event as any).geometry.coordinates[0],
            };
            setDestination(coord);
          }
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [51.505, -0.09],
            zoom: 12,
          }}
        />

        {destination && (
          <>
            <Marker id="destination" lngLat={[destination.longitude, destination.latitude]}>
              <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
            </Marker>
            {circleGeoJSON && (
              <GeoJSONSource id="geofence" data={circleGeoJSON as any}>
                <Layer
                  id="geofenceFill"
                  type="fill"
                  paint={{
                    'fill-color': '#7986cb',
                    'fill-opacity': 0.18,
                  }}
                />
                <Layer
                  id="geofenceOutline"
                  type="line"
                  paint={{
                    'line-color': '#7986cb',
                    'line-width': 1,
                  }}
                />
              </GeoJSONSource>
            )}
          </>
        )}
        {userLocation && (
          <Marker id="user" lngLat={[userLocation.longitude, userLocation.latitude]}>
            <View style={[styles.dot, { backgroundColor: '#7986cb' }]} />
          </Marker>
        )}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFF',
  }
});

