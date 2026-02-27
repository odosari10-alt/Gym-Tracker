import type { Database } from 'sql.js'
import { scheduleSave } from '../database'
import { query, execute } from '../queryHelper'
import { nowISO } from '../../lib/dates'
import type { Template, TemplateDay, TemplateDayExercise, TemplateWithDays } from '../../types'

export function getTemplates(db: Database): Template[] {
  const rows = query(db, `
    SELECT t.id, t.name, t.is_preset,
      (SELECT COUNT(*) FROM template_days td WHERE td.template_id = t.id) as day_count
    FROM templates t
    ORDER BY t.is_preset DESC, t.name
  `)
  return rows.map(([id, name, is_preset, day_count]) => ({
    id: Number(id),
    name: String(name),
    is_preset: Boolean(is_preset),
    day_count: Number(day_count),
  }))
}

export function getTemplateById(db: Database, id: number): TemplateWithDays | null {
  const tplRows = query(db, 'SELECT id, name, is_preset FROM templates WHERE id = ?', [id])
  if (!tplRows.length) return null
  const [tid, tname, is_preset] = tplRows[0]

  const dayRows = query(db, 'SELECT id, template_id, name, sort_order FROM template_days WHERE template_id = ? ORDER BY sort_order', [id])
  const days: (TemplateDay & { exercises: TemplateDayExercise[] })[] = dayRows.map(([did, template_id, dname, sort_order]) => {
    const exRows = query(db, `
      SELECT tde.id, tde.template_day_id, tde.exercise_id, tde.sort_order,
             e.name as exercise_name, mg.name as muscle_group_name
      FROM template_day_exercises tde
      JOIN exercises e ON e.id = tde.exercise_id
      JOIN muscle_groups mg ON mg.id = e.muscle_group_id
      WHERE tde.template_day_id = ?
      ORDER BY tde.sort_order
    `, [Number(did)])

    return {
      id: Number(did),
      template_id: Number(template_id),
      name: String(dname),
      sort_order: Number(sort_order),
      exercises: exRows.map(([eid, tdid, exid, so, ename, mgname]) => ({
        id: Number(eid),
        template_day_id: Number(tdid),
        exercise_id: Number(exid),
        sort_order: Number(so),
        exercise_name: String(ename),
        muscle_group_name: String(mgname),
      })),
    }
  })

  return {
    id: Number(tid),
    name: String(tname),
    is_preset: Boolean(is_preset),
    days,
  }
}

export function getTemplatesWithDays(db: Database): TemplateWithDays[] {
  const tplRows = query(db, `
    SELECT id, name, is_preset FROM templates ORDER BY is_preset DESC, name
  `)
  return tplRows.map(([id, name, is_preset]) => {
    const dayRows = query(db, 'SELECT id, template_id, name, sort_order FROM template_days WHERE template_id = ? ORDER BY sort_order', [Number(id)])
    const days = dayRows.map(([did, tid, dname, sortOrder]) => ({
      id: Number(did),
      template_id: Number(tid),
      name: String(dname),
      sort_order: Number(sortOrder),
      exercises: [] as TemplateDayExercise[],
    }))
    return {
      id: Number(id),
      name: String(name),
      is_preset: Boolean(is_preset),
      days,
    }
  })
}

