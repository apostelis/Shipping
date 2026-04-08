import { useEffect, useState } from 'react'
import { useScenario } from '../hooks/useScenario'
import { api } from '../api/client'
import KpiCard from '../components/KpiCard'

export default function DashboardPage() {
  const { activeScenario, scenarios } = useScenario()
  const [kpis, setKpis] = useState(null)

  useEffect(() => {
    api.getKpis(activeScenario).then(setKpis)
  }, [activeScenario])

  const scenario = scenarios.find(s => s.id === activeScenario)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2>AI Shipping Intelligence</h2>
        {scenario && (
          <p className="text-stripe-body mt-2 text-base font-light">
            {scenario.description}
          </p>
        )}
      </div>

      {kpis && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <KpiCard
            label="Cost Savings"
            value={kpis.costSavingsPercent}
            unit="%"
            trend="up"
            description="vs. unoptimized routing"
          />
          <KpiCard
            label="Forecast Accuracy"
            value={kpis.forecastAccuracyPercent}
            unit="%"
            trend="up"
            description="MAPE across all lanes"
          />
          <KpiCard
            label="Routes Optimized"
            value={kpis.routesOptimized}
            unit=""
            description="active optimized routes"
          />
          <KpiCard
            label="Avg Transit Reduction"
            value={kpis.avgTransitReductionPercent}
            unit="%"
            trend="up"
            description="time saved per voyage"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <a href="/routes" className="block bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient hover:shadow-stripe transition-shadow">
          <h3>Route Optimizer</h3>
          <p className="text-stripe-body text-sm mt-2 font-light">
            Find optimal shipping routes with AI-powered cost, time, and distance optimization.
          </p>
          <span className="inline-block mt-4 text-sm text-stripe-purple font-normal">
            Explore routes &rarr;
          </span>
        </a>
        <a href="/forecast" className="block bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient hover:shadow-stripe transition-shadow">
          <h3>Demand Forecast</h3>
          <p className="text-stripe-body text-sm mt-2 font-light">
            AI-powered demand prediction with confidence intervals and trend analysis.
          </p>
          <span className="inline-block mt-4 text-sm text-stripe-purple font-normal">
            View forecasts &rarr;
          </span>
        </a>
      </div>
    </div>
  )
}
