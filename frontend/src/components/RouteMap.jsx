import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../hooks/useTheme'
import { toSeaRoute } from '../utils/searoute'

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

function AnimatedRoute({ positions, color, width, animated, glowColor }) {
  if (!positions || positions.length < 2) return null
  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: glowColor || color, weight: width + 6, opacity: 0.15, lineCap: 'round' }}
      />
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

function SeaRoutes({ naiveRoute, optimizedRoute, colors }) {
  const seaNaive = useMemo(() => naiveRoute ? toSeaRoute(naiveRoute) : null, [naiveRoute])
  const seaOptimized = useMemo(() => optimizedRoute ? toSeaRoute(optimizedRoute) : null, [optimizedRoute])

  return (
    <>
      {seaNaive && (
        <AnimatedRoute positions={seaNaive} color={colors.naive} width={1.5} animated={true} />
      )}
      {seaOptimized && (
        <AnimatedRoute positions={seaOptimized} color={colors.optimized} width={3} animated={false} />
      )}
    </>
  )
}

export default function RouteMap({ ports, optimizedRoute, naiveRoute, originCode, destinationCode }) {
  const { dark } = useTheme()

  const tiles = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const bg = dark ? '#0a0f1e' : '#f8fafc'

  const colors = dark
    ? { origin: '#22d3ee', dest: '#a78bfa', port: 'rgba(255,255,255,0.4)', portFill: 'rgba(255,255,255,0.6)', optimized: '#a78bfa', naive: '#475569' }
    : { origin: '#533afd', dest: '#ea2261', port: 'rgba(83,58,253,0.3)', portFill: 'rgba(83,58,253,0.5)', optimized: '#533afd', naive: '#94a3b8' }

  return (
    <MapContainer
      center={[25, 45]}
      zoom={3}
      className={`h-[520px] w-full rounded-stripe border shadow-stripe ${dark ? 'border-white/10' : 'border-stripe-border'}`}
      style={{ background: bg }}
    >
      <TileLayer
        key={dark ? 'dark' : 'light'}
        attribution='&copy; CartoDB'
        url={tiles}
      />
      <FitBounds ports={ports} />

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
              color: isOrigin ? colors.origin : isDestination ? colors.dest : colors.port,
              fillColor: isOrigin ? colors.origin : isDestination ? colors.dest : colors.portFill,
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

      <SeaRoutes naiveRoute={naiveRoute} optimizedRoute={optimizedRoute} colors={colors} />

    </MapContainer>
  )
}
