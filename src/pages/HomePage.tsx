import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Calendar, ChevronDown, Dumbbell } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getWorkoutSummaries, getActiveWorkout } from '../db/queries/workouts'
import { getWeeklySummaries } from '../db/queries/analytics'
import { Card } from '../components/ui/Card'
import { formatDate } from '../lib/dates'
import { formatWeight } from '../lib/formulas'

export function HomePage() {
  const { db, unit } = useDatabase()
  const navigate = useNavigate()

  const activeWorkout = useMemo(() => db ? getActiveWorkout(db) : null, [db])
  const allRecent = useMemo(() => db ? getWorkoutSummaries(db, 3) : [], [db])
  const recentWorkouts = allRecent.slice(0, 2)
  const hasMore = allRecent.length > 2
  const weeklySummary = useMemo(() => {
    if (!db) return null
    const weeks = getWeeklySummaries(db, 1)
    return weeks.length > 0 ? weeks[weeks.length - 1] : null
  }, [db])

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
        <Card
          className="cursor-pointer border border-primary/30"
          onClick={() => navigate('/workout')}
        >
          <div className="flex items-center gap-2 text-primary font-bold">
            <Dumbbell className="h-5 w-5" />
            Workout in progress — tap to resume
          </div>
        </Card>
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
    </div>
  )
}
