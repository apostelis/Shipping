import { useEffect, useState } from 'react'

export default function KpiCard({ label, value, unit, trend, description }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const target = parseFloat(value)
    if (isNaN(target)) { setDisplayed(value); return }

    let start = 0
    const duration = 800
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed((eased * target).toFixed(1))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  const trendColor = trend === 'up' ? 'text-stripe-success-text' : 'text-red-500'
  const trendArrow = trend === 'up' ? '\u2191' : '\u2193'

  return (
    <div className="bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient hover:shadow-stripe-sm transition-shadow">
      <p className="text-sm text-stripe-body font-normal">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-light tracking-tight text-stripe-navy animate-count-up">
          {displayed}
        </span>
        <span className="text-lg text-stripe-body font-light">{unit}</span>
        {trend && (
          <span className={`text-sm font-normal ${trendColor}`}>
            {trendArrow}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-stripe-body mt-2">{description}</p>
      )}
    </div>
  )
}
