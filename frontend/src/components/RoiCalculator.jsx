import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { fmtDollar, fmtDollarFull } from '../utils/format'

export default function RoiCalculator({ scenarioId }) {
  const { dark } = useTheme()
  const [fleetSize, setFleetSize] = useState(50)

  // Per-voyage savings by scenario
  const perVoyageSavings = {
    normal: 142000,
    'demand-spike': 178000,
    'port-disruption': 234000,
    'hormuz-blockade': 312000,
  }

  const savingsPerVoyage = perVoyageSavings[scenarioId] || perVoyageSavings.normal
  const voyagesPerYear = fleetSize * 12 // ~12 voyages per vessel per year
  const annualSavings = savingsPerVoyage * voyagesPerYear
  const monthlySavings = Math.round(annualSavings / 12)

  const label = dark ? 'text-white/30' : 'text-stripe-body'
  const sub = dark ? 'text-white/20' : 'text-stripe-body/60'
  const val = dark ? 'text-white/80' : 'text-stripe-navy'

  return (
    <div className={`border rounded-stripe p-5 ${dark ? 'bg-gray-950 border-white/5' : 'bg-gray-50 border-stripe-border'}`}>
      <div className="flex items-center gap-2 mb-5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={dark ? '#a78bfa' : '#533afd'} strokeWidth="1.5">
          <rect x="1" y="6" width="4" height="9" rx="0.5"/>
          <rect x="6" y="3" width="4" height="12" rx="0.5"/>
          <rect x="11" y="1" width="4" height="14" rx="0.5"/>
        </svg>
        <span className={`text-xs font-medium tracking-wider uppercase ${dark ? 'text-white/40' : 'text-stripe-body'}`}>ROI Calculator</span>
      </div>

      {/* Fleet size slider */}
      <div className="mb-5">
        <div className="flex justify-between items-baseline mb-2">
          <p className={`text-[10px] uppercase tracking-wider ${label}`}>Fleet Size</p>
          <p className={`text-lg font-light tabular-nums ${val}`}>{fleetSize} <span className={`text-xs ${label}`}>vessels</span></p>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={fleetSize}
          onChange={(e) => setFleetSize(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: dark
              ? `linear-gradient(to right, #a78bfa ${(fleetSize - 10) / 490 * 100}%, rgba(255,255,255,0.1) ${(fleetSize - 10) / 490 * 100}%)`
              : `linear-gradient(to right, #533afd ${(fleetSize - 10) / 490 * 100}%, #e5edf5 ${(fleetSize - 10) / 490 * 100}%)`,
          }}
        />
        <div className={`flex justify-between text-[9px] mt-1 ${sub}`}>
          <span>10</span>
          <span>250</span>
          <span>500</span>
        </div>
      </div>

      {/* Projected savings */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <p className={`text-[10px] uppercase tracking-wider ${label}`}>Per Voyage Savings</p>
          <p className="text-sm font-light text-emerald-400" title={fmtDollarFull(savingsPerVoyage)}>{fmtDollar(savingsPerVoyage)}</p>
        </div>
        <div className="flex justify-between items-baseline">
          <p className={`text-[10px] uppercase tracking-wider ${label}`}>Monthly Projection</p>
          <p className="text-sm font-light text-emerald-400" title={fmtDollarFull(monthlySavings)}>{fmtDollar(monthlySavings)}</p>
        </div>
        <div className={`pt-3 mt-3 border-t ${dark ? 'border-white/5' : 'border-stripe-border'}`}>
          <p className={`text-[10px] uppercase tracking-wider mb-1 ${label}`}>Projected Annual Savings</p>
          <p className="text-3xl font-light text-emerald-400 tracking-tight tabular-nums cursor-default" title={fmtDollarFull(annualSavings)}>
            {fmtDollar(annualSavings)}
          </p>
          <p className={`text-[10px] mt-1 ${sub}`}>{voyagesPerYear.toLocaleString()} voyages/yr × {fmtDollar(savingsPerVoyage)}/voyage</p>
        </div>
      </div>
    </div>
  )
}
