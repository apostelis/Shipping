import { useEffect, useState } from 'react'
import { useScenario } from '../hooks/useScenario'
import { api } from '../api/client'
import KpiCard from '../components/KpiCard'
import { SkeletonCard } from '../components/LoadingSkeleton'
import LiveTicker from '../components/LiveTicker'
import FinancialImpact from '../components/FinancialImpact'

export default function DashboardPage() {
  const { activeScenario, scenarios } = useScenario()
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
          <p className="text-stripe-body mt-2 text-base font-light">
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

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <FinancialImpact scenarioId={activeScenario} />
        </div>
        <div className="col-span-3 space-y-4">
          <a href="/routes" className="block bg-white border border-stripe-border rounded-stripe p-5 shadow-stripe-ambient hover:shadow-stripe transition-shadow">
            <h3>Route Optimizer</h3>
            <p className="text-stripe-body text-sm mt-1 font-light">
              AI-powered cost, time, and distance optimization across global shipping lanes.
            </p>
            <span className="inline-block mt-3 text-sm text-stripe-purple font-normal">Explore routes &rarr;</span>
          </a>
          <a href="/forecast" className="block bg-white border border-stripe-border rounded-stripe p-5 shadow-stripe-ambient hover:shadow-stripe transition-shadow">
            <h3>Demand Forecast</h3>
            <p className="text-stripe-body text-sm mt-1 font-light">
              Predictive demand intelligence with confidence intervals and early warning.
            </p>
            <span className="inline-block mt-3 text-sm text-stripe-purple font-normal">View forecasts &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}
