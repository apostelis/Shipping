import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
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

function AnimatedRoute({ positions, color, width, animated }) {
  if (!positions || positions.length < 2) return null
  return (
    <>
      {/* Glow layer */}
      <Polyline
        positions={positions}
        pathOptions={{ color, weight: width + 6, opacity: 0.15, lineCap: 'round' }}
      />
      {/* Main line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: width,
          opacity: 0.9,
          lineCap: 'round',
          dashArray: animated ? '12 8' : undefined,
        }}
      />
    </>
  )
}

export default function RouteMap({ ports, optimizedRoute, naiveRoute, originCode, destinationCode }) {
  return (
    <MapContainer
      center={[25, 45]}
      zoom={3}
      className="h-[520px] w-full rounded-stripe border border-stripe-border/30 shadow-stripe"
      style={{ background: '#0a0f1e' }}
    >
      <TileLayer
        attribution='&copy; CartoDB'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds ports={ports} />

      {/* Port markers */}
      {ports.map((port) => {
        const isOrigin = port.code === originCode
        const isDestination = port.code === destinationCode
        const isHighlighted = isOrigin || isDestination
        return (
          <CircleMarker
            key={port.code}
            center={[parseFloat(port.latitude), parseFloat(port.longitude)]}
            radius={isHighlighted ? 8 : 4}
            pathOptions={{
              color: isOrigin ? '#22d3ee' : isDestination ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              fillColor: isOrigin ? '#22d3ee' : isDestination ? '#a78bfa' : 'rgba(255,255,255,0.6)',
              fillOpacity: isHighlighted ? 1 : 0.5,
              weight: isHighlighted ? 3 : 1,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, color: '#061b31' }}>
                <strong style={{ fontWeight: 500 }}>{port.name}</strong><br />
                <span style={{ color: '#64748d', fontSize: '12px' }}>{port.country}</span>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}

      {/* Naive route - dim dashed */}
      {naiveRoute && (
        <AnimatedRoute positions={naiveRoute} color="#475569" width={1.5} animated={true} />
      )}

      {/* Optimized route - bright with glow */}
      {optimizedRoute && (
        <AnimatedRoute positions={optimizedRoute} color="#a78bfa" width={3} animated={false} />
      )}
    </MapContainer>
  )
}
