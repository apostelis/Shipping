import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useScenario } from '../hooks/useScenario'
import { useTheme } from '../hooks/useTheme'
import { fmtDollar, fmtDollarFull, fmtHours } from '../utils/format'
import RouteMap from '../components/RouteMap'
import ComparisonTable from '../components/ComparisonTable'
import BookingQueue from '../components/BookingQueue'

export default function RoutesPage() {
  const { activeScenario } = useScenario()
  const { dark } = useTheme()
  const [ports, setPorts] = useState([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [objective, setObjective] = useState('BALANCED')
  const [result, setResult] = useState(null)
  const [alternatives, setAlternatives] = useState([])
  const [selectedAltIndex, setSelectedAltIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [vessels, setVessels] = useState([])
  const [selectedVessel, setSelectedVessel] = useState(null)

  useEffect(() => {
    Promise.all([api.getPorts(), api.getVessels()])
      .then(([portData, vesselData]) => {
        setPorts(portData)
        setVessels(vesselData)
        if (portData.length >= 2) {
          const o = portData.find(p => p.code === 'CNSHA')?.code || portData[0].code
          const d = portData.find(p => p.code === 'NLRTM')?.code || portData[1].code
          setOrigin(o)
          setDestination(d)
        }
      })
  }, [])

  const runOptimize = async (o, d, obj) => {
    if (!o || !d) return
    setLoading(true)
    try {
      const [optimized, alts] = await Promise.all([
        api.optimizeRoute({ originPortCode: o, destinationPortCode: d, objectiveType: obj }),
        api.getAlternativeRoutes(o, d, 3),
      ])
      setResult(optimized)
      setAlternatives(alts)
      setSelectedAltIndex(0)
    } finally {
      setLoading(false)
    }
  }

  // Auto-optimize on any change
  useEffect(() => {
    if (origin && destination) runOptimize(origin, destination, objective)
  }, [origin, destination, objective, activeScenario, selectedVessel])

  const getPortCoords = (code) => {
    const p = ports.find(port => port.code === code)
    return p ? [parseFloat(p.latitude), parseFloat(p.longitude)] : null
  }

  const routeToCoords = (route) => {
    if (!route?.segments) return null
    const coords = [getPortCoords(route.segments[0]?.originPortCode)]
    route.segments.forEach(seg => coords.push(getPortCoords(seg.destinationPortCode)))
    return coords.filter(Boolean)
  }

  const optimizedCoords = result ? routeToCoords(result) : null
  const naiveCoords = (origin && destination) ? [getPortCoords(origin), getPortCoords(destination)].filter(Boolean) : null

  const selectClass = `border rounded px-3 py-2 text-sm focus:outline-none ${
    dark
      ? 'bg-white/5 border-white/10 text-white/80 focus:border-violet-500'
      : 'bg-white border-stripe-border text-stripe-navy focus:border-stripe-purple'
  }`

  return (
    <div className="p-8 max-w-6xl animate-page-in">
      <h2>Route Optimizer</h2>
      <p className={`mt-2 mb-6 font-light ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
        Select origin and destination ports to find AI-optimized shipping routes.
      </p>

      {/* Scenario impact banner */}
      {activeScenario !== 'normal' && (
        <div className={`rounded-stripe p-4 mb-6 border ${
          activeScenario === 'hormuz-blockade'
            ? dark ? 'bg-red-950/30 border-red-500/20' : 'bg-red-50 border-red-200'
            : activeScenario === 'port-disruption'
              ? dark ? 'bg-amber-950/30 border-amber-500/20' : 'bg-amber-50 border-amber-200'
              : dark ? 'bg-violet-950/30 border-violet-500/20' : 'bg-violet-50 border-violet-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 text-lg ${
              activeScenario === 'hormuz-blockade' ? 'text-red-400' :
              activeScenario === 'port-disruption' ? 'text-amber-400' : 'text-violet-400'
            }`}>
              {activeScenario === 'hormuz-blockade' ? '\u26A0' : activeScenario === 'port-disruption' ? '\u26A1' : '\uD83D\uDCC8'}
            </span>
            <div>
              <p className={`text-sm font-medium ${dark ? 'text-white/90' : 'text-stripe-navy'}`}>
                {activeScenario === 'hormuz-blockade' && 'Strait of Hormuz Blockade \u2014 Gulf routes disrupted'}
                {activeScenario === 'port-disruption' && 'Rotterdam Port Closed \u2014 Northern Europe routes disrupted'}
                {activeScenario === 'demand-spike' && 'Demand Surge Active \u2014 Mediterranean lanes under pressure'}
              </p>
              <p className={`text-xs mt-1 ${dark ? 'text-white/50' : 'text-stripe-body'}`}>
                {activeScenario === 'hormuz-blockade' && 'AI has removed blocked lanes from the graph and is rerouting all Gulf traffic via Cape of Good Hope. Try routing Dubai \u2192 Rotterdam to see the crisis reroute.'}
                {activeScenario === 'port-disruption' && 'Rotterdam is offline. AI is rerouting European traffic through Hamburg, Valencia, and Mediterranean alternatives. Try routing Shanghai \u2192 Rotterdam to see the impact.'}
                {activeScenario === 'demand-spike' && 'High demand on MED-NORTHEUROPE is increasing costs. AI is finding cost-efficient alternatives. Try routing Piraeus \u2192 Rotterdam.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suggested routes */}
      {activeScenario !== 'normal' && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className={`text-xs self-center mr-1 ${dark ? 'text-white/30' : 'text-stripe-body'}`}>Try:</span>
          {activeScenario === 'hormuz-blockade' && (
            <>
              <button onClick={() => { setOrigin('AEJEA'); setDestination('NLRTM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Dubai &rarr; Rotterdam
              </button>
              <button onClick={() => { setOrigin('INNSA'); setDestination('AEJEA'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Mumbai &rarr; Dubai
              </button>
              <button onClick={() => { setOrigin('SAJED'); setDestination('NLRTM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Jeddah &rarr; Rotterdam
              </button>
            </>
          )}
          {activeScenario === 'port-disruption' && (
            <>
              <button onClick={() => { setOrigin('CNSHA'); setDestination('NLRTM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Shanghai &rarr; Rotterdam
              </button>
              <button onClick={() => { setOrigin('CNSHA'); setDestination('DEHAM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Shanghai &rarr; Hamburg
              </button>
              <button onClick={() => { setOrigin('AEJEA'); setDestination('NLRTM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Dubai &rarr; Rotterdam
              </button>
            </>
          )}
          {activeScenario === 'demand-spike' && (
            <>
              <button onClick={() => { setOrigin('GRPIR'); setDestination('NLRTM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Piraeus &rarr; Rotterdam
              </button>
              <button onClick={() => { setOrigin('GRPIR'); setDestination('DEHAM'); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-white/60 hover:border-violet-500/30 hover:text-violet-400' : 'border-stripe-border text-stripe-body hover:border-stripe-purple hover:text-stripe-purple'}`}>
                Piraeus &rarr; Hamburg
              </button>
            </>
          )}
        </div>
      )}

      <BookingQueue onSelectBooking={(b) => {
        setOrigin(b.originCode)
        setDestination(b.destinationCode)
      }} />

      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <select
          value={selectedVessel || ''}
          onChange={async (e) => {
            const vesselId = e.target.value
            setSelectedVessel(vesselId || null)
            if (vesselId) {
              const vessel = vessels.find(v => v.id === vesselId)
              if (vessel) {
                const specs = JSON.parse(vessel.specifications || '{}')
                if (specs.draftM) {
                  await api.applyVesselConstraint(specs.draftM)
                }
              }
            } else {
              await api.applyScenario(activeScenario)
            }
          }}
          className={selectClass}
        >
          <option value="">Any vessel</option>
          {vessels.filter(v => v.status === 'ACTIVE').map(v => {
            const specs = JSON.parse(v.specifications || '{}')
            return (
              <option key={v.id} value={v.id}>
                {v.name} ({v.capacityTeu.toLocaleString()} TEU, {specs.draftM}m draft)
              </option>
            )
          })}
        </select>
        {selectedVessel && (() => {
          const v = vessels.find(vsl => vsl.id === selectedVessel)
          if (!v) return null
          const specs = JSON.parse(v.specifications || '{}')
          return (
            <span className={`text-xs self-center px-2 py-1 rounded ${dark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-stripe-body'}`}>
              {v.name} • {specs.draftM}m draft • {specs.speedKnots}kn
            </span>
          )
        })()}
        <select value={origin} onChange={e => setOrigin(e.target.value)} className={selectClass}>
          {ports.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <span className={`self-center ${dark ? 'text-white/30' : 'text-stripe-body'}`}>&rarr;</span>
        <select value={destination} onChange={e => setDestination(e.target.value)} className={selectClass}>
          {ports.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <select value={objective} onChange={e => setObjective(e.target.value)} className={selectClass}>
          <option value="BALANCED">Balanced</option>
          <option value="COST">Minimize Cost</option>
          <option value="TIME">Minimize Time</option>
          <option value="DISTANCE">Minimize Distance</option>
        </select>
        {loading && (
          <span className={`text-xs self-center ${dark ? 'text-violet-400' : 'text-stripe-purple'}`}>
            Optimizing...
          </span>
        )}
      </div>

      <RouteMap ports={ports} optimizedRoute={optimizedCoords} naiveRoute={naiveCoords} originCode={origin} destinationCode={destination} />

      {result && (
        <div className="mt-6 space-y-6">
          {result.totalCost > 0 && (
            <div className={`rounded-stripe p-4 flex items-center gap-4 border ${dark ? 'bg-gray-950 border-violet-500/20' : 'bg-stripe-purple/5 border-stripe-purple/20'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${dark ? 'bg-violet-500/10' : 'bg-stripe-purple/10'}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={dark ? '#a78bfa' : '#533afd'} strokeWidth="1.5">
                  <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3-4.9-2.6-4.9 2.6.9-5.3-4-3.9 5.5-.8z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-normal ${dark ? 'text-white/90' : 'text-stripe-navy'}`}>Route optimized — {result.segments?.length || 0} segments</p>
                <p className={`text-xs ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
                  {result.segments?.map(s => s.originPortCode).join(' → ')} → {result.segments?.[result.segments.length - 1]?.destinationPortCode}
                </p>
              </div>
              <span className="ai-badge">Powered by AI</span>
            </div>
          )}

          <ComparisonTable optimized={result} naive={alternatives[alternatives.length - 1]} />

          {/* Why this route explanation */}
          {result && result.segments && result.segments.length > 0 && (
            <div className={`rounded-stripe p-5 border ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-stripe-border'}`}>
              <div className="flex items-center gap-2 mb-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={dark ? '#a78bfa' : '#533afd'} strokeWidth="1.5">
                  <circle cx="8" cy="8" r="7"/>
                  <path d="M8 5v3M8 10.5v.5"/>
                </svg>
                <span className={`text-xs font-medium tracking-wider uppercase ${dark ? 'text-white/40' : 'text-stripe-body'}`}>Why this route</span>
              </div>
              <div className={`text-sm font-light leading-relaxed ${dark ? 'text-white/60' : 'text-stripe-body'}`}>
                {(() => {
                  const segments = result.segments
                  const isMultiStop = segments.length > 1
                  const stops = segments.map(s => s.originPortCode).concat(segments[segments.length - 1].destinationPortCode)
                  const naive = alternatives[alternatives.length - 1]
                  const hasSavings = naive && naive.totalCost > 0 && result.totalCost < naive.totalCost

                  const parts = []

                  if (isMultiStop) {
                    parts.push(`AI selected a ${segments.length}-segment route via ${stops.slice(1, -1).join(', ')} instead of a direct path.`)
                  } else {
                    parts.push(`AI found the direct route ${stops[0]} \u2192 ${stops[1]} is already optimal for the selected objective.`)
                  }

                  if (objective === 'COST') {
                    parts.push('Optimizing for lowest total cost including fuel, canal fees, and transit charges.')
                  } else if (objective === 'TIME') {
                    parts.push('Optimizing for fastest transit time, accepting higher cost where necessary.')
                  } else if (objective === 'DISTANCE') {
                    parts.push('Optimizing for shortest nautical distance.')
                  } else {
                    parts.push('Using balanced optimization that weighs cost, time, and distance together.')
                  }

                  if (hasSavings) {
                    const savedPct = ((1 - result.totalCost / naive.totalCost) * 100).toFixed(0)
                    const savedHrs = (naive.totalTimeHours - result.totalTimeHours).toFixed(0)
                    if (savedPct > 0) parts.push(`This saves ${savedPct}% in cost compared to the longest alternative.`)
                    if (savedHrs > 0) parts.push(`Transit is ${fmtHours(Math.abs(savedHrs))} shorter.`)
                  }

                  if (activeScenario === 'hormuz-blockade' && (origin === 'AEJEA' || origin === 'SAJED' || destination === 'AEJEA' || destination === 'SAJED')) {
                    parts.push('Gulf routes through the Strait of Hormuz are currently blocked. The AI has automatically rerouted via available alternatives.')
                  }

                  if (activeScenario === 'port-disruption' && (origin === 'NLRTM' || destination === 'NLRTM')) {
                    parts.push('Rotterdam is currently offline. The AI has rerouted through the nearest available port with sufficient capacity.')
                  }

                  return parts.join(' ')
                })()}
              </div>
            </div>
          )}

          {alternatives.length > 1 && (
            <div>
              <h3 className="mb-3">Alternative Routes</h3>
              <div className="grid grid-cols-3 gap-3">
                {alternatives.map((alt, i) => (
                  <div key={alt.routeId} onClick={() => { setResult(alt); setSelectedAltIndex(i); }}
                    className={`border rounded-stripe p-4 transition-colors cursor-pointer ${
                      selectedAltIndex === i
                        ? dark ? 'bg-violet-950/30 border-violet-500/40' : 'bg-stripe-purple/5 border-stripe-purple/40'
                        : dark ? 'bg-gray-950 border-white/5 hover:border-violet-500/20' : 'bg-white border-stripe-border hover:border-stripe-purple/30 shadow-stripe-ambient'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-normal ${dark ? 'text-white/80' : 'text-stripe-navy'}`}>
                        {selectedAltIndex === i ? '● ' : ''}Route {i + 1}
                      </p>
                      <span className={`text-[10px] font-mono ${dark ? 'text-white/30' : 'text-stripe-body'}`}>{parseFloat(alt.totalDistanceNm).toLocaleString()} nm</span>
                    </div>
                    <p className={`text-[10px] mb-3 ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
                      {alt.segments?.map(s => s.originPortCode).join(' → ')} → {alt.segments?.[alt.segments.length - 1]?.destinationPortCode}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-emerald-400 cursor-default" title={fmtDollarFull(alt.totalCost)}>{fmtDollar(alt.totalCost)}</span>
                      <span className={dark ? 'text-white/50' : 'text-stripe-body'}>{fmtHours(alt.totalTimeHours)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
