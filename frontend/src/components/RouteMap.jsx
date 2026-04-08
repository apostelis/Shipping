import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../hooks/useTheme'

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

function MovingVessel({ positions, color, dark }) {
  const [pos, setPos] = useState(positions[0])
  const progressRef = useRef(0)

  useEffect(() => {
    if (!positions || positions.length < 2) return

    // Calculate total path length in simple coordinate distance
    const segments = []
    let totalLen = 0
    for (let i = 0; i < positions.length - 1; i++) {
      const dx = positions[i + 1][1] - positions[i][1]
      const dy = positions[i + 1][0] - positions[i][0]
      const len = Math.sqrt(dx * dx + dy * dy)
      segments.push({ start: positions[i], end: positions[i + 1], len })
      totalLen += len
    }

    let animId
    const speed = 0.003 // progress per frame (0 to 1)

    function tick() {
      progressRef.current = (progressRef.current + speed) % 1
      const targetDist = progressRef.current * totalLen

      let accumulated = 0
      for (const seg of segments) {
        if (accumulated + seg.len >= targetDist) {
          const t = (targetDist - accumulated) / seg.len
          const lat = seg.start[0] + t * (seg.end[0] - seg.start[0])
          const lng = seg.start[1] + t * (seg.end[1] - seg.start[1])
          setPos([lat, lng])
          break
        }
        accumulated += seg.len
      }
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [positions])

  if (!pos) return null

  return (
    <>
      {/* Glow */}
      <CircleMarker
        center={pos}
        radius={12}
        pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 0, stroke: false }}
      />
      {/* Vessel dot */}
      <CircleMarker
        center={pos}
        radius={5}
        pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 1, weight: 2 }}
      />
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

      {naiveRoute && (
        <AnimatedRoute positions={naiveRoute} color={colors.naive} width={1.5} animated={true} />
      )}

      {optimizedRoute && (
        <AnimatedRoute positions={optimizedRoute} color={colors.optimized} width={3} animated={false} />
      )}

      {optimizedRoute && optimizedRoute.length >= 2 && (
        <MovingVessel positions={optimizedRoute} color={colors.optimized} dark={dark} />
      )}
    </MapContainer>
  )
}
