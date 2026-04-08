export default function ComparisonTable({ optimized, naive }) {
  if (!optimized) return null

  const savings = naive ? {
    cost: ((1 - optimized.totalCost / naive.totalCost) * 100).toFixed(1),
    time: ((1 - optimized.totalTimeHours / naive.totalTimeHours) * 100).toFixed(1),
    distance: ((1 - optimized.totalDistanceNm / naive.totalDistanceNm) * 100).toFixed(1),
  } : null

  const fmt = (v) => parseFloat(v).toLocaleString()

  return (
    <div className="bg-white border border-stripe-border rounded-stripe overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stripe-border bg-gray-50/50">
            <th className="text-left px-4 py-3 font-normal text-stripe-label">Metric</th>
            <th className="text-right px-4 py-3 font-normal text-stripe-purple">AI Optimized</th>
            {naive && <th className="text-right px-4 py-3 font-normal text-stripe-body">Direct Route</th>}
            {savings && <th className="text-right px-4 py-3 font-normal text-stripe-success-text">Savings</th>}
          </tr>
        </thead>
        <tbody className="font-light">
          <tr className="border-b border-stripe-border">
            <td className="px-4 py-3 text-stripe-navy">Distance (nm)</td>
            <td className="text-right px-4 py-3 text-stripe-navy">{fmt(optimized.totalDistanceNm)}</td>
            {naive && <td className="text-right px-4 py-3 text-stripe-body">{fmt(naive.totalDistanceNm)}</td>}
            {savings && <td className="text-right px-4 py-3 text-stripe-success-text">{savings.distance}%</td>}
          </tr>
          <tr className="border-b border-stripe-border">
            <td className="px-4 py-3 text-stripe-navy">Transit Time (hrs)</td>
            <td className="text-right px-4 py-3 text-stripe-navy">{fmt(optimized.totalTimeHours)}</td>
            {naive && <td className="text-right px-4 py-3 text-stripe-body">{fmt(naive.totalTimeHours)}</td>}
            {savings && <td className="text-right px-4 py-3 text-stripe-success-text">{savings.time}%</td>}
          </tr>
          <tr>
            <td className="px-4 py-3 text-stripe-navy">Total Cost ($)</td>
            <td className="text-right px-4 py-3 text-stripe-navy">${fmt(optimized.totalCost)}</td>
            {naive && <td className="text-right px-4 py-3 text-stripe-body">${fmt(naive.totalCost)}</td>}
            {savings && <td className="text-right px-4 py-3 text-stripe-success-text">{savings.cost}%</td>}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
