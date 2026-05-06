import { useEffect, useRef } from 'react';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { useRikoStore } from '@/lib/riko-store';

const INITIAL_REGION: Region = {
  latitude: 51.505,
  longitude: -0.09,
  latitudeDelta: 0.06,
  longitudeDelta: 0.04,
};

export default function RikoMap() {
  const mapRef = useRef<MapView | null>(null);
  const userLocation = useRikoStore((state) => state.userLocation);
  const destination = useRikoStore((state) => state.destination);
  const radius = useRikoStore((state) => state.config.radius);
  const centerTrigger = useRikoStore((state) => state.centerTrigger);
  const isArmed = useRikoStore((state) => state.isArmed);
  const setDestination = useRikoStore((state) => state.setDestination);

  useEffect(() => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      450,
    );
  }, [centerTrigger, userLocation]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={INITIAL_REGION}
      userInterfaceStyle="dark"
      onPress={(event) => {
        if (!isArmed) {
          setDestination(event.nativeEvent.coordinate);
        }
      }}>
      {destination && (
        <>
          <Marker coordinate={destination} pinColor="#f59e0b" />
          <Circle
            center={destination}
            radius={radius}
            strokeColor="rgba(121, 134, 203, 0.8)"
            fillColor="rgba(121, 134, 203, 0.18)"
          />
        </>
      )}
      {userLocation && <Marker coordinate={userLocation} pinColor="#7986cb" />}
    </MapView>
  );
}
