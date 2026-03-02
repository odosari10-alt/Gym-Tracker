import { supabase } from '../../lib/supabase'
import { nowISO } from '../../lib/dates'
import type { Template, TemplateDay, TemplateDayExercise, TemplateWithDays } from '../../types'

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('id, name, is_preset')
    .order('is_preset', { ascending: false })
    .order('name')

  if (error) throw error

  // Fetch day counts for each template
  const templates: Template[] = []
  for (const row of data ?? []) {
    const { count, error: countError } = await supabase
      .from('template_days')
      .select('id', { count: 'exact', head: true })
      .eq('template_id', row.id)

    if (countError) throw countError

    templates.push({
      id: row.id,
      name: row.name,
      is_preset: row.is_preset,
      day_count: count ?? 0,
    })
  }

  return templates
}

export async function getTemplateById(id: number): Promise<TemplateWithDays | null> {
  // Fetch the template
  const { data: tpl, error: tplError } = await supabase
    .from('templates')
    .select('id, name, is_preset')
    .eq('id', id)
    .single()

  if (tplError) {
    if (tplError.code === 'PGRST116') return null
    throw tplError
  }

  // Fetch its days
  const { data: dayRows, error: dayError } = await supabase
    .from('template_days')
    .select('id, template_id, name, sort_order')
    .eq('template_id', id)
    .order('sort_order')

  if (dayError) throw dayError

  // For each day, fetch exercises with joins
  const days: (TemplateDay & { exercises: TemplateDayExercise[] })[] = []
  for (const day of dayRows ?? []) {
    const { data: exRows, error: exError } = await supabase
      .from('template_day_exercises')
      .select('id, template_day_id, exercise_id, sort_order, exercises(name, muscle_groups(name))')
      .eq('template_day_id', day.id)
      .order('sort_order')

    if (exError) throw exError

    const exercises: TemplateDayExercise[] = (exRows ?? []).map((row: any) => ({
      id: row.id,
      template_day_id: row.template_day_id,
      exercise_id: row.exercise_id,
      sort_order: row.sort_order,
      exercise_name: row.exercises?.name ?? '',
      muscle_group_name: row.exercises?.muscle_groups?.name ?? '',
    }))

    days.push({
      id: day.id,
      template_id: day.template_id,
      name: day.name,
      sort_order: day.sort_order,
      exercises,
    })
  }

  return {
    id: tpl.id,
    name: tpl.name,
    is_preset: tpl.is_preset,
    days,
  }
}

export async function getTemplatesWithDays(): Promise<TemplateWithDays[]> {
  const { data: tplRows, error: tplError } = await supabase
    .from('templates')
    .select('id, name, is_preset')
    .order('is_preset', { ascending: false })
    .order('name')

  if (tplError) throw tplError

  const result: TemplateWithDays[] = []
  for (const tpl of tplRows ?? []) {
    const { data: dayRows, error: dayError } = await supabase
      .from('template_days')
      .select('id, template_id, name, sort_order')
      .eq('template_id', tpl.id)
      .order('sort_order')

    if (dayError) throw dayError

    result.push({
      id: tpl.id,
      name: tpl.name,
      is_preset: tpl.is_preset,
      days: (dayRows ?? []).map((day) => ({
        id: day.id,
        template_id: day.template_id,
        name: day.name,
        sort_order: day.sort_order,
        exercises: [] as TemplateDayExercise[],
      })),
    })
  }

  return result
}

export async function createTemplate(name: string): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  const { data, error } = await supabase
    .from('templates')
    .insert({ name, is_preset: false, user_id: userId })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function deleteTemplate(id: number): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function addTemplateDay(templateId: number, name: string): Promise<number> {
  // Compute max sort_order
  const { data: existing, error: fetchError } = await supabase
    .from('template_days')
    .select('sort_order')
    .eq('template_id', templateId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) throw fetchError

  const sortOrder = existing ? existing.sort_order + 1 : 0

  const { data, error } = await supabase
    .from('template_days')
    .insert({ template_id: templateId, name, sort_order: sortOrder })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function deleteTemplateDay(dayId: number): Promise<void> {
  const { error } = await supabase
    .from('template_days')
    .delete()
    .eq('id', dayId)

  if (error) throw error
}

export async function renameTemplateDay(dayId: number, name: string): Promise<void> {
  const { error } = await supabase
    .from('template_days')
    .update({ name })
    .eq('id', dayId)

  if (error) throw error
}

export async function addExerciseToDay(dayId: number, exerciseId: number): Promise<number> {
  // Compute max sort_order
  const { data: existing, error: fetchError } = await supabase
    .from('template_day_exercises')
    .select('sort_order')
    .eq('template_day_id', dayId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) throw fetchError

  const sortOrder = existing ? existing.sort_order + 1 : 0

  const { data, error } = await supabase
    .from('template_day_exercises')
    .insert({ template_day_id: dayId, exercise_id: exerciseId, sort_order: sortOrder })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function removeExerciseFromDay(templateDayExerciseId: number): Promise<void> {
  const { error } = await supabase
    .from('template_day_exercises')
    .delete()
    .eq('id', templateDayExerciseId)

  if (error) throw error
}

export async function addTemplateDayToWorkout(workoutId: number, dayId: number): Promise<void> {
  // Get current max sort_order for the workout
  const { data: existing, error: fetchError } = await supabase
    .from('workout_exercises')
    .select('sort_order')
    .eq('workout_id', workoutId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) throw fetchError

  let sortOrder = existing ? existing.sort_order + 1 : 0

  // Fetch day exercises
  const { data: exRows, error: exError } = await supabase
    .from('template_day_exercises')
    .select('exercise_id')
    .eq('template_day_id', dayId)
    .order('sort_order')

  if (exError) throw exError

  for (const row of exRows ?? []) {
    // Insert workout exercise
    const { data: weData, error: weError } = await supabase
      .from('workout_exercises')
      .insert({ workout_id: workoutId, exercise_id: row.exercise_id, sort_order: sortOrder })
      .select('id')
      .single()

    if (weError) throw weError

    // Insert initial empty set
    const { error: setError } = await supabase
      .from('sets')
      .insert({
        workout_exercise_id: weData.id,
        set_number: 1,
        weight_kg: 0,
        reps: 0,
        is_warmup: false,
        rpe: null,
      })

    if (setError) throw setError

    sortOrder++
  }
}

export async function startWorkoutFromDay(dayId: number): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  // Create a new workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({ started_at: nowISO(), user_id: userId })
    .select('id')
    .single()

  if (workoutError) throw workoutError

  const workoutId = workout.id

  // Fetch day exercises
  const { data: exRows, error: exError } = await supabase
    .from('template_day_exercises')
    .select('exercise_id, sort_order')
    .eq('template_day_id', dayId)
    .order('sort_order')

  if (exError) throw exError

  for (const row of exRows ?? []) {
    // Insert workout exercise
    const { data: weData, error: weError } = await supabase
      .from('workout_exercises')
      .insert({ workout_id: workoutId, exercise_id: row.exercise_id, sort_order: row.sort_order })
      .select('id')
      .single()

    if (weError) throw weError

    // Insert initial empty set
    const { error: setError } = await supabase
      .from('sets')
      .insert({
        workout_exercise_id: weData.id,
        set_number: 1,
        weight_kg: 0,
        reps: 0,
        is_warmup: false,
        rpe: null,
      })

    if (setError) throw setError
  }

  return workoutId
}
