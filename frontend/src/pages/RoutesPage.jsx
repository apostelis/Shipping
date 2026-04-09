import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useScenario } from '../hooks/useScenario'
import { useTheme } from '../hooks/useTheme'
import { fmtDollar, fmtDollarFull, fmtHours } from '../utils/format'
import RouteMap from '../components/RouteMap'
import ComparisonTable from '../components/ComparisonTable'

export default function RoutesPage() {
  const { activeScenario } = useScenario()
  const { dark } = useTheme()
  const [ports, setPorts] = useState([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [objective, setObjective] = useState('BALANCED')
  const [result, setResult] = useState(null)
  const [alternatives, setAlternatives] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getPorts().then((data) => {
      setPorts(data)
      if (data.length >= 2) {
        const o = data.find(p => p.code === 'CNSHA')?.code || data[0].code
        const d = data.find(p => p.code === 'NLRTM')?.code || data[1].code
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
    } finally {
      setLoading(false)
    }
  }

  // Auto-optimize on first load
  useEffect(() => {
    if (origin && destination) runOptimize(origin, destination, objective)
  }, [origin, destination])

  const handleOptimize = () => runOptimize(origin, destination, objective)

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

      <div className="flex gap-4 mb-6">
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
        <button onClick={handleOptimize} disabled={loading}
          className="bg-stripe-purple text-white px-4 py-2 rounded text-sm font-normal hover:bg-stripe-purple-hover transition-colors disabled:opacity-50">
          {loading ? 'Optimizing...' : 'Optimize Route'}
        </button>
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

          {alternatives.length > 1 && (
            <div>
              <h3 className="mb-3">Alternative Routes</h3>
              <div className="grid grid-cols-3 gap-3">
                {alternatives.map((alt, i) => (
                  <div key={alt.routeId} className={`border rounded-stripe p-4 transition-colors ${dark ? 'bg-gray-950 border-white/5 hover:border-violet-500/20' : 'bg-white border-stripe-border hover:border-stripe-purple/30 shadow-stripe-ambient'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-normal ${dark ? 'text-white/80' : 'text-stripe-navy'}`}>Route {i + 1}</p>
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
