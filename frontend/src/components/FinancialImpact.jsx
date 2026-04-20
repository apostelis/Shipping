import { useEffect, useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { fmtDollar, fmtDollarFull } from '../utils/format'

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

  if (prefix === '') return <span title={displayed.toLocaleString()} className="cursor-default">{displayed.toLocaleString()}</span>
  return <span title={fmtDollarFull(displayed)} className="cursor-default">{fmtDollar(displayed)}</span>
}

const scenarios = {
  normal: { saved: 2800000, atRisk: 0, forecast: 18700000, optimized: 47 },
  'demand-spike': { saved: 3400000, atRisk: 1200000, forecast: 22100000, optimized: 42 },
  'port-disruption': { saved: 5100000, atRisk: 3800000, forecast: 19400000, optimized: 38 },
  'hormuz-blockade': { saved: 8900000, atRisk: 12400000, forecast: 24600000, optimized: 56 },
}

export default function FinancialImpact({ scenarioId }) {
  const data = scenarios[scenarioId] || scenarios.normal
  const { dark } = useTheme()

  const label = dark ? 'text-white/30' : 'text-stripe-body'
  const sub = dark ? 'text-white/20' : 'text-stripe-body/60'
  const forecastVal = dark ? 'text-white/80' : 'text-stripe-navy'

  return (
    <div className={`border rounded-stripe p-5 ${dark ? 'bg-gray-950 border-white/5' : 'bg-gray-50 border-stripe-border'}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={dark ? '#a78bfa' : '#533afd'} strokeWidth="1.5">
          <path d="M8 1v14M4.5 4h7a2.5 2.5 0 010 5H5a2.5 2.5 0 000 5h7.5"/>
        </svg>
        <span className={`text-xs font-medium tracking-wider uppercase ${dark ? 'text-white/40' : 'text-stripe-body'}`}>Financial Impact</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${label}`}>Savings Captured</p>
          <p className="text-2xl font-light text-emerald-400 tracking-tight">
            <AnimatedDollar value={data.saved} />
          </p>
          <p className={`text-[10px] mt-1 ${sub}`}>this quarter</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${label}`}>Revenue at Risk</p>
          <p className="text-2xl font-light text-amber-400 tracking-tight">
            <AnimatedDollar value={data.atRisk} />
          </p>
          <p className={`text-[10px] mt-1 ${sub}`}>without AI mitigation</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${label}`}>Forecast Revenue</p>
          <p className={`text-2xl font-light tracking-tight ${forecastVal}`}>
            <AnimatedDollar value={data.forecast} />
          </p>
          <p className={`text-[10px] mt-1 ${sub}`}>next 30 days</p>
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${label}`}>Routes Optimized</p>
          <p className="text-2xl font-light text-violet-400 tracking-tight">
            <AnimatedDollar value={data.optimized} prefix="" />
          </p>
          <p className={`text-[10px] mt-1 ${sub}`}>active lanes</p>
        </div>
      </div>
    </div>
  )
}
