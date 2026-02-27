import type { Database } from 'sql.js'
import { scheduleSave } from '../database'
import { query, execute } from '../queryHelper'
import type { Exercise, MuscleGroup } from '../../types'

export function getMuscleGroups(db: Database): MuscleGroup[] {
  const rows = query(db, 'SELECT id, name FROM muscle_groups ORDER BY id')
  return rows.map(([id, name]) => ({
    id: Number(id),
    name: String(name),
  }))
}

export function getExercises(db: Database, muscleGroupId?: number, search?: string): Exercise[] {
  let sql = `
    SELECT e.id, e.name, e.muscle_group_id, e.is_custom, mg.name as muscle_group_name
    FROM exercises e
    JOIN muscle_groups mg ON mg.id = e.muscle_group_id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (muscleGroupId != null) {
    sql += ' AND e.muscle_group_id = ?'
    params.push(muscleGroupId)
  }
  if (search) {
    sql += ' AND e.name LIKE ?'
    params.push(`%${search}%`)
  }

  sql += ' ORDER BY mg.name, e.name'

  const rows = query(db, sql, params)
  return rows.map(([id, name, muscle_group_id, is_custom, muscle_group_name]) => ({
    id: Number(id),
    name: String(name),
    muscle_group_id: Number(muscle_group_id),
    is_custom: Boolean(is_custom),
    muscle_group_name: String(muscle_group_name),
  }))
}

export function getExerciseById(db: Database, id: number): Exercise | null {
  const rows = query(db, `
    SELECT e.id, e.name, e.muscle_group_id, e.is_custom, mg.name as muscle_group_name
    FROM exercises e
    JOIN muscle_groups mg ON mg.id = e.muscle_group_id
    WHERE e.id = ?
  `, [id])
  if (!rows.length) return null
  const [eid, name, muscle_group_id, is_custom, muscle_group_name] = rows[0]
  return {
    id: Number(eid),
    name: String(name),
    muscle_group_id: Number(muscle_group_id),
    is_custom: Boolean(is_custom),
    muscle_group_name: String(muscle_group_name),
  }
}

export function createExercise(db: Database, name: string, muscleGroupId: number): number {
  execute(db, 'INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES (?, ?, 1)', [name, muscleGroupId])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function deleteExercise(db: Database, id: number): void {
  execute(db, 'DELETE FROM exercises WHERE id = ? AND is_custom = 1', [id])
  scheduleSave()
}
