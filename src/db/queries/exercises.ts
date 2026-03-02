import { supabase } from '../../lib/supabase'
import type { Exercise, MuscleGroup } from '../../types'

export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('id, name')
    .order('id')

  if (error) throw error
  return data as MuscleGroup[]
}

export async function getExercises(muscleGroupId?: number, search?: string): Promise<Exercise[]> {
  let query = supabase
    .from('exercises')
    .select('id, name, muscle_group_id, is_custom, muscle_groups(name)')

  if (muscleGroupId != null) {
    query = query.eq('muscle_group_id', muscleGroupId)
  }
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  query = query.order('name')

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    muscle_group_id: row.muscle_group_id,
    is_custom: row.is_custom,
    muscle_group_name: row.muscle_groups?.name ?? '',
  }))
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name, muscle_group_id, is_custom, muscle_groups(name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    muscle_group_id: data.muscle_group_id,
    is_custom: data.is_custom,
    muscle_group_name: (data as any).muscle_groups?.name ?? '',
  }
}

export async function createExercise(name: string, muscleGroupId: number): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  const { data, error } = await supabase
    .from('exercises')
    .insert({ name, muscle_group_id: muscleGroupId, is_custom: true, user_id: userId })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function deleteExercise(id: number): Promise<void> {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
    .eq('is_custom', true)

  if (error) throw error
}