export function createTemplate(db: Database, name: string): number {
  execute(db, 'INSERT INTO templates (name, is_preset) VALUES (?, 0)', [name])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function deleteTemplate(db: Database, id: number): void {
  // Delete all nested data
  const dayRows = query(db, 'SELECT id FROM template_days WHERE template_id = ?', [id])
  for (const [dayId] of dayRows) {
    execute(db, 'DELETE FROM template_day_exercises WHERE template_day_id = ?', [Number(dayId)])
  }
  execute(db, 'DELETE FROM template_days WHERE template_id = ?', [id])
  execute(db, 'DELETE FROM templates WHERE id = ?', [id])
  scheduleSave()
}

export function addTemplateDay(db: Database, templateId: number, name: string): number {
  const orderRows = query(db, 'SELECT COALESCE(MAX(sort_order), -1) + 1 FROM template_days WHERE template_id = ?', [templateId])
  const sortOrder = Number(orderRows[0][0])
  execute(db, 'INSERT INTO template_days (template_id, name, sort_order) VALUES (?, ?, ?)', [templateId, name, sortOrder])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function deleteTemplateDay(db: Database, dayId: number): void {
  execute(db, 'DELETE FROM template_day_exercises WHERE template_day_id = ?', [dayId])
  execute(db, 'DELETE FROM template_days WHERE id = ?', [dayId])
  scheduleSave()
}

export function renameTemplateDay(db: Database, dayId: number, name: string): void {
  execute(db, 'UPDATE template_days SET name = ? WHERE id = ?', [name, dayId])
  scheduleSave()
}

export function addExerciseToDay(db: Database, dayId: number, exerciseId: number): number {
  const orderRows = query(db, 'SELECT COALESCE(MAX(sort_order), -1) + 1 FROM template_day_exercises WHERE template_day_id = ?', [dayId])
  const sortOrder = Number(orderRows[0][0])
  execute(db, 'INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES (?, ?, ?)', [dayId, exerciseId, sortOrder])
  const result = db.exec('SELECT last_insert_rowid()')
  const id = Number(result[0].values[0][0])
  scheduleSave()
  return id
}

export function removeExerciseFromDay(db: Database, templateDayExerciseId: number): void {
  execute(db, 'DELETE FROM template_day_exercises WHERE id = ?', [templateDayExerciseId])
  scheduleSave()
}

export function addTemplateDayToWorkout(db: Database, workoutId: number, dayId: number): void {
  const orderRows = query(db, 'SELECT COALESCE(MAX(sort_order), -1) + 1 FROM workout_exercises WHERE workout_id = ?', [workoutId])
  let sortOrder = Number(orderRows[0][0])

  const exRows = query(db, `
    SELECT exercise_id FROM template_day_exercises
    WHERE template_day_id = ? ORDER BY sort_order
  `, [dayId])

  for (const [exerciseId] of exRows) {
    execute(db, 'INSERT INTO workout_exercises (workout_id, exercise_id, sort_order) VALUES (?, ?, ?)',
      [workoutId, Number(exerciseId), sortOrder])
    const weResult = db.exec('SELECT last_insert_rowid()')
    const weId = Number(weResult[0].values[0][0])
    execute(db, 'INSERT INTO sets (workout_exercise_id, set_number, weight_kg, reps, is_warmup, rpe) VALUES (?, 1, 0, 0, 0, NULL)', [weId])
    sortOrder++
  }

  scheduleSave()
}

export function startWorkoutFromDay(db: Database, dayId: number): number {
  execute(db, 'INSERT INTO workouts (started_at) VALUES (?)', [nowISO()])
  const wResult = db.exec('SELECT last_insert_rowid()')
  const workoutId = Number(wResult[0].values[0][0])

  const exRows = query(db, `
    SELECT exercise_id, sort_order FROM template_day_exercises
    WHERE template_day_id = ? ORDER BY sort_order
  `, [dayId])

  for (const [exerciseId, sortOrder] of exRows) {
    execute(db, 'INSERT INTO workout_exercises (workout_id, exercise_id, sort_order) VALUES (?, ?, ?)',
      [workoutId, Number(exerciseId), Number(sortOrder)])
    // Add an initial empty set so the user can immediately fill in weight/reps
    const weResult = db.exec('SELECT last_insert_rowid()')
    const weId = Number(weResult[0].values[0][0])
    execute(db, 'INSERT INTO sets (workout_exercise_id, set_number, weight_kg, reps, is_warmup, rpe) VALUES (?, 1, 0, 0, 0, NULL)', [weId])
  }

  scheduleSave()
  return workoutId
}
