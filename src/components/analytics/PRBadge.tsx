import { Trophy } from 'lucide-react'
import type { PersonalRecord, WeightUnit } from '../../types'
import { formatWeight } from '../../lib/formulas'

interface PRBadgeProps {
  pr: PersonalRecord
  unit: WeightUnit
}

export function PRBadge({ pr, unit }: PRBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl">
      <Trophy className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{pr.exercise_name}</p>
        <p className="text-xs text-text-muted">
          {formatWeight(pr.weight_kg, unit)} x {pr.reps} &middot; e1RM: {formatWeight(pr.e1rm, unit)}
        </p>
      </div>
      <span className="text-xs text-text-muted shrink-0">{pr.date}</span>
    </div>
  )
}
