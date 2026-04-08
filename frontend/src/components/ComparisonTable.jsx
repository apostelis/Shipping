import { useTheme } from '../hooks/useTheme'

export default function ComparisonTable({ optimized, naive }) {
  if (!optimized) return null
  const { dark } = useTheme()

  const hasSavings = naive && naive.totalCost > 0 && naive.totalDistanceNm > 0
  const savings = hasSavings ? {
    cost: ((1 - optimized.totalCost / naive.totalCost) * 100).toFixed(1),
    time: ((1 - optimized.totalTimeHours / naive.totalTimeHours) * 100).toFixed(1),
    distance: ((1 - optimized.totalDistanceNm / naive.totalDistanceNm) * 100).toFixed(1),
    costDollar: Math.round(naive.totalCost - optimized.totalCost),
  } : null

  const fmt = (v) => parseFloat(v).toLocaleString()
  const fmtHours = (h) => {
    const hours = parseFloat(h)
    if (hours < 24) return `${hours.toFixed(0)}h`
    const days = Math.floor(hours / 24)
    const rem = Math.round(hours % 24)
    return `${days}d ${rem}h`
  }

  const card = dark ? 'bg-gray-950 border-violet-500/20' : 'bg-white border-stripe-purple/20 shadow-stripe-ambient'
  const cardDim = dark ? 'bg-gray-950 border-white/5' : 'bg-gray-50 border-stripe-border'
  const label = dark ? 'text-white/30' : 'text-stripe-body'
  const labelDim = dark ? 'text-white/20' : 'text-stripe-body/60'
  const value = dark ? 'text-white/90' : 'text-stripe-navy'
  const valueDim = dark ? 'text-white/50' : 'text-stripe-body'
  const unit = dark ? 'text-white/40' : 'text-stripe-body'
  const savingsCenter = dark
    ? 'bg-gradient-to-b from-violet-950/50 to-gray-950 border-violet-500/20'
    : 'bg-gradient-to-b from-stripe-purple/5 to-white border-stripe-purple/20 shadow-stripe-ambient'
  const subtext = dark ? 'text-white/40' : 'text-stripe-body'
  const savingsLabel = dark ? 'text-white/30' : 'text-stripe-body'

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* AI Optimized card */}
      <div className={`border rounded-stripe p-5 ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span className="text-[10px] font-medium tracking-wider text-violet-400 uppercase">AI Optimized</span>
        </div>
        <div className="space-y-3">
          <div>
            <p className={`text-[10px] uppercase tracking-wider ${label}`}>Distance</p>
            <p className={`text-lg font-light ${value}`}>{fmt(optimized.totalDistanceNm)} <span className={`text-xs ${unit}`}>nm</span></p>
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider ${label}`}>Transit Time</p>
            <p className={`text-lg font-light ${value}`}>{fmtHours(optimized.totalTimeHours)}</p>
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider ${label}`}>Total Cost</p>
            <p className="text-lg font-light text-emerald-400">${fmt(optimized.totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Savings card - center */}
      {hasSavings ? (
        <div className={`border rounded-stripe p-5 flex flex-col items-center justify-center text-center ${savingsCenter}`}>
          <p className={`text-[10px] uppercase tracking-wider mb-2 ${savingsLabel}`}>AI Savings</p>
          <p className="text-4xl font-light text-emerald-400 tracking-tight">${savings.costDollar.toLocaleString()}</p>
          <p className={`text-xs mt-1 ${subtext}`}>per voyage</p>
          <div className="flex gap-4 mt-4">
            <div>
              <p className="text-sm font-light text-emerald-400">{savings.distance}%</p>
              <p className={`text-[10px] ${savingsLabel}`}>distance</p>
            </div>
            <div>
              <p className="text-sm font-light text-emerald-400">{savings.time}%</p>
              <p className={`text-[10px] ${savingsLabel}`}>time</p>
            </div>
            <div>
              <p className="text-sm font-light text-emerald-400">{savings.cost}%</p>
              <p className={`text-[10px] ${savingsLabel}`}>cost</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`border rounded-stripe p-5 flex items-center justify-center ${cardDim}`}>
          <p className={`text-xs ${label}`}>Select different routes to compare</p>
        </div>
      )}

      {/* Naive/Direct route card */}
      {naive ? (
        <div className={`border rounded-stripe p-5 opacity-60 ${cardDim}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className={`text-[10px] font-medium tracking-wider uppercase ${dark ? 'text-white/40' : 'text-stripe-body'}`}>Without AI</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className={`text-[10px] uppercase tracking-wider ${labelDim}`}>Distance</p>
              <p className={`text-lg font-light ${valueDim}`}>{fmt(naive.totalDistanceNm)} <span className={`text-xs ${labelDim}`}>nm</span></p>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wider ${labelDim}`}>Transit Time</p>
              <p className={`text-lg font-light ${valueDim}`}>{fmtHours(naive.totalTimeHours)}</p>
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wider ${labelDim}`}>Total Cost</p>
              <p className="text-lg font-light text-red-400/70">${fmt(naive.totalCost)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`border rounded-stripe p-5 opacity-40 flex items-center justify-center ${cardDim}`}>
          <p className={`text-xs ${label}`}>No alternative to compare</p>
        </div>
      )}
    </div>
  )
}
