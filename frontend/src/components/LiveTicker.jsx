import { useEffect, useState } from 'react'

const EVENTS = [
  { type: 'vessel', text: 'MSC Aurora departed Shanghai → Rotterdam', time: '2m ago' },
  { type: 'alert', text: 'Demand surge detected: MED-NORTHEUROPE +23% above forecast', time: '5m ago' },
  { type: 'route', text: 'Route optimized: Dubai → Hamburg via Colombo — saved $142,000', time: '8m ago' },
  { type: 'vessel', text: 'Ever Forward arrived Singapore — 2h ahead of schedule', time: '12m ago' },
  { type: 'alert', text: 'Fuel price alert: VLSFO Rotterdam +4.2% — recalculating 6 routes', time: '15m ago' },
  { type: 'route', text: 'Alternative route found: Jeddah → Valencia via Algeciras — 18h faster', time: '18m ago' },
  { type: 'vessel', text: 'CMA Athena loading at Piraeus — 78% capacity', time: '22m ago' },
  { type: 'alert', text: 'Weather advisory: Bay of Biscay — 3 routes adjusted', time: '25m ago' },
  { type: 'route', text: 'Cost optimization: Shanghai → LA transpacific saves $89,000 vs Suez', time: '28m ago' },
  { type: 'vessel', text: 'Cosco Galaxy transiting Suez Canal — ETA Dubai 3d 14h', time: '31m ago' },
  { type: 'alert', text: 'Capacity warning: Singapore terminal utilization at 94%', time: '35m ago' },
  { type: 'route', text: 'Bulk reroute complete: 12 vessels redirected from Rotterdam congestion', time: '38m ago' },
]

const typeStyles = {
  vessel: { dot: 'bg-emerald-400', label: 'VESSEL', labelClass: 'text-emerald-400' },
  alert: { dot: 'bg-amber-400', label: 'ALERT', labelClass: 'text-amber-400' },
  route: { dot: 'bg-violet-400', label: 'ROUTE', labelClass: 'text-violet-400' },
}

export default function LiveTicker() {
  const [visibleEvents, setVisibleEvents] = useState(EVENTS.slice(0, 3))
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => {
        const next = (prev + 1) % EVENTS.length
        setVisibleEvents([
          EVENTS[next % EVENTS.length],
          EVENTS[(next + 1) % EVENTS.length],
          EVENTS[(next + 2) % EVENTS.length],
        ])
        return next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-950 border border-white/5 rounded-stripe px-4 py-2.5 overflow-hidden">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[10px] font-medium tracking-widest text-white/40 uppercase">Live</span>
        </div>
        <div className="flex-1 flex gap-8 overflow-hidden">
          {visibleEvents.map((event, i) => {
            const style = typeStyles[event.type]
            return (
              <div key={`${offset}-${i}`} className="flex items-center gap-2 shrink-0 animate-page-in">
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                <span className={`text-[10px] font-medium tracking-wider ${style.labelClass}`}>{style.label}</span>
                <span className="text-xs text-white/70 font-light">{event.text}</span>
                <span className="text-[10px] text-white/30">{event.time}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
