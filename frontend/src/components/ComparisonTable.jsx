export default function ComparisonTable({ optimized, naive }) {
  if (!optimized) return null

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

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* AI Optimized card */}
      <div className="bg-gray-950 border border-violet-500/20 rounded-stripe p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span className="text-[10px] font-medium tracking-wider text-violet-400 uppercase">AI Optimized</span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Distance</p>
            <p className="text-lg font-light text-white/90">{fmt(optimized.totalDistanceNm)} <span className="text-xs text-white/40">nm</span></p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Transit Time</p>
            <p className="text-lg font-light text-white/90">{fmtHours(optimized.totalTimeHours)}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Total Cost</p>
            <p className="text-lg font-light text-emerald-400">${fmt(optimized.totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Savings card - center */}
      {hasSavings ? (
        <div className="bg-gradient-to-b from-violet-950/50 to-gray-950 border border-violet-500/20 rounded-stripe p-5 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">AI Savings</p>
          <p className="text-4xl font-light text-emerald-400 tracking-tight">${savings.costDollar.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">per voyage</p>
          <div className="flex gap-4 mt-4">
            <div>
              <p className="text-sm font-light text-emerald-400">{savings.distance}%</p>
              <p className="text-[10px] text-white/30">distance</p>
            </div>
            <div>
              <p className="text-sm font-light text-emerald-400">{savings.time}%</p>
              <p className="text-[10px] text-white/30">time</p>
            </div>
            <div>
              <p className="text-sm font-light text-emerald-400">{savings.cost}%</p>
              <p className="text-[10px] text-white/30">cost</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-950 border border-white/5 rounded-stripe p-5 flex items-center justify-center">
          <p className="text-xs text-white/30">Select different routes to compare</p>
        </div>
      )}

      {/* Naive/Direct route card */}
      {naive ? (
        <div className="bg-gray-950 border border-white/5 rounded-stripe p-5 opacity-60">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="text-[10px] font-medium tracking-wider text-white/40 uppercase">Without AI</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-wider">Distance</p>
              <p className="text-lg font-light text-white/50">{fmt(naive.totalDistanceNm)} <span className="text-xs text-white/20">nm</span></p>
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-wider">Transit Time</p>
              <p className="text-lg font-light text-white/50">{fmtHours(naive.totalTimeHours)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase tracking-wider">Total Cost</p>
              <p className="text-lg font-light text-red-400/70">${fmt(naive.totalCost)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-950 border border-white/5 rounded-stripe p-5 opacity-40 flex items-center justify-center">
          <p className="text-xs text-white/30">No alternative to compare</p>
        </div>
      )}
    </div>
  )
}
