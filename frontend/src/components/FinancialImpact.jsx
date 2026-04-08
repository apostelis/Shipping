import { useEffect, useState } from 'react'

function AnimatedDollar({ value, prefix = '$', duration = 1200 }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const target = parseFloat(value)
    if (isNaN(target)) return
    const startTime = performance.now()
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <span>{prefix}{displayed.toLocaleString()}</span>
}

const scenarios = {
  normal: { saved: 2800000, atRisk: 0, forecast: 18700000, optimized: 47 },
  'demand-spike': { saved: 3400000, atRisk: 1200000, forecast: 22100000, optimized: 42 },
  'port-disruption': { saved: 5100000, atRisk: 3800000, forecast: 19400000, optimized: 38 },
  'hormuz-blockade': { saved: 8900000, atRisk: 12400000, forecast: 24600000, optimized: 56 },
}

export default function FinancialImpact({ scenarioId }) {
  const data = scenarios[scenarioId] || scenarios.normal

  return (
    <div className="bg-gray-950 border border-white/5 rounded-stripe p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#a78bfa" strokeWidth="1.5">
          <path d="M8 1v14M4.5 4h7a2.5 2.5 0 010 5H5a2.5 2.5 0 000 5h7.5"/>
        </svg>
        <span className="text-xs font-medium tracking-wider text-white/40 uppercase">Financial Impact</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Savings Captured</p>
          <p className="text-2xl font-light text-emerald-400 tracking-tight">
            <AnimatedDollar value={data.saved} />
          </p>
          <p className="text-[10px] text-white/20 mt-1">this quarter</p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Revenue at Risk</p>
          <p className="text-2xl font-light text-amber-400 tracking-tight">
            <AnimatedDollar value={data.atRisk} />
          </p>
          <p className="text-[10px] text-white/20 mt-1">without AI mitigation</p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Forecast Revenue</p>
          <p className="text-2xl font-light text-white/80 tracking-tight">
            <AnimatedDollar value={data.forecast} />
          </p>
          <p className="text-[10px] text-white/20 mt-1">next 30 days</p>
        </div>
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Routes Optimized</p>
          <p className="text-2xl font-light text-violet-400 tracking-tight">
            <AnimatedDollar value={data.optimized} prefix="" />
          </p>
          <p className="text-[10px] text-white/20 mt-1">active lanes</p>
        </div>
      </div>
    </div>
  )
}
