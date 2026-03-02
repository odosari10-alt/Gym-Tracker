import { supabase } from '../../lib/supabase'
import type { Set } from '../../types'

export async function getSetsForWorkoutExercise(workoutExerciseId: number): Promise<Set[]> {
  const { data, error } = await supabase
    .from('sets')
    .select('id, workout_exercise_id, set_number, weight_kg, reps, is_warmup, rpe')
    .eq('workout_exercise_id', workoutExerciseId)
    .order('set_number')

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    workout_exercise_id: row.workout_exercise_id,
    set_number: row.set_number,
    weight_kg: row.weight_kg,
    reps: row.reps,
    is_warmup: row.is_warmup,
    rpe: row.rpe ?? null,
  }))
}

export async function addSet(
  workoutExerciseId: number,
  weightKg: number,
  reps: number,
  isWarmup: boolean = false,
  rpe: number | null = null,
): Promise<number> {
  // Count existing sets to determine set_number
  const { count, error: countError } = await supabase
    .from('sets')
    .select('id', { count: 'exact', head: true })
    .eq('workout_exercise_id', workoutExerciseId)

  if (countError) throw countError

  const setNumber = (count ?? 0) + 1

  const { data, error } = await supabase
    .from('sets')
    .insert({
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      weight_kg: weightKg,
      reps,
      is_warmup: isWarmup,
      rpe,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function updateSet(
  setId: number,
  weightKg: number,
  reps: number,
  isWarmup: boolean,
  rpe: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('sets')
    .update({
      weight_kg: weightKg,
      reps,
      is_warmup: isWarmup,
      rpe,
    })
    .eq('id', setId)

  if (error) throw error
}

export async function deleteSet(setId: number): Promise<void> {
  // Get the workout_exercise_id before deleting
  const { data: setData, error: fetchError } = await supabase
    .from('sets')
    .select('workout_exercise_id')
    .eq('id', setId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') return
    throw fetchError
  }

  const weId = setData.workout_exercise_id

  // Delete the set
  const { error: deleteError } = await supabase
    .from('sets')
    .delete()
    .eq('id', setId)

  if (deleteError) throw deleteError

  // Renumber remaining sets to avoid gaps
  const { data: remaining, error: remainError } = await supabase
    .from('sets')
    .select('id')
    .eq('workout_exercise_id', weId)
    .order('set_number')

  if (remainError) throw remainError

  for (let i = 0; i < (remaining ?? []).length; i++) {
    const { error: updateError } = await supabase
      .from('sets')
      .update({ set_number: i + 1 })
      .eq('id', remaining![i].id)

    if (updateError) throw updateError
  }
}
