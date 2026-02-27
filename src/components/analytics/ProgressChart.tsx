import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { ExerciseProgress, WeightUnit } from '../../types'
import { convertWeight } from '../../lib/formulas'

interface ProgressChartProps {
  data: ExerciseProgress[]
  unit: WeightUnit
  dataKey?: 'best_weight' | 'best_e1rm'
  title: string
}

export function ProgressChart({ data, unit, dataKey = 'best_weight', title }: ProgressChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    value: Number(convertWeight(d[dataKey], unit).toFixed(1)),
    date: d.date,
  }))

  if (!chartData.length) {
    return <p className="text-text-muted text-sm text-center py-8">No data yet</p>
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-text-secondary mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666666' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12 }}
            labelStyle={{ color: '#FFFFFF' }}
            itemStyle={{ color: '#FF6B00' }}
          />
          <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={2} dot={{ r: 3, fill: '#FF6B00' }} name={unit} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
