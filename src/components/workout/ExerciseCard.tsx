import { Trash2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { SetRow } from './SetRow'
import type { WorkoutExercise, Set, WeightUnit } from '../../types'

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise
  sets: Set[]
  unit: WeightUnit
  readOnly?: boolean
  onAddSet: (workoutExerciseId: number) => void
  onUpdateSet: (setId: number, weightKg: number, reps: number, isWarmup: boolean, rpe: number | null) => void
  onDeleteSet: (setId: number) => void
  onRemoveExercise: (workoutExerciseId: number) => void
}

export function ExerciseCard({
  workoutExercise, sets, unit, readOnly,
  onAddSet, onUpdateSet, onDeleteSet, onRemoveExercise
}: ExerciseCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-text-primary truncate">{workoutExercise.exercise_name}</h3>
          <p className="text-xs text-text-muted">{workoutExercise.muscle_group_name}</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => onRemoveExercise(workoutExercise.id)}
            className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-danger active:text-danger transition-colors shrink-0 ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {sets.length > 0 && (
        <div className="flex items-center gap-2 mb-1 px-0.5">
          <span className="w-8 text-center text-[10px] text-text-muted font-semibold uppercase shrink-0">Set</span>
          <span className="flex-1 text-center text-[10px] text-text-muted font-semibold uppercase">{unit}</span>
          <span className="text-[10px] shrink-0">&nbsp;</span>
          <span className="flex-1 text-center text-[10px] text-text-muted font-semibold uppercase">Reps</span>
          {!readOnly && <span className="w-[76px] shrink-0" />}
        </div>
      )}

      <div className="flex flex-col">
        {sets.map((s) => (
          <SetRow
            key={s.id}
            set={s}
            unit={unit}
            readOnly={readOnly}
            onUpdate={onUpdateSet}
            onDelete={onDeleteSet}
          />
        ))}
      </div>

      {!readOnly && (
        <button
          onClick={() => onAddSet(workoutExercise.id)}
          className="mt-3 w-full text-center text-sm font-semibold text-primary py-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          + ADD SET
        </button>
      )}
    </Card>
  )
}
