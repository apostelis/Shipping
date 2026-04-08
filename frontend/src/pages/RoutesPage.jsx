import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useScenario } from '../hooks/useScenario'
import RouteMap from '../components/RouteMap'
import ComparisonTable from '../components/ComparisonTable'

export default function RoutesPage() {
  const { activeScenario } = useScenario()
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
        setOrigin(data.find(p => p.code === 'SHANGHAI')?.code || data[0].code)
        setDestination(data.find(p => p.code === 'ROTTERDAM')?.code || data[1].code)
      }
    })
  }, [])

  const handleOptimize = async () => {
    if (!origin || !destination) return
    setLoading(true)
    try {
      const [optimized, alts] = await Promise.all([
        api.optimizeRoute({ originPortCode: origin, destinationPortCode: destination, objectiveType: objective }),
        api.getAlternativeRoutes(origin, destination, 3),
      ])
      setResult(optimized)
      setAlternatives(alts)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="p-8 max-w-6xl">
      <h2>Route Optimizer</h2>
      <p className="text-stripe-body mt-2 mb-6 font-light">
        Select origin and destination ports to find AI-optimized shipping routes.
      </p>

      <div className="flex gap-4 mb-6">
        <select value={origin} onChange={e => setOrigin(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          {ports.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <span className="self-center text-stripe-body">&rarr;</span>
        <select value={destination} onChange={e => setDestination(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          {ports.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <select value={objective} onChange={e => setObjective(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
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

      <RouteMap ports={ports} optimizedRoute={optimizedCoords} naiveRoute={naiveCoords} />

      {result && (
        <div className="mt-6 space-y-6">
          {result.totalCost > 0 && (
            <div className="bg-stripe-purple/5 border border-stripe-purple-light rounded-stripe p-4 flex items-center gap-3">
              <span className="text-stripe-purple text-2xl font-light">AI</span>
              <div>
                <p className="text-sm font-normal text-stripe-navy">Route optimized with {result.segments?.length || 0} stops</p>
                <p className="text-xs text-stripe-body">Total cost: ${parseFloat(result.totalCost).toLocaleString()} | Transit: {parseFloat(result.totalTimeHours).toFixed(0)}h</p>
              </div>
            </div>
          )}

          <ComparisonTable optimized={result} naive={alternatives[alternatives.length - 1]} />

          {alternatives.length > 1 && (
            <div>
              <h3 className="mb-3">Alternative Routes</h3>
              <div className="grid grid-cols-3 gap-4">
                {alternatives.map((alt, i) => (
                  <div key={alt.routeId} className="bg-white border border-stripe-border rounded-stripe p-4 shadow-stripe-ambient">
                    <p className="text-sm font-normal text-stripe-navy">Route {i + 1}</p>
                    <p className="text-xs text-stripe-body mt-1">
                      {alt.segments?.map(s => s.originPortCode).join(' → ')} → {alt.segments?.[alt.segments.length - 1]?.destinationPortCode}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs text-stripe-body">
                      <span>${parseFloat(alt.totalCost).toLocaleString()}</span>
                      <span>{parseFloat(alt.totalTimeHours).toFixed(0)}h</span>
                      <span>{parseFloat(alt.totalDistanceNm).toLocaleString()} nm</span>
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
