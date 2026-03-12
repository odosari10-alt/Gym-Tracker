import { Trash2, Unlink, Dumbbell, Timer, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { SetRow } from './SetRow'
import { CheckIcon } from '../ui/CheckIcon'
import { getExerciseGif } from '../../lib/exerciseGifs'
import { useDatabase } from '../../db/hooks/useDatabase'
import type { WorkoutExercise, Set, WeightUnit } from '../../types'

const REST_STEP = 30

function formatRestTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}:00`
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise
  sets: Set[]
  unit: WeightUnit
  readOnly?: boolean
  supersetColor?: string
  checkedSets?: globalThis.Set<number>
  onToggleSetCheck?: (setId: number) => void
  onToggleExerciseCheck?: (setIds: number[]) => void
  onAddSet: (workoutExerciseId: number) => void
  onUpdateSet: (setId: number, weightKg: number, reps: number, isWarmup: boolean, rpe: number | null) => void
  onDeleteSet: (setId: number) => void
  onRemoveExercise: (workoutExerciseId: number) => void
  onSuperset?: (workoutExerciseId: number) => void
  onUnlinkSuperset?: (supersetGroup: number) => void
}

export function ExerciseCard({
  workoutExercise, sets, unit, readOnly, supersetColor,
  checkedSets, onToggleSetCheck, onToggleExerciseCheck,
  onAddSet, onUpdateSet, onDeleteSet, onRemoveExercise,
  onSuperset, onUnlinkSuperset
}: ExerciseCardProps) {
  const isSuperset = workoutExercise.superset_group != null
  const gifUrl = getExerciseGif(workoutExercise.exercise_name ?? '')
  const { restTimerSeconds, setRestTimerSeconds } = useDatabase()

  const setIds = sets.map((s) => s.id)
  const allChecked = sets.length > 0 && checkedSets != null && setIds.every((id) => checkedSets.has(id))
  const someChecked = checkedSets != null && setIds.some((id) => checkedSets.has(id))

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {!readOnly && onToggleExerciseCheck && sets.length > 0 && (
            <button
              onClick={() => onToggleExerciseCheck(setIds)}
              className={`w-7 h-7 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                allChecked
                  ? 'bg-primary border-primary'
                  : someChecked
                    ? 'border-primary bg-transparent'
                    : 'border-text-muted/40 bg-transparent'
              }`}
            >
              {(allChecked || someChecked) && <CheckIcon className={`w-4 h-4 ${allChecked ? 'text-white' : 'text-primary'}`} />}
            </button>
          )}
          {supersetColor && (
            <span
              className="w-1.5 h-8 rounded-full shrink-0"
              style={{ backgroundColor: supersetColor }}
            />
          )}
          <div className="w-20 h-20 rounded-xl bg-[#111] overflow-hidden shrink-0">
            {gifUrl ? (
              <img src={gifUrl} alt={workoutExercise.exercise_name ?? ''} loading="lazy" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-text-muted/30" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-text-primary truncate">{workoutExercise.exercise_name}</h3>
            <p className="text-xs text-text-muted">{workoutExercise.muscle_group_name}</p>
          </div>
        </div>
        {!readOnly && (
          <div className="flex items-center shrink-0 ml-2">
            {isSuperset ? (
              <button
                onClick={() => onUnlinkSuperset?.(workoutExercise.superset_group!)}
                className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-primary active:text-primary transition-colors"
                title="Unlink superset"
              >
                <Unlink className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => onSuperset?.(workoutExercise.id)}
                className="px-2 py-1 rounded-xl hover:bg-surface-hover text-xs font-semibold text-text-muted hover:text-primary active:text-primary transition-colors"
              >
                Superset
              </button>
            )}
            <button
              onClick={() => onRemoveExercise(workoutExercise.id)}
              className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-danger active:text-danger transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {sets.length > 0 && (
        <div className="flex items-center gap-2 mb-1 px-0.5">
          {!readOnly && <span className="w-10 shrink-0" />}
          <span className="flex-1 text-center text-[10px] text-text-muted font-semibold uppercase">{unit}</span>
          <span className="text-[10px] shrink-0">&nbsp;</span>
          <span className="flex-1 text-center text-[10px] text-text-muted font-semibold uppercase">Reps</span>
          {!readOnly && <span className="w-[44px] shrink-0" />}
          {!readOnly && onToggleSetCheck && <span className="w-6 shrink-0" />}
        </div>
      )}

      <div className="flex flex-col">
        {sets.map((s, i) => (
          <div key={s.id}>
            {i > 0 && (
              <div className="flex items-center py-2">
                <div className="flex items-center w-full bg-blue-600/40 border border-blue-400/60 rounded-xl">
                  {!readOnly && (
                    <button
                      onClick={() => setRestTimerSeconds(Math.max(REST_STEP, restTimerSeconds - REST_STEP))}
                      className="px-3 py-2 text-blue-400 hover:text-blue-300 active:text-blue-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  <span className="flex items-center justify-center gap-1.5 flex-1 text-sm font-semibold text-blue-400 py-2">
                    <Timer className="h-4 w-4" />
                    {formatRestTime(restTimerSeconds)} rest
                  </span>
                  {!readOnly && (
                    <button
                      onClick={() => setRestTimerSeconds(restTimerSeconds + REST_STEP)}
                      className="px-3 py-2 text-blue-400 hover:text-blue-300 active:text-blue-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <SetRow
              set={s}
              unit={unit}
              readOnly={readOnly}
              checked={checkedSets?.has(s.id)}
              onToggleCheck={onToggleSetCheck}
              onUpdate={onUpdateSet}
              onDelete={onDeleteSet}
            />
          </div>
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
