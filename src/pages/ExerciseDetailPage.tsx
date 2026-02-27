import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Trophy } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getExerciseById } from '../db/queries/exercises'
import { getExerciseProgress, getExercisePR } from '../db/queries/analytics'
import { ProgressChart } from '../components/analytics/ProgressChart'
import { OneRMChart } from '../components/analytics/OneRMChart'
import { Card } from '../components/ui/Card'
import { formatWeight } from '../lib/formulas'

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { db, unit } = useDatabase()
  const navigate = useNavigate()

  const exercise = useMemo(() => db && id ? getExerciseById(db, Number(id)) : null, [db, id])
  const progress = useMemo(() => db && id ? getExerciseProgress(db, Number(id)) : [], [db, id])
  const pr = useMemo(() => db && id ? getExercisePR(db, Number(id)) : null, [db, id])

  if (!exercise) {
    return <div className="py-8 text-center text-text-muted">Exercise not found</div>
  }

  return (
    <div className="py-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/exercises')} className="p-2 rounded-xl hover:bg-surface active:bg-surface-hover text-text-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{exercise.name}</h2>
          <p className="text-sm text-text-muted">{exercise.muscle_group_name}</p>
        </div>
      </div>

      {pr && (
        <Card className="border border-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Personal Record</span>
          </div>
          <p className="text-text-primary font-semibold">
            {formatWeight(pr.weight_kg, unit)} x {pr.reps} reps
          </p>
          <p className="text-xs text-text-muted">
            Estimated 1RM: {formatWeight(pr.e1rm, unit)} &middot; {pr.date}
          </p>
        </Card>
      )}

      <Card>
        <ProgressChart data={progress} unit={unit} dataKey="best_weight" title="Weight Progression" />
      </Card>

      <Card>
        <OneRMChart data={progress} unit={unit} />
      </Card>
    </div>
  )
}
