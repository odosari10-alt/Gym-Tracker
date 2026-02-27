import type { Database } from 'sql.js'
import { query } from '../queryHelper'
import type { ExerciseProgress, PersonalRecord, WeeklySummary } from '../../types'

export function getExerciseProgress(db: Database, exerciseId: number): ExerciseProgress[] {
  const rows = query(db, `
    SELECT
      date(w.started_at) as date,
      MAX(s.weight_kg) as best_weight,
      MAX(s.weight_kg * (1.0 + s.reps / 30.0)) as best_e1rm,
      SUM(s.weight_kg * s.reps) as total_volume,
      COUNT(*) as total_sets
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id = ?
      AND s.is_warmup = 0
      AND s.reps > 0
      AND w.finished_at IS NOT NULL
    GROUP BY date(w.started_at)
    ORDER BY date(w.started_at)
  `, [exerciseId])
  return rows.map(([date, best_weight, best_e1rm, total_volume, total_sets]) => ({
    date: String(date),
    best_weight: Number(best_weight),
    best_e1rm: Number(best_e1rm),
    total_volume: Number(total_volume),
    total_sets: Number(total_sets),
  }))
}

export function getPersonalRecords(db: Database, limit?: number): PersonalRecord[] {
  let sql = `
    SELECT exercise_id, exercise_name, weight_kg, reps, e1rm, date
    FROM (
      SELECT
        e.id as exercise_id,
        e.name as exercise_name,
        s.weight_kg,
        s.reps,
        s.weight_kg * (1.0 + s.reps / 30.0) as e1rm,
        date(w.started_at) as date,
        ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY s.weight_kg * (1.0 + s.reps / 30.0) DESC) as rn
      FROM sets s
      JOIN workout_exercises we ON we.id = s.workout_exercise_id
      JOIN exercises e ON e.id = we.exercise_id
      JOIN workouts w ON w.id = we.workout_id
      WHERE s.is_warmup = 0
        AND s.reps > 0
        AND w.finished_at IS NOT NULL
    ) sub
    WHERE rn = 1
    ORDER BY e1rm DESC
  `
  const params: number[] = []
  if (limit != null) {
    sql += ' LIMIT ?'
    params.push(limit)
  }

  const rows = query(db, sql, params)
  return rows.map(([exercise_id, exercise_name, weight_kg, reps, e1rm, date]) => ({
    exercise_id: Number(exercise_id),
    exercise_name: String(exercise_name),
    weight_kg: Number(weight_kg),
    reps: Number(reps),
    e1rm: Number(e1rm),
    date: String(date),
  }))
}

export function getWeeklySummaries(db: Database, weeks: number = 12): WeeklySummary[] {
  // Compute cutoff date in JS to avoid unreliable SQL param concatenation
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeks * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const rows = query(db, `
    SELECT
      date(w.started_at, 'weekday 0', '-6 days') as week_start,
      COUNT(DISTINCT w.id) as workout_count,
      COALESCE(SUM(s.weight_kg * s.reps), 0) as total_volume,
      COUNT(s.id) as total_sets
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN sets s ON s.workout_exercise_id = we.id AND s.is_warmup = 0
    WHERE w.finished_at IS NOT NULL
      AND w.started_at >= ?
    GROUP BY week_start
    ORDER BY week_start
  `, [cutoffStr])
  return rows.map(([week_start, workout_count, total_volume, total_sets]) => ({
    week_start: String(week_start),
    workout_count: Number(workout_count),
    total_volume: Number(total_volume),
    total_sets: Number(total_sets),
  }))
}

export function getExercisePR(db: Database, exerciseId: number): PersonalRecord | null {
  const rows = query(db, `
    SELECT
      e.id as exercise_id,
      e.name as exercise_name,
      s.weight_kg,
      s.reps,
      s.weight_kg * (1.0 + s.reps / 30.0) as e1rm,
      date(w.started_at) as date
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN exercises e ON e.id = we.exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id = ?
      AND s.is_warmup = 0
      AND s.reps > 0
      AND w.finished_at IS NOT NULL
    ORDER BY e1rm DESC
    LIMIT 1
  `, [exerciseId])
  if (!rows.length) return null
  const [exercise_id, exercise_name, weight_kg, reps, e1rm, date] = rows[0]
  return {
    exercise_id: Number(exercise_id),
    exercise_name: String(exercise_name),
    weight_kg: Number(weight_kg),
    reps: Number(reps),
    e1rm: Number(e1rm),
    date: String(date),
  }
}
