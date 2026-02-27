import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { WeeklySummary, WeightUnit } from '../../types'
import { convertWeight } from '../../lib/formulas'

interface VolumeChartProps {
  data: WeeklySummary[]
  unit: WeightUnit
}

export function VolumeChart({ data, unit }: VolumeChartProps) {
  const chartData = data.map((d) => ({
    week: d.week_start.slice(5),
    volume: Math.round(convertWeight(d.total_volume, unit)),
    workouts: d.workout_count,
  }))

  if (!chartData.length) {
    return <p className="text-text-muted text-sm text-center py-8">No data yet</p>
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-text-secondary mb-3">Weekly Volume ({unit})</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#666666' }} />
          <YAxis tick={{ fontSize: 11, fill: '#666666' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12 }}
            labelStyle={{ color: '#FFFFFF' }}
            itemStyle={{ color: '#FF6B00' }}
          />
          <Bar dataKey="volume" fill="#FF6B00" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
