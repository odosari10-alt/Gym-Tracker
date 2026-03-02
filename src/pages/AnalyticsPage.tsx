import { useState, useEffect } from 'react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getWeeklySummaries, getPersonalRecords } from '../db/queries/analytics'
import { VolumeChart } from '../components/analytics/VolumeChart'
import { PRBadge } from '../components/analytics/PRBadge'
import { WeeklySummaryCard } from '../components/analytics/WeeklySummaryCard'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { BarChart3 } from 'lucide-react'
import type { WeeklySummary, PersonalRecord } from '../types'

export function AnalyticsPage() {
  const { unit } = useDatabase()
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getWeeklySummaries(12).then(setWeeklySummaries),
      getPersonalRecords(10).then(setPrs),
    ]).finally(() => setLoading(false))
  }, [])

  const currentWeek = weeklySummaries.length > 0 ? weeklySummaries[weeklySummaries.length - 1] : null

  if (loading) return <Spinner />

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
