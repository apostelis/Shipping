import {
  ResponsiveContainer, ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

export default function ForecastChart({ historicalData, forecastData, algorithmName }) {
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

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5edf5" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#64748d', fontWeight: 300 }}
          tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748d', fontWeight: 300 }}
          tickFormatter={(v) => `${v.toLocaleString()} TEU`}
        />
        <Tooltip
          contentStyle={{
            border: '1px solid #e5edf5',
            borderRadius: '6px',
            boxShadow: 'rgba(50,50,93,0.25) 0px 6px 12px -6px',
            fontSize: '12px',
            fontWeight: 300,
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 300 }} />

        <Area
          dataKey="upperBound"
          stroke="none"
          fill="#533afd"
          fillOpacity={0.08}
          name="Upper Bound"
          dot={false}
        />
        <Area
          dataKey="lowerBound"
          stroke="none"
          fill="#ffffff"
          fillOpacity={1}
          name="Lower Bound"
          dot={false}
        />

        <Line
          dataKey="actual"
          stroke="#061b31"
          strokeWidth={2}
          dot={false}
          name="Historical Demand"
        />

        <Line
          dataKey="predicted"
          stroke="#533afd"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          name={`AI Forecast (${algorithmName})`}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
