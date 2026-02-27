import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Calendar, Clock, Dumbbell, Weight, Trash2 } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getWorkoutSummaries, deleteWorkout } from '../db/queries/workouts'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatDate, formatTime } from '../lib/dates'
import { formatWeight } from '../lib/formulas'

export function HistoryPage() {
  const { db, unit, save } = useDatabase()
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const workouts = useMemo(() => db ? getWorkoutSummaries(db) : [], [db, refresh])

  const handleDelete = useCallback(async () => {
    if (!db || deleteId == null) return
    deleteWorkout(db, deleteId)
    await save()
    setDeleteId(null)
    setRefresh((r) => r + 1)
  }, [db, deleteId, save])

  if (!workouts.length) {
    return (
      <div className="py-8 text-center">
        <Dumbbell className="h-12 w-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted font-medium">No workouts yet</p>
        <p className="text-text-muted text-sm mt-1">Start your first workout from the home page</p>
      </div>
    )
  }

  return (
    <div className="py-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-xl text-text-muted hover:text-primary active:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-extrabold tracking-tight">Workout History</h2>
      </div>
      {workouts.map((w) => (
        <Card key={w.id} className="active:bg-surface-hover transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-text-primary font-semibold flex-1 cursor-pointer" onClick={() => navigate(`/workout/${w.id}`)}>
              <Calendar className="h-4 w-4 text-primary" />
              {formatDate(w.started_at)}
            </div>
            <div className="flex items-center gap-2">
              {w.finished_at && (
                <span className="text-xs text-text-muted">{formatTime(w.started_at)}</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteId(w.id) }}
                className="p-1.5 rounded-xl text-text-muted hover:text-danger active:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-text-muted cursor-pointer" onClick={() => navigate(`/workout/${w.id}`)}>
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" />
              {w.exercise_count} exercises
            </span>
            <span className="flex items-center gap-1">
              <Weight className="h-3.5 w-3.5" />
              {formatWeight(w.total_volume, unit)}
            </span>
            {w.duration_minutes != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {w.duration_minutes}m
              </span>
            )}
          </div>
        </Card>
      ))}

      <ConfirmDialog
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
