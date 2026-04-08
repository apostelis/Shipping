import { useEffect, useState } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function KpiCard({ label, value, unit, trend, description }) {
  const { dark } = useTheme()
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
      const current = eased * target
      setDisplayed(Number.isInteger(target) ? Math.round(current).toString() : current.toFixed(1))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  const trendColor = trend === 'up' ? 'text-stripe-success-text' : 'text-red-500'
  const trendArrow = trend === 'up' ? '\u2191' : '\u2193'

  return (
    <div className={`rounded-stripe p-6 transition-shadow border ${
      dark
        ? 'bg-white/5 border-white/5'
        : 'bg-white border-stripe-border shadow-stripe-ambient hover:shadow-stripe-sm'
    }`}>
      <p className={`text-sm font-normal ${dark ? 'text-white/40' : 'text-stripe-body'}`}>{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`text-3xl font-light tracking-tight animate-count-up ${dark ? 'text-white/90' : 'text-stripe-navy'}`}>
          {displayed}
        </span>
        <span className={`text-lg font-light ${dark ? 'text-white/30' : 'text-stripe-body'}`}>{unit}</span>
        {trend && (
          <span className={`text-sm font-normal ${trendColor}`}>
            {trendArrow}
          </span>
        )}
      </div>
      {description && (
        <p className={`text-xs mt-2 ${dark ? 'text-white/20' : 'text-stripe-body'}`}>{description}</p>
      )}
    </div>
  )
}
