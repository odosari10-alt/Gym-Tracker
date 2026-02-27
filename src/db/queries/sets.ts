import type { Database } from 'sql.js'
import { scheduleSave } from '../database'
import { query, execute } from '../queryHelper'
import type { Set } from '../../types'

export function getSetsForWorkoutExercise(db: Database, workoutExerciseId: number): Set[] {
  const rows = query(db, `
    SELECT id, workout_exercise_id, set_number, weight_kg, reps, is_warmup, rpe
    FROM sets WHERE workout_exercise_id = ? ORDER BY set_number
  `, [workoutExerciseId])
  return rows.map(([id, workout_exercise_id, set_number, weight_kg, reps, is_warmup, rpe]) => ({
    id: Number(id),
    workout_exercise_id: Number(workout_exercise_id),
    set_number: Number(set_number),
    weight_kg: Number(weight_kg),
    reps: Number(reps),
    is_warmup: Boolean(is_warmup),
    rpe: rpe != null ? Number(rpe) : null,
  }))
}

export function addSet(db: Database, workoutExerciseId: number, weightKg: number, reps: number, isWarmup: boolean = false, rpe: number | null = null): number {
  const numRows = query(db, 'SELECT COALESCE(MAX(set_number), 0) + 1 FROM sets WHERE workout_exercise_id = ?', [workoutExerciseId])
  const setNumber = Number(numRows[0][0])
  execute(db, 'INSERT INTO sets (workout_exercise_id, set_number, weight_kg, reps, is_warmup, rpe) VALUES (?, ?, ?, ?, ?, ?)',
    [workoutExerciseId, setNumber, weightKg, reps, isWarmup ? 1 : 0, rpe])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function updateSet(db: Database, setId: number, weightKg: number, reps: number, isWarmup: boolean, rpe: number | null): void {
  execute(db, 'UPDATE sets SET weight_kg = ?, reps = ?, is_warmup = ?, rpe = ? WHERE id = ?',
    [weightKg, reps, isWarmup ? 1 : 0, rpe, setId])
  scheduleSave()
}

export function deleteSet(db: Database, setId: number): void {
  const rows = query(db, 'SELECT workout_exercise_id FROM sets WHERE id = ?', [setId])
  if (!rows.length) return
  const weId = Number(rows[0][0])

  execute(db, 'DELETE FROM sets WHERE id = ?', [setId])

  // Renumber remaining sets to avoid gaps
  const remaining = query(db, 'SELECT id FROM sets WHERE workout_exercise_id = ? ORDER BY set_number', [weId])
  remaining.forEach((row, i) => {
    execute(db, 'UPDATE sets SET set_number = ? WHERE id = ?', [i + 1, Number(row[0])])
  })

  scheduleSave()
}
