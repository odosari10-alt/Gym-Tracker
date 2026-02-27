import { Card } from '../ui/Card'
import type { WeeklySummary, WeightUnit } from '../../types'
import { formatWeight } from '../../lib/formulas'

interface WeeklySummaryCardProps {
  summary: WeeklySummary
  unit: WeightUnit
}

export function WeeklySummaryCard({ summary, unit }: WeeklySummaryCardProps) {
  return (
    <Card>
      <p className="text-xs text-text-muted mb-3">Week of {summary.week_start}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xl font-extrabold text-primary">{summary.workout_count}</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Workouts</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-primary">{summary.total_sets}</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Sets</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-primary">{formatWeight(summary.total_volume, unit)}</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Volume</p>
        </div>
      </div>
    </Card>
  )
}
