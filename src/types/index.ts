export interface MuscleGroup {
  id: number
  name: string
}

export interface Exercise {
  id: number
  name: string
  muscle_group_id: number
  is_custom: boolean
  muscle_group_name?: string
}

export interface Workout {
  id: number
  started_at: string
  finished_at: string | null
  notes: string | null
}

export interface WorkoutExercise {
  id: number
  workout_id: number
  exercise_id: number
  sort_order: number
  notes: string | null
  exercise_name?: string
  muscle_group_name?: string
}

export interface Set {
  id: number
  workout_exercise_id: number
  set_number: number
  weight_kg: number
  reps: number
  is_warmup: boolean
  rpe: number | null
}

export interface WorkoutWithExercises extends Workout {
  exercises: (WorkoutExercise & { sets: Set[] })[]
  total_sets: number
  total_volume: number
}

export interface ExerciseProgress {
  date: string
  best_weight: number
  best_e1rm: number
  total_volume: number
  total_sets: number
}

export interface PersonalRecord {
  exercise_id: number
  exercise_name: string
  weight_kg: number
  reps: number
  e1rm: number
  date: string
}

export interface WeeklySummary {
  week_start: string
  workout_count: number
  total_volume: number
  total_sets: number
}

export interface WorkoutSummary {
  id: number
  started_at: string
  finished_at: string | null
  notes: string | null
  exercise_count: number
  total_sets: number
  total_volume: number
  duration_minutes: number | null
}

export interface Template {
  id: number
  name: string
  is_preset: boolean
  day_count?: number
}

export interface TemplateDay {
  id: number
  template_id: number
  name: string
  sort_order: number
}

export interface TemplateDayExercise {
  id: number
  template_day_id: number
  exercise_id: number
  sort_order: number
  exercise_name?: string
  muscle_group_name?: string
}

export interface TemplateWithDays extends Template {
  days: (TemplateDay & { exercises: TemplateDayExercise[] })[]
}

export type WeightUnit = 'kg' | 'lb'
