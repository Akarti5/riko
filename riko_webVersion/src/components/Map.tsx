import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRikoStore } from '../store/useStore';
import { useEffect, useRef } from 'react';

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing beacon icon for user
const beaconIcon = L.divIcon({
  className: 'custom-beacon',
  html: '<div class="w-4 h-4 bg-[#7986cb] rounded-full border-2 border-white beacon-pulse"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom amber marker for destination
const amberIcon = L.divIcon({
  className: 'custom-destination',
  html: '<div class="w-6 h-6 flex items-center justify-center bg-amber-500 rounded-full border-2 border-white shadow-lg"><div class="w-2 h-2 bg-white rounded-full"></div></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const INITIAL_CENTER: L.LatLngExpression = [51.505, -0.09]; // Default to London if user location not yet acquired
const INITIAL_ZOOM = 13;

function AutoCenter() {
  const map = useMap();
  const userLocation = useRikoStore((state) => state.userLocation);
  const centerTrigger = useRikoStore((state) => state.centerTrigger);
  const hasInitiallyCentered = useRef(false);

  // Center on user button click
  useEffect(() => {
    if (userLocation && centerTrigger > 0) {
      map.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  }, [centerTrigger, userLocation, map]);

  // Initial center when location first acquired
  useEffect(() => {
    if (userLocation && !hasInitiallyCentered.current) {
      map.setView([userLocation.lat, userLocation.lng], 13);
      hasInitiallyCentered.current = true;
    }
  }, [userLocation, map]);

  return null;
}

function UserMarker() {
  const userLocation = useRikoStore((state) => state.userLocation);
  if (!userLocation) return null;
  return <Marker position={userLocation} icon={beaconIcon} />;
}

function DestinationMarker() {
  const destination = useRikoStore((state) => state.destination);
  const radius = useRikoStore((state) => state.config.radius);
  if (!destination) return null;

  return (
    <>
      <Marker position={destination} icon={amberIcon} />
      <Circle
        center={destination}
        radius={radius}
        pathOptions={{
          color: '#7986cb',
          fillColor: '#7986cb',
          fillOpacity: 0.15,
          weight: 1,
          dashArray: '5, 5'
        }}
      />
    </>
  );
}

function MapEvents() {
  const setDestination = useRikoStore((state) => state.setDestination);
  const isArmed = useRikoStore((state) => state.isArmed);

  useMapEvents({
    click(e) {
      if (!isArmed) {
        setDestination(e.latlng);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
          .then(res => res.json())
          .then(data => {
            const name = data.display_name.split(',')[0];
            setDestination(e.latlng, name);
          })
          .catch(() => {});
      }
    },
  });
  return null;
}

export default function RikoMap() {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <AutoCenter />
        <UserMarker />
        <DestinationMarker />
      </MapContainer>
    </div>
  );
}
