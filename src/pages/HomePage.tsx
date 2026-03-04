import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Calendar, ChevronDown, Dumbbell, Trash2 } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getWorkoutSummaries, getActiveWorkout, deleteWorkout } from '../db/queries/workouts'
import { getWeeklySummaries } from '../db/queries/analytics'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import { formatDate } from '../lib/dates'
import { formatWeight } from '../lib/formulas'
import type { WorkoutSummary, WeeklySummary, Workout } from '../types'

export function HomePage() {
  const { unit } = useDatabase()
  const navigate = useNavigate()
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)
  const [allRecent, setAllRecent] = useState<WorkoutSummary[]>([])
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDiscard, setShowDiscard] = useState(false)

  const handleDiscard = useCallback(async () => {
    if (!activeWorkout) return
    await deleteWorkout(activeWorkout.id)
    setActiveWorkout(null)
    setShowDiscard(false)
  }, [activeWorkout])

  useEffect(() => {
    Promise.all([
      getActiveWorkout().then(setActiveWorkout),
      getWorkoutSummaries(3).then(setAllRecent),
      getWeeklySummaries(1).then((weeks) => {
        setWeeklySummary(weeks.length > 0 ? weeks[weeks.length - 1] : null)
      }),
    ]).finally(() => setLoading(false))
  }, [])

  const recentWorkouts = allRecent.slice(0, 2)
  const hasMore = allRecent.length > 2

  if (loading) return <Spinner />

  return (
    <div className="py-4 flex flex-col gap-5">
      <h2 className="text-2xl font-extrabold tracking-tight">Dashboard</h2>

      {weeklySummary && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">This Week</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-extrabold text-primary">{weeklySummary.workout_count}</p>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Workouts</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-extrabold text-primary">{weeklySummary.total_sets}</p>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Sets</p>
            </Card>
            <Card className="text-center">
              <p className="text-lg font-extrabold text-primary">{formatWeight(weeklySummary.total_volume, unit)}</p>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Volume</p>
            </Card>
          </div>
        </div>
      )}

      {activeWorkout && (
        <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-primary/30">
          <div
            className="flex-1 flex items-center gap-2 text-primary font-bold px-4 py-3.5 bg-surface cursor-pointer active:bg-surface-hover transition-colors"
            onClick={() => navigate('/workout')}
          >
            <Dumbbell className="h-5 w-5 shrink-0" />
            <span>Workout in progress — tap to resume</span>
          </div>
          <button
            onClick={() => setShowDiscard(true)}
            className="flex items-center justify-center px-5 bg-danger text-white active:bg-danger/80 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      <button
        onClick={() => navigate('/workout')}
        className="w-full py-4 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all text-lg font-bold"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
        Start Workout
      </button>

      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Recent Workouts</h3>
        {recentWorkouts.length === 0 ? (
          <Card className="text-center py-8">
            <Dumbbell className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No workouts yet. Start your first one!</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {recentWorkouts.map((w) => (
              <Card
                key={w.id}
                className="cursor-pointer active:bg-surface-hover transition-colors"
                onClick={() => navigate(`/workout/${w.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{formatDate(w.started_at)}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-text-muted font-medium">
                    <span>{w.exercise_count} ex</span>
                    <span>{w.total_sets} sets</span>
                    {w.duration_minutes != null && <span>{w.duration_minutes}m</span>}
                  </div>
                </div>
              </Card>
            ))}
            {hasMore && (
              <button
                onClick={() => navigate('/history')}
                className="flex items-center justify-center gap-1 text-sm text-text-muted hover:text-primary transition-colors py-2"
              >
                <ChevronDown className="h-4 w-4" />
                more
              </button>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={showDiscard}
        onClose={() => setShowDiscard(false)}
        onConfirm={handleDiscard}
        title="Discard Workout"
        message="Are you sure you want to discard this workout? This cannot be undone."
        confirmLabel="Discard"
      />
    </div>
  )
}
