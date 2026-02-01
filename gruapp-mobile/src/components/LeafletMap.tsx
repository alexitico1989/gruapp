import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// ─── Tipos públicos ─────────────────────────────────────────────────────────

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MarkerProps {
  coordinate: Coordinate;
  title?: string;
  description?: string;
  pinColor?: string;
  children?: React.ReactNode;
  key?: string;
  _customIcon?: 'grua' | 'grua-assigned';
}

export interface PolylineProps {
  coordinates: Coordinate[];
  strokeWidth?: number;
  strokeColor?: string;
}

export interface LeafletMapRef {
  animateToRegion: (region: Region) => void;
  fitToCoordinates: (coordinates: Coordinate[], options?: any) => void;
}

// Sub-componentes ficticios — no renderean nada, solo sirven como marcadores
// de tipo para que LeafletMap los lea como children.
export const Marker: React.FC<MarkerProps> = () => null;
export const Polyline: React.FC<PolylineProps> = () => null;

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRUA_SVG_PATH = 'M11.5 4a.5.5 0 0 1 .5.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-4 0 1 1 0 0 1-1-1v-1h11V4.5a.5.5 0 0 1 .5-.5M3 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2m1.732 0h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4a2 2 0 0 1 1.732 1';

function deltaToZoom(latitudeDelta: number): number {
  if (latitudeDelta <= 0.001) return 17;
  if (latitudeDelta <= 0.005) return 15;
  if (latitudeDelta <= 0.01) return 14;
  if (latitudeDelta <= 0.05) return 12;
  if (latitudeDelta <= 0.1) return 11;
  if (latitudeDelta <= 0.5) return 9;
  return 7;
}

function sanitize(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

// ─── Tipos internos para parsear children ──────────────────────────────────

interface InternalMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  pinColor?: string;
  customIcon?: 'grua' | 'grua-assigned';
}

interface InternalPolyline {
  coordinates: Coordinate[];
  strokeWidth?: number;
  strokeColor?: string;
}

// ─── Generar HTML con Leaflet.js ────────────────────────────────────────────

function generateHTML(
  centerLat: number,
  centerLng: number,
  zoom: number,
  markers: InternalMarker[],
  polylines: InternalPolyline[]
): string {
  const markersJS = markers.map((m) => {
    const safeId = m.id.replace(/[^a-zA-Z0-9]/g, '_');

    if (m.customIcon) {
      const bgColor = m.customIcon === 'grua' ? '#1e40af' : '#10b981';
      return `
        L.marker([${m.lat}, ${m.lng}], {
          icon: L.divIcon({
            className: '',
            html: '<div style="background-color:${bgColor};width:32px;height:32px;border-radius:16px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"><svg width="18" height="18" viewBox="0 0 16 16"><path d="${GRUA_SVG_PATH}" fill="white"/></svg></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        }).addTo(map).bindPopup('${sanitize(m.title)}${m.description ? ' — ' + sanitize(m.description) : ''}');
      `;
    }

    const color = m.pinColor || '#3b82f6';
    return `
      L.marker([${m.lat}, ${m.lng}], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:24px;height:32px"><svg width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z" fill="${color}"/><circle cx="12" cy="12" r="5" fill="white"/></svg></div>',
          iconSize: [24, 32],
          iconAnchor: [12, 32]
        })
      }).addTo(map).bindPopup('${sanitize(m.title)}${m.description ? ' — ' + sanitize(m.description) : ''}');
    `;
  }).join('\n');

  const polylinesJS = polylines.map((p) => {
    const coords = p.coordinates.map(c => `[${c.latitude},${c.longitude}]`).join(',');
    return `
      L.polyline([${coords}], {
        color: '${p.strokeColor || '#FF7A3D'}',
        weight: ${p.strokeWidth || 4},
        opacity: 0.8
      }).addTo(map);
    `;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
        .leaflet-control-zoom { display: none; }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          center: [${centerLat}, ${centerLng}],
          zoom: ${zoom},
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        ${markersJS}
        ${polylinesJS}

        // Clicks en el mapa → React Native
        map.on('click', function(e) {
          window.postMessage(JSON.stringify({
            type: 'mapClick',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }), '*');
        });

        // Mensajes de React Native → mapa
        window.addEventListener('message', function(event) {
          try {
            var msg = JSON.parse(event.data);
            if (msg.type === 'animateToRegion') {
              map.setView([msg.lat, msg.lng], msg.zoom, { animate: true });
            }
            if (msg.type === 'fitToBounds') {
              map.fitBounds(msg.bounds, { padding: [50, 50] });
            }
          } catch(e) {}
        });
      </script>
    </body>
    </html>
  `;
}

// ─── Componente principal ───────────────────────────────────────────────────

interface LeafletMapProps {
  style?: any;
  initialRegion?: Region;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  onPress?: (event: { nativeEvent: { coordinate: Coordinate } }) => void;
  children?: React.ReactNode;
}

const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>((props, ref) => {
  const { style, initialRegion, onPress, children } = props;
  const webViewRef = useRef<WebView>(null);

  const centerLat = initialRegion?.latitude || -33.4489;
  const centerLng = initialRegion?.longitude || -70.6693;
  const zoom = initialRegion ? deltaToZoom(initialRegion.latitudeDelta) : 14;

  // ─── Ref imperative ───────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region) => {
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'animateToRegion',
        lat: region.latitude,
        lng: region.longitude,
        zoom: deltaToZoom(region.latitudeDelta),
      }));
    },
    fitToCoordinates: (coordinates: Coordinate[]) => {
      if (coordinates.length === 0) return;
      const bounds = coordinates.map(c => [c.latitude, c.longitude]);
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'fitToBounds',
        bounds,
      }));
    },
  }));

  // ─── Parsear children ─────────────────────────────────────────────────────
  const markers: InternalMarker[] = [];
  const polylines: InternalPolyline[] = [];
  let markerIndex = 0;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === Marker) {
      const p = child.props as MarkerProps;
      markers.push({
        id: (child.key as string) || `marker-${markerIndex++}`,
        lat: p.coordinate.latitude,
        lng: p.coordinate.longitude,
        title: p.title,
        description: p.description,
        pinColor: p.pinColor,
        customIcon: p._customIcon,
      });
    }

    if (child.type === Polyline) {
      const p = child.props as PolylineProps;
      if (p.coordinates && p.coordinates.length > 1) {
        polylines.push({
          coordinates: p.coordinates,
          strokeWidth: p.strokeWidth,
          strokeColor: p.strokeColor,
        });
      }
    }
  });

  const html = generateHTML(centerLat, centerLng, zoom, markers, polylines);

  // ─── Handler mensajes desde WebView ───────────────────────────────────────
  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'mapClick' && onPress) {
        onPress({
          nativeEvent: {
            coordinate: {
              latitude: msg.lat,
              longitude: msg.lng,
            },
          },
        });
      }
    } catch (e) {}
  };

  return (
    <View style={style}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        cacheEnabled={true}
      />
    </View>
  );
});

export default LeafletMap;