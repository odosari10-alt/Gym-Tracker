import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { ExerciseProgress, WeightUnit } from '../../types'
import { convertWeight } from '../../lib/formulas'

interface OneRMChartProps {
  data: ExerciseProgress[]
  unit: WeightUnit
}

export function OneRMChart({ data, unit }: OneRMChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    e1rm: Number(convertWeight(d.best_e1rm, unit).toFixed(1)),
  }))

  if (!chartData.length) {
    return <p className="text-text-muted text-sm text-center py-8">No data yet</p>
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-text-secondary mb-3">Estimated 1RM ({unit})</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666666' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12 }}
            labelStyle={{ color: '#FFFFFF' }}
            itemStyle={{ color: '#FF8C00' }}
          />
          <Line type="monotone" dataKey="e1rm" stroke="#FF8C00" strokeWidth={2} dot={{ r: 3, fill: '#FF8C00' }} name="e1RM" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
