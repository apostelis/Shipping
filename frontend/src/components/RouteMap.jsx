import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FitBounds({ ports }) {
  const map = useMap()
  useEffect(() => {
    if (ports.length > 0) {
      const bounds = ports.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [ports, map])
  return null
}

export default function RouteMap({ ports, optimizedRoute, naiveRoute }) {
  return (
    <MapContainer
      center={[30, 50]}
      zoom={3}
      className="h-[500px] w-full rounded-stripe border border-stripe-border shadow-stripe-ambient"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds ports={ports} />

      {ports.map((port) => (
        <Marker
          key={port.code}
          position={[parseFloat(port.latitude), parseFloat(port.longitude)]}
        >
          <Popup>
            <strong>{port.name}</strong><br />
            {port.country} ({port.code})
          </Popup>
        </Marker>
      ))}

      {naiveRoute && (
        <Polyline
          positions={naiveRoute}
          pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '8 4', opacity: 0.6 }}
        />
      )}

      {optimizedRoute && (
        <Polyline
          positions={optimizedRoute}
          pathOptions={{ color: '#533afd', weight: 3, opacity: 0.9 }}
        />
      )}
    </MapContainer>
  )
}
