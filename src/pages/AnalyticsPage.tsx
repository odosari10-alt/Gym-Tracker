import { useMemo } from 'react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getWeeklySummaries, getPersonalRecords } from '../db/queries/analytics'
import { VolumeChart } from '../components/analytics/VolumeChart'
import { PRBadge } from '../components/analytics/PRBadge'
import { WeeklySummaryCard } from '../components/analytics/WeeklySummaryCard'
import { Card } from '../components/ui/Card'
import { BarChart3 } from 'lucide-react'

export function AnalyticsPage() {
  const { db, unit } = useDatabase()

  const weeklySummaries = useMemo(() => db ? getWeeklySummaries(db, 12) : [], [db])
  const prs = useMemo(() => db ? getPersonalRecords(db, 10) : [], [db])
  const currentWeek = weeklySummaries.length > 0 ? weeklySummaries[weeklySummaries.length - 1] : null

  if (!weeklySummaries.length && !prs.length) {
    return (
      <div className="py-8 text-center">
        <BarChart3 className="h-12 w-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted font-medium">No analytics data yet</p>
        <p className="text-text-muted text-sm mt-1">Complete some workouts to see your progress</p>
      </div>
    )
  }

  return (
    <div className="py-4 flex flex-col gap-5">
      <h2 className="text-xl font-extrabold tracking-tight">Analytics</h2>

      {currentWeek && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">This Week</h3>
          <WeeklySummaryCard summary={currentWeek} unit={unit} />
        </div>
      )}

      {weeklySummaries.length > 0 && (
        <Card>
          <VolumeChart data={weeklySummaries} unit={unit} />
        </Card>
      )}

      {prs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Personal Records</h3>
          <div className="flex flex-col gap-2">
            {prs.map((pr) => (
              <PRBadge key={pr.exercise_id} pr={pr} unit={unit} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
