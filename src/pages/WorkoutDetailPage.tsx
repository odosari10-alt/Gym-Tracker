import { useMemo, useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Calendar, Clock, Weight, Trash2 } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getWorkoutById, getWorkoutExercises, deleteWorkout } from '../db/queries/workouts'
import { getSetsForWorkoutExercise } from '../db/queries/sets'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatDate, durationMinutes } from '../lib/dates'
import { formatWeight } from '../lib/formulas'
import type { Workout, WorkoutExercise, Set } from '../types'

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { db, unit, save } = useDatabase()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [setsMap, setSetsMap] = useState<Record<number, Set[]>>({})
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (!db || !id) return
    const w = getWorkoutById(db, Number(id))
    setWorkout(w)
    if (w) {
      const exs = getWorkoutExercises(db, w.id)
      setExercises(exs)
      const map: Record<number, Set[]> = {}
      for (const ex of exs) {
        map[ex.id] = getSetsForWorkoutExercise(db, ex.id)
      }
      setSetsMap(map)
    }
  }, [db, id])

  const totalVolume = useMemo(() => {
    return Object.values(setsMap).flat().filter(s => !s.is_warmup).reduce((sum, s) => sum + s.weight_kg * s.reps, 0)
  }, [setsMap])

  const handleDelete = useCallback(async () => {
    if (!db || !workout) return
    deleteWorkout(db, workout.id)
    await save()
    navigate('/history')
  }, [db, workout, save, navigate])

  if (!workout) {
    return <div className="py-8 text-center text-text-muted">Workout not found</div>
  }

  const duration = workout.finished_at ? durationMinutes(workout.started_at, workout.finished_at) : null

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border shrink-0" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/history')} className="p-2 rounded-xl hover:bg-surface active:bg-surface-hover text-text-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-extrabold text-text-primary tracking-tight">Workout Details</h1>
        </div>
        <button onClick={() => setShowDelete(true)} className="p-2 rounded-xl hover:bg-danger/10 active:bg-danger/20 text-danger">
          <Trash2 className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
        <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-full text-xs font-medium">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {formatDate(workout.started_at)}
            </span>
            {duration != null && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-full text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {duration} min
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-full text-xs font-medium">
              <Weight className="h-3.5 w-3.5 text-primary" />
              {formatWeight(totalVolume, unit)}
            </span>
          </div>

          {workout.notes && (
            <p className="text-text-secondary text-sm italic">{workout.notes}</p>
          )}

          {exercises.map((we) => (
            <ExerciseCard
              key={we.id}
              workoutExercise={we}
              sets={setsMap[we.id] ?? []}
              unit={unit}
              readOnly
              onAddSet={() => {}}
              onUpdateSet={() => {}}
              onDeleteSet={() => {}}
              onRemoveExercise={() => {}}
            />
          ))}
        </div>
      </main>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
