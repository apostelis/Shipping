import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScenario } from '../hooks/useScenario'
import { useTheme } from '../hooks/useTheme'
import { api } from '../api/client'
import KpiCard from '../components/KpiCard'
import { SkeletonCard } from '../components/LoadingSkeleton'
import LiveTicker from '../components/LiveTicker'
import FinancialImpact from '../components/FinancialImpact'
import RoiCalculator from '../components/RoiCalculator'

export default function DashboardPage() {
  const { activeScenario, scenarios } = useScenario()
  const { dark } = useTheme()
  const [kpis, setKpis] = useState(null)

  useEffect(() => {
    api.getKpis(activeScenario).then(setKpis)
  }, [activeScenario])

  const scenario = scenarios.find(s => s.id === activeScenario)

  return (
    <div className="p-8 max-w-6xl animate-page-in">
      <div className="mb-8">
        <h2>AI Shipping Intelligence</h2>
        {scenario && (
          <p className={`mt-2 text-base font-light ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
            {scenario.description}
          </p>
        )}
      </div>

      {!kpis ? (
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6 mb-6">
          <KpiCard label="Cost Savings" value={kpis.costSavingsPercent} unit="%" trend="up" description="vs. unoptimized routing" />
          <KpiCard label="Forecast Accuracy" value={kpis.forecastAccuracyPercent} unit="%" trend="up" description="MAPE across all lanes" />
          <KpiCard label="Routes Optimized" value={kpis.routesOptimized} unit="" description="active optimized routes" />
          <KpiCard label="Avg Transit Reduction" value={kpis.avgTransitReductionPercent} unit="%" trend="up" description="time saved per voyage" />
        </div>
      )}

      <div className="mb-6">
        <LiveTicker />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <FinancialImpact scenarioId={activeScenario} />
        <RoiCalculator scenarioId={activeScenario} />
        <div className="space-y-4">
          <Link to="/routes" className={`block rounded-stripe p-5 transition-shadow border ${
            dark
              ? 'bg-white/5 border-white/5 hover:border-violet-500/20'
              : 'bg-white border-stripe-border shadow-stripe-ambient hover:shadow-stripe'
          }`}>
            <h3>Route Optimizer</h3>
            <p className={`text-sm mt-1 font-light ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
              AI-powered cost, time, and distance optimization across global shipping lanes.
            </p>
            <span className={`inline-block mt-3 text-sm font-normal ${dark ? 'text-violet-400' : 'text-stripe-purple'}`}>Explore routes &rarr;</span>
          </Link>
          <Link to="/forecast" className={`block rounded-stripe p-5 transition-shadow border ${
            dark
              ? 'bg-white/5 border-white/5 hover:border-violet-500/20'
              : 'bg-white border-stripe-border shadow-stripe-ambient hover:shadow-stripe'
          }`}>
            <h3>Demand Forecast</h3>
            <p className={`text-sm mt-1 font-light ${dark ? 'text-white/40' : 'text-stripe-body'}`}>
              Predictive demand intelligence with confidence intervals and early warning.
            </p>
            <span className={`inline-block mt-3 text-sm font-normal ${dark ? 'text-violet-400' : 'text-stripe-purple'}`}>View forecasts &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
