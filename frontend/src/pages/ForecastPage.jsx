import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useScenario } from '../hooks/useScenario'
import { useTheme } from '../hooks/useTheme'
import ForecastChart from '../components/ForecastChart'

export default function ForecastPage() {
  const { activeScenario } = useScenario()
  const { dark } = useTheme()
  const [tradeLanes, setTradeLanes] = useState([])
  const [algorithms, setAlgorithms] = useState([])
  const [selectedLane, setSelectedLane] = useState('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('SIMPLE_MOVING_AVERAGE')
  const [forecast, setForecast] = useState(null)
  const [historical, setHistorical] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([api.getTradeLanes(), api.getAlgorithms()])
      .then(([lanes, algs]) => {
        setTradeLanes(lanes)
        setAlgorithms(algs)
        if (lanes.length > 0) setSelectedLane(lanes[0])
      })
  }, [])

  useEffect(() => {
    if (!selectedLane) return
    setLoading(true)
    Promise.all([
      api.generateForecast({
        tradeLane: selectedLane,
        cargoType: 'CONTAINER',
        forecastHorizon: 30,
        granularity: 'DAILY',
        algorithm: selectedAlgorithm,
      }),
      api.getHistoricalDemand(selectedLane, 90),
    ])
      .then(([forecastResult, historicalData]) => {
        setForecast(forecastResult)
        setHistorical(historicalData)
      })
      .finally(() => setLoading(false))
  }, [selectedLane, selectedAlgorithm, activeScenario])

  const isDemandSpike = activeScenario === 'demand-spike' && selectedLane === 'MED-NORTHEUROPE'

  return (
    <div className="p-8 max-w-6xl animate-page-in">
      <h2>Demand Forecast</h2>
      <p className={`mt-2 mb-6 font-light ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
        AI-powered demand prediction with confidence intervals across shipping lanes.
      </p>

      <div className="flex gap-4 mb-6">
        <select value={selectedLane} onChange={e => setSelectedLane(e.target.value)}
          className={`border rounded px-3 py-2 text-sm focus:outline-none ${
            dark
              ? 'bg-white/5 border-white/10 text-white/80 focus:border-violet-500'
              : 'bg-white border-stripe-border text-stripe-navy focus:border-stripe-purple'
          }`}>
          {tradeLanes.map(lane => <option key={lane} value={lane}>{lane}</option>)}
        </select>
        <select value={selectedAlgorithm} onChange={e => setSelectedAlgorithm(e.target.value)}
          className={`border rounded px-3 py-2 text-sm focus:outline-none ${
            dark
              ? 'bg-white/5 border-white/10 text-white/80 focus:border-violet-500'
              : 'bg-white border-stripe-border text-stripe-navy focus:border-stripe-purple'
          }`}>
          {algorithms.map(alg => <option key={alg} value={alg}>{alg.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isDemandSpike && (
        <div className={`rounded-stripe p-4 mb-6 flex items-center gap-3 border ${
          dark
            ? 'bg-violet-500/10 border-violet-500/20'
            : 'bg-stripe-purple/5 border-stripe-purple-light'
        }`}>
          <span className="text-stripe-purple text-lg">AI</span>
          <div>
            <p className={`text-sm font-normal ${dark ? 'text-white/90' : 'text-stripe-navy'}`}>
              Demand spike detected on MED-NORTHEUROPE lane
            </p>
            <p className={`text-xs ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
              AI predicted this surge 3 weeks in advance, enabling proactive capacity planning.
            </p>
          </div>
        </div>
      )}

      {loading && <p className={`text-sm ${dark ? 'text-white/40' : 'text-stripe-body'}`}>Loading forecast...</p>}
      {forecast && forecast.forecastPoints && (
        <div className={`rounded-stripe p-6 border ${
          dark ? 'bg-white/5 border-white/5' : 'bg-white border-stripe-border shadow-stripe-ambient'
        }`}>
          <ForecastChart
            historicalData={historical}
            forecastData={forecast.forecastPoints}
            algorithmName={forecast.algorithm?.replace(/_/g, ' ') || selectedAlgorithm}
          />
        </div>
      )}

      {forecast && (
        <div className="mt-6 flex gap-4">
          <div className={`rounded-stripe px-4 py-3 border ${
            dark ? 'bg-white/5 border-white/5' : 'bg-white border-stripe-border'
          }`}>
            <p className={`text-xs ${dark ? 'text-white/30' : 'text-stripe-body'}`}>Predicted Avg</p>
            <p className={`text-lg font-light ${dark ? 'text-white/80' : 'text-stripe-navy'}`}>
              {parseFloat(forecast.predictedValue).toLocaleString()} TEU
            </p>
          </div>
          <div className={`rounded-stripe px-4 py-3 border ${
            dark ? 'bg-white/5 border-white/5' : 'bg-white border-stripe-border'
          }`}>
            <p className={`text-xs ${dark ? 'text-white/30' : 'text-stripe-body'}`}>Confidence Range</p>
            <p className={`text-lg font-light ${dark ? 'text-white/80' : 'text-stripe-navy'}`}>
              {parseFloat(forecast.confidenceLower).toLocaleString()} - {parseFloat(forecast.confidenceUpper).toLocaleString()} TEU
            </p>
          </div>
          <span className="ai-badge">Powered by AI</span>
          {forecast.accuracyMape && (
            <div className={`rounded-stripe px-4 py-3 border ${
              dark ? 'bg-white/5 border-white/5' : 'bg-white border-stripe-border'
            }`}>
              <span className="inline-block bg-green-50 text-stripe-success-text text-xs px-2 py-0.5 rounded border border-green-200 font-normal">
                MAPE: {parseFloat(forecast.accuracyMape).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
