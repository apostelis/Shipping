import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../hooks/useTheme'

const ALERTS = {
  normal: {
    level: 'info',
    title: 'Systems Nominal',
    message: 'All routes operating at optimal efficiency. AI monitoring active.',
    color: 'emerald',
  },
  'demand-spike': {
    level: 'warning',
    title: 'Demand Surge Detected',
    message: 'MED-NORTHEUROPE lane demand +83% above baseline. AI forecasting triggered capacity alerts 3 weeks prior.',
    color: 'amber',
  },
  'port-disruption': {
    level: 'critical',
    title: 'Port Disruption \u2014 Rotterdam',
    message: 'Rotterdam port operations suspended. AI rerouting 12 vessels through Hamburg and alternative Northern European ports.',
    color: 'red',
  },
  'hormuz-blockade': {
    level: 'emergency',
    title: 'Strait of Hormuz Blockade',
    message: 'All Gulf maritime traffic halted. AI emergency reroute initiated \u2014 18 vessels redirected via Cape of Good Hope.',
    color: 'red',
  },
}

export default function AlertToast({ scenarioId }) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(null)
  const { dark } = useTheme()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    if (!scenarioId) return
    const alert = ALERTS[scenarioId]
    if (!alert) return

    setCurrent(alert)
    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [scenarioId])

  if (!current) return null

  const colorMap = {
    emerald: { bg: dark ? 'bg-emerald-950/90' : 'bg-emerald-50', border: 'border-emerald-500/30', dot: 'bg-emerald-400', title: 'text-emerald-400', text: dark ? 'text-emerald-200/70' : 'text-emerald-800' },
    amber: { bg: dark ? 'bg-amber-950/90' : 'bg-amber-50', border: 'border-amber-500/30', dot: 'bg-amber-400', title: 'text-amber-400', text: dark ? 'text-amber-200/70' : 'text-amber-800' },
    red: { bg: dark ? 'bg-red-950/90' : 'bg-red-50', border: 'border-red-500/30', dot: 'bg-red-400', title: 'text-red-400', text: dark ? 'text-red-200/70' : 'text-red-800' },
  }

  const c = colorMap[current.color]
  const isPulsing = current.level === 'emergency'

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-500 ease-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${c.bg} border ${c.border} rounded-stripe p-4 backdrop-blur-sm shadow-lg`}>
        <div className="flex items-start gap-3">
          <span className="mt-1 shrink-0">
            <span className={`relative flex h-2.5 w-2.5`}>
              {isPulsing && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-75`}></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.dot}`}></span>
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${c.title}`}>{current.title}</p>
            <p className={`text-xs mt-1 font-light ${c.text}`}>{current.message}</p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className={`shrink-0 ${dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'} text-lg leading-none`}
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  )
}
