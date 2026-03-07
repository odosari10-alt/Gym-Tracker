import { supabase } from '../../lib/supabase'
import { nowISO } from '../../lib/dates'
import type { Workout, WorkoutExercise, WorkoutSummary } from '../../types'

export async function startWorkout(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  // Delete any orphaned unfinished workouts before starting a new one
  await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)
    .is('finished_at', null)

  const { data, error } = await supabase
    .from('workouts')
    .insert({ started_at: nowISO(), user_id: userId })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function finishWorkout(id: number, notes?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  const updates: Record<string, unknown> = { finished_at: nowISO() }
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')

  if (error) throw error
  if (!data?.length) throw new Error('Workout not found or not owned by user')

  // Delete any other orphaned unfinished workouts
  await supabase
    .from('workouts')
    .delete()
    .eq('user_id', userId)
    .is('finished_at', null)
}

export async function deleteWorkout(id: number): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getActiveWorkout(): Promise<Workout | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, started_at, finished_at, notes')
    .is('finished_at', null)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as Workout | null
}

export async function getWorkoutById(id: number): Promise<Workout | null> {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, started_at, finished_at, notes')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data as Workout
}

export async function addExerciseToWorkout(workoutId: number, exerciseId: number): Promise<number> {
  // Get the current max sort_order
  const { data: existing, error: fetchError } = await supabase
    .from('workout_exercises')
    .select('sort_order')
    .eq('workout_id', workoutId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) throw fetchError

  const sortOrder = existing ? existing.sort_order + 1 : 0

  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({ workout_id: workoutId, exercise_id: exerciseId, sort_order: sortOrder })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function removeExerciseFromWorkout(workoutExerciseId: number): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', workoutExerciseId)

  if (error) throw error
}

export async function getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('id, workout_id, exercise_id, sort_order, notes, superset_group, exercises(name, muscle_groups(name))')
    .eq('workout_id', workoutId)
    .order('sort_order')

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    workout_id: row.workout_id,
    exercise_id: row.exercise_id,
    sort_order: row.sort_order,
    notes: row.notes ?? null,
    exercise_name: row.exercises?.name ?? '',
    muscle_group_name: row.exercises?.muscle_groups?.name ?? '',
    superset_group: row.superset_group ?? null,
  }))
}

export async function linkSuperset(weId1: number, weId2: number): Promise<void> {
  const group = Date.now()

  const { error: err1 } = await supabase
    .from('workout_exercises')
    .update({ superset_group: group })
    .eq('id', weId1)

  if (err1) throw err1

  const { error: err2 } = await supabase
    .from('workout_exercises')
    .update({ superset_group: group })
    .eq('id', weId2)

  if (err2) throw err2
}

export async function unlinkSuperset(supersetGroup: number): Promise<void> {
  const { error } = await supabase
    .from('workout_exercises')
    .update({ superset_group: null })
    .eq('superset_group', supersetGroup)

  if (error) throw error
}

export async function repeatWorkout(sourceWorkoutId: number): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  // Create new workout
  const { data: newWorkout, error: wErr } = await supabase
    .from('workouts')
    .insert({ started_at: nowISO(), user_id: userId })
    .select('id')
    .single()

  if (wErr) throw wErr
  const newWorkoutId = newWorkout.id

  // Get source exercises with their IDs
  const { data: srcExercises, error: exErr } = await supabase
    .from('workout_exercises')
    .select('id, exercise_id, sort_order, notes, superset_group')
    .eq('workout_id', sourceWorkoutId)
    .order('sort_order')

  if (exErr) throw exErr
  if (!srcExercises?.length) return newWorkoutId

  // Map old superset_group values to new ones
  const supersetMap = new Map<number, number>()

  for (const srcEx of srcExercises) {
    let newSupersetGroup: number | null = null
    if (srcEx.superset_group != null) {
      if (!supersetMap.has(srcEx.superset_group)) {
        supersetMap.set(srcEx.superset_group, Date.now() + supersetMap.size)
      }
      newSupersetGroup = supersetMap.get(srcEx.superset_group)!
    }

    const { data: newWe, error: weErr } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: newWorkoutId,
        exercise_id: srcEx.exercise_id,
        sort_order: srcEx.sort_order,
        notes: srcEx.notes,
        superset_group: newSupersetGroup,
      })
      .select('id')
      .single()

    if (weErr) throw weErr

    // Copy sets from source exercise
    const { data: srcSets, error: sErr } = await supabase
      .from('sets')
      .select('set_number, weight_kg, reps, is_warmup, rpe')
      .eq('workout_exercise_id', srcEx.id)
      .order('set_number')

    if (sErr) throw sErr

    if (srcSets?.length) {
      const { error: insertErr } = await supabase
        .from('sets')
        .insert(
          srcSets.map((s) => ({
            workout_exercise_id: newWe.id,
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps: s.reps,
            is_warmup: s.is_warmup,
            rpe: s.rpe,
          }))
        )

      if (insertErr) throw insertErr
    }
  }

  return newWorkoutId
}

export async function getWorkoutSummaries(limit?: number): Promise<WorkoutSummary[]> {
  const { data, error } = await supabase.rpc('get_workout_summaries', {
    p_limit: limit ?? null,
  })

  if (error) throw error
  return (data ?? []) as WorkoutSummary[]
}
