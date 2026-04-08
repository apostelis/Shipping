import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

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
        <CircleMarker
          key={port.code}
          center={[parseFloat(port.latitude), parseFloat(port.longitude)]}
          radius={6}
          pathOptions={{
            color: '#533afd',
            fillColor: '#533afd',
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
              <strong style={{ fontWeight: 400 }}>{port.name}</strong><br />
              <span style={{ color: '#64748d', fontSize: '12px' }}>{port.country} ({port.code})</span>
            </div>
          </Popup>
        </CircleMarker>
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
