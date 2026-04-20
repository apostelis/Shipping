import {
  ResponsiveContainer, ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { useTheme } from '../hooks/useTheme'

export default function ForecastChart({ historicalData, forecastData, algorithmName }) {
  const { dark } = useTheme()

  const chartData = [
    ...historicalData.map(d => ({
      date: d.date,
      actual: parseFloat(d.value),
    })),
    ...forecastData.map(d => ({
      date: d.date,
      predicted: parseFloat(d.predicted),
      upperBound: parseFloat(d.upperBound),
      lowerBound: parseFloat(d.lowerBound),
    })),
  ]

  const colors = dark
    ? {
        grid: 'rgba(255,255,255,0.06)',
        tick: 'rgba(255,255,255,0.35)',
        actual: '#22d3ee',
        forecast: '#a78bfa',
        band: '#a78bfa',
        bandBg: 'rgba(10,15,30,1)',
        tooltipBg: '#1a1f35',
        tooltipBorder: 'rgba(255,255,255,0.1)',
        tooltipText: 'rgba(255,255,255,0.8)',
        legendText: 'rgba(255,255,255,0.5)',
      }
    : {
        grid: '#e5edf5',
        tick: '#64748d',
        actual: '#061b31',
        forecast: '#533afd',
        band: '#533afd',
        bandBg: '#ffffff',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e5edf5',
        tooltipText: '#061b31',
        legendText: '#64748d',
      }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: colors.tick, fontWeight: 300 }}
          tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          stroke={colors.grid}
        />
        <YAxis
          tick={{ fontSize: 11, fill: colors.tick, fontWeight: 300 }}
          tickFormatter={(v) => `${v.toLocaleString()} TEU`}
          stroke={colors.grid}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: '6px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 6px 12px -6px',
            fontSize: '12px',
            fontWeight: 300,
            color: colors.tooltipText,
          }}
          labelStyle={{ color: colors.tooltipText }}
          itemStyle={{ color: colors.tooltipText }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 300, color: colors.legendText }} />

        <Area
          dataKey="upperBound"
          stroke="none"
          fill={colors.band}
          fillOpacity={0.12}
          name="Upper Bound"
          dot={false}
        />
        <Area
          dataKey="lowerBound"
          stroke="none"
          fill={colors.bandBg}
          fillOpacity={1}
          name="Lower Bound"
          dot={false}
        />

        <Line
          dataKey="actual"
          stroke={colors.actual}
          strokeWidth={2}
          dot={false}
          name="Historical Demand"
        />

        <Line
          dataKey="predicted"
          stroke={colors.forecast}
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          name={`AI Forecast (${algorithmName})`}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
