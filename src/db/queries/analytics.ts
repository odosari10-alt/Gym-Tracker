import { supabase } from '../../lib/supabase'
import type { ExerciseProgress, PersonalRecord, WeeklySummary } from '../../types'

export async function getExerciseProgress(exerciseId: number): Promise<ExerciseProgress[]> {
  const { data, error } = await supabase.rpc('get_exercise_progress', {
    p_exercise_id: exerciseId,
  })

  if (error) throw error
  return (data ?? []) as ExerciseProgress[]
}

export async function getPersonalRecords(limit?: number): Promise<PersonalRecord[]> {
  const { data, error } = await supabase.rpc('get_personal_records', {
    p_limit: limit ?? null,
  })

  if (error) throw error
  return (data ?? []) as PersonalRecord[]
}

export async function getWeeklySummaries(weeks?: number): Promise<WeeklySummary[]> {
  const { data, error } = await supabase.rpc('get_weekly_summaries', {
    p_weeks: weeks ?? 12,
  })

  if (error) throw error
  return (data ?? []) as WeeklySummary[]
}

export async function getExercisePR(exerciseId: number): Promise<PersonalRecord | null> {
  const { data, error } = await supabase.rpc('get_exercise_pr', {
    p_exercise_id: exerciseId,
  })

  if (error) throw error

  if (!data || (Array.isArray(data) && data.length === 0)) return null

  // RPC may return a single object or an array with one element
  const record = Array.isArray(data) ? data[0] : data
  return record as PersonalRecord
}
