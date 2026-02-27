import type { Database } from 'sql.js'
import { scheduleSave } from '../database'
import { query, execute } from '../queryHelper'
import { nowISO } from '../../lib/dates'
import type { Workout, WorkoutExercise, WorkoutSummary } from '../../types'

export function startWorkout(db: Database): number {
  execute(db, 'INSERT INTO workouts (started_at) VALUES (?)', [nowISO()])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function finishWorkout(db: Database, id: number, notes?: string): void {
  execute(db, 'UPDATE workouts SET finished_at = ?, notes = ? WHERE id = ?', [nowISO(), notes ?? null, id])
  scheduleSave()
}

export function deleteWorkout(db: Database, id: number): void {
  execute(db, 'DELETE FROM sets WHERE workout_exercise_id IN (SELECT id FROM workout_exercises WHERE workout_id = ?)', [id])
  execute(db, 'DELETE FROM workout_exercises WHERE workout_id = ?', [id])
  execute(db, 'DELETE FROM workouts WHERE id = ?', [id])
  scheduleSave()
}

export function getActiveWorkout(db: Database): Workout | null {
  const rows = query(db, 'SELECT id, started_at, finished_at, notes FROM workouts WHERE finished_at IS NULL ORDER BY id DESC LIMIT 1')
  if (!rows.length) return null
  const [id, started_at, finished_at, notes] = rows[0]
  return { id: Number(id), started_at: String(started_at), finished_at: finished_at ? String(finished_at) : null, notes: notes ? String(notes) : null }
}

export function getWorkoutById(db: Database, id: number): Workout | null {
  const rows = query(db, 'SELECT id, started_at, finished_at, notes FROM workouts WHERE id = ?', [id])
  if (!rows.length) return null
  const [wid, started_at, finished_at, notes] = rows[0]
  return { id: Number(wid), started_at: String(started_at), finished_at: finished_at ? String(finished_at) : null, notes: notes ? String(notes) : null }
}

export function addExerciseToWorkout(db: Database, workoutId: number, exerciseId: number): number {
  const orderRows = query(db, 'SELECT COALESCE(MAX(sort_order), -1) + 1 FROM workout_exercises WHERE workout_id = ?', [workoutId])
  const sortOrder = Number(orderRows[0][0])
  execute(db, 'INSERT INTO workout_exercises (workout_id, exercise_id, sort_order) VALUES (?, ?, ?)', [workoutId, exerciseId, sortOrder])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function removeExerciseFromWorkout(db: Database, workoutExerciseId: number): void {
  execute(db, 'DELETE FROM sets WHERE workout_exercise_id = ?', [workoutExerciseId])
  execute(db, 'DELETE FROM workout_exercises WHERE id = ?', [workoutExerciseId])
  scheduleSave()
}

export function getWorkoutExercises(db: Database, workoutId: number): WorkoutExercise[] {
  const rows = query(db, `
    SELECT we.id, we.workout_id, we.exercise_id, we.sort_order, we.notes,
           e.name as exercise_name, mg.name as muscle_group_name
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    JOIN muscle_groups mg ON mg.id = e.muscle_group_id
    WHERE we.workout_id = ?
    ORDER BY we.sort_order
  `, [workoutId])
  return rows.map(([id, workout_id, exercise_id, sort_order, notes, exercise_name, muscle_group_name]) => ({
    id: Number(id),
    workout_id: Number(workout_id),
    exercise_id: Number(exercise_id),
    sort_order: Number(sort_order),
    notes: notes ? String(notes) : null,
    exercise_name: String(exercise_name),
    muscle_group_name: String(muscle_group_name),
  }))
}

export function getWorkoutSummaries(db: Database, limit?: number): WorkoutSummary[] {
  let sql = `
    SELECT w.id, w.started_at, w.finished_at, w.notes,
      (SELECT COUNT(DISTINCT we.id) FROM workout_exercises we WHERE we.workout_id = w.id) as exercise_count,
      (SELECT COUNT(*) FROM sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id WHERE we.workout_id = w.id) as total_sets,
      (SELECT COALESCE(SUM(s.weight_kg * s.reps), 0) FROM sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id WHERE we.workout_id = w.id AND s.is_warmup = 0) as total_volume,
      CASE WHEN w.finished_at IS NOT NULL
        THEN ROUND((julianday(w.finished_at) - julianday(w.started_at)) * 1440)
        ELSE NULL END as duration_minutes
    FROM workouts w
    WHERE w.finished_at IS NOT NULL
    ORDER BY w.started_at DESC
  `
  const params: number[] = []
  if (limit != null) {
    sql += ' LIMIT ?'
    params.push(limit)
  }

  const rows = query(db, sql, params)
  return rows.map(([id, started_at, finished_at, notes, exercise_count, total_sets, total_volume, duration_minutes]) => ({
    id: Number(id),
    started_at: String(started_at),
    finished_at: finished_at ? String(finished_at) : null,
    notes: notes ? String(notes) : null,
    exercise_count: Number(exercise_count),
    total_sets: Number(total_sets),
    total_volume: Number(total_volume),
    duration_minutes: duration_minutes != null ? Number(duration_minutes) : null,
  }))
}
