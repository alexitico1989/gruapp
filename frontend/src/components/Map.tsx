import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Iconos personalizados
const origenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const gruaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: {
    position: [number, number];
    popup?: string;
    type?: 'origen' | 'destino' | 'grua' | 'default';
  }[];
  route?: [number, number][];
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

// Componente para ajustar el mapa a los bounds
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);

  return null;
}

export default function Map({
  center = [-33.4489, -70.6693], // Santiago, Chile por defecto
  zoom = 13,
  markers = [],
  route = [],
  className = 'h-96',
  onMapClick,
}: MapProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'origen':
        return origenIcon;
      case 'destino':
        return destinoIcon;
      case 'grua':
        return gruaIcon;
      default:
        return DefaultIcon;
    }
  };

  // Calcular todas las posiciones para ajustar el mapa
  const allPositions: [number, number][] = [
    ...markers.map((m) => m.position),
    ...route,
  ];

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={getIcon(marker.type)}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {/* Ruta */}
        {route.length > 0 && (
          <Polyline
            positions={route}
            color="#2563eb"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Ajustar bounds si hay posiciones */}
        {allPositions.length > 0 && <FitBounds positions={allPositions} />}

        {/* Manejador de clicks */}
        {onMapClick && <MapClickHandler onClick={onMapClick} />}
      </MapContainer>
    </div>
  );
}