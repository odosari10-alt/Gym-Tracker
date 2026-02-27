import type { Database } from 'sql.js'
import { query, execute } from './queryHelper'

function findOrCreateExercise(db: Database, name: string, muscleGroup: string): number {
  const rows = query(db, 'SELECT id FROM exercises WHERE name = ?', [name])
  if (rows.length) return Number(rows[0][0])

  const mgRows = query(db, 'SELECT id FROM muscle_groups WHERE name = ?', [muscleGroup])
  const mgId = mgRows.length ? Number(mgRows[0][0]) : 1
  execute(db, 'INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES (?, ?, 0)', [name, mgId])
  const result = db.exec('SELECT last_insert_rowid()')
  return Number(result[0].values[0][0])
}

interface ScheduleSeed {
  name: string
  days: { name: string; exercises: [string, string][] }[]
}

const SCHEDULES: ScheduleSeed[] = [
  {
    name: 'Push / Pull / Legs (PPL)',
    days: [
      {
        name: 'Push',
        exercises: [
          ['Barbell Bench Press', 'Chest'],
          ['Overhead Barbell Press (Standing)', 'Shoulders'],
          ['Incline Dumbbell Press', 'Chest'],
          ['Dumbbell Lateral Raise', 'Shoulders'],
          ['Tricep Rope Pushdown', 'Arms'],
          ['Overhead Tricep Cable Extension', 'Arms'],
        ],
      },
      {
        name: 'Pull',
        exercises: [
          ['Barbell Bent-Over Row', 'Back'],
          ['Weighted Pull-Up', 'Back'],
          ['Seated Cable Row', 'Back'],
          ['Face Pull', 'Shoulders'],
          ['Barbell Bicep Curl', 'Arms'],
          ['Dumbbell Hammer Curl', 'Arms'],
        ],
      },
      {
        name: 'Legs',
        exercises: [
          ['Barbell Back Squat', 'Legs'],
          ['Romanian Deadlift', 'Legs'],
          ['Leg Press', 'Legs'],
          ['Walking Dumbbell Lunge', 'Legs'],
          ['Leg Curl Machine', 'Legs'],
          ['Standing Calf Raise', 'Legs'],
        ],
      },
    ],
  },
  {
    name: 'Upper / Lower Split',
    days: [
      {
        name: 'Upper A',
        exercises: [
          ['Barbell Bench Press', 'Chest'],
          ['Barbell Bent-Over Row', 'Back'],
          ['Overhead Barbell Press (Standing)', 'Shoulders'],
          ['Lat Pulldown (Wide Grip)', 'Back'],
          ['Dumbbell Lateral Raise', 'Shoulders'],
          ['Barbell Bicep Curl', 'Arms'],
          ['Tricep Rope Pushdown', 'Arms'],
        ],
      },
      {
        name: 'Lower A',
        exercises: [
          ['Barbell Back Squat', 'Legs'],
          ['Romanian Deadlift', 'Legs'],
          ['Leg Press', 'Legs'],
          ['Leg Curl Machine', 'Legs'],
          ['Leg Extension Machine', 'Legs'],
          ['Standing Calf Raise', 'Legs'],
          ['Cable Crunch', 'Core'],
        ],
      },
      {
        name: 'Upper B',
        exercises: [
          ['Incline Dumbbell Press', 'Chest'],
          ['Weighted Pull-Up', 'Back'],
          ['Seated Dumbbell Shoulder Press', 'Shoulders'],
          ['Seated Cable Row', 'Back'],
          ['Cable Lateral Raise', 'Shoulders'],
          ['Dumbbell Hammer Curl', 'Arms'],
          ['Overhead Tricep Cable Extension', 'Arms'],
        ],
      },
      {
        name: 'Lower B',
        exercises: [
          ['Barbell Front Squat', 'Legs'],
          ['Conventional Barbell Deadlift', 'Back'],
          ['Bulgarian Split Squat (Dumbbell)', 'Legs'],
          ['Glute Ham Raise', 'Legs'],
          ['Hip Thrust (Barbell)', 'Legs'],
          ['Seated Calf Raise', 'Legs'],
          ['Hanging Leg Raise', 'Core'],
        ],
      },
    ],
  },
  {
    name: 'Bro Split',
    days: [
      {
        name: 'Chest',
        exercises: [
          ['Barbell Bench Press (Flat)', 'Chest'],
          ['Incline Dumbbell Press', 'Chest'],
          ['Decline Barbell Press', 'Chest'],
          ['Cable Chest Fly (Low to High)', 'Chest'],
          ['Cable Chest Fly (High to Low)', 'Chest'],
          ['Dumbbell Pullover', 'Chest'],
        ],
      },
      {
        name: 'Back',
        exercises: [
          ['Conventional Barbell Deadlift', 'Back'],
          ['Weighted Pull-Up', 'Back'],
          ['Barbell Bent-Over Row', 'Back'],
          ['Seated Cable Row', 'Back'],
          ['Straight Arm Lat Pulldown', 'Back'],
          ['Dumbbell Single Arm Row', 'Back'],
        ],
      },
      {
        name: 'Shoulders',
        exercises: [
          ['Overhead Barbell Press (Standing)', 'Shoulders'],
          ['Dumbbell Lateral Raise', 'Shoulders'],
          ['Seated Dumbbell Shoulder Press', 'Shoulders'],
          ['Barbell Upright Row', 'Shoulders'],
          ['Face Pull', 'Shoulders'],
          ['Reverse Pec Deck Fly', 'Shoulders'],
        ],
      },
      {
        name: 'Arms',
        exercises: [
          ['Barbell Bicep Curl', 'Arms'],
          ['Close Grip Barbell Bench Press', 'Arms'],
          ['Dumbbell Incline Curl', 'Arms'],
          ['Skull Crusher (EZ Bar)', 'Arms'],
          ['Dumbbell Hammer Curl', 'Arms'],
          ['Tricep Rope Pushdown', 'Arms'],
          ['Cable Overhead Curl', 'Arms'],
          ['Tricep Dip (Weighted)', 'Arms'],
        ],
      },
      {
        name: 'Legs',
        exercises: [
          ['Barbell Back Squat', 'Legs'],
          ['Romanian Deadlift', 'Legs'],
          ['Leg Press', 'Legs'],
          ['Walking Dumbbell Lunge', 'Legs'],
          ['Leg Curl Machine', 'Legs'],
          ['Leg Extension Machine', 'Legs'],
          ['Standing Calf Raise', 'Legs'],
          ['Seated Calf Raise', 'Legs'],
        ],
      },
    ],
  },
  {
    name: 'Full Body',
    days: [
      {
        name: 'Session A',
        exercises: [
          ['Barbell Back Squat', 'Legs'],
          ['Barbell Bench Press', 'Chest'],
          ['Barbell Bent-Over Row', 'Back'],
          ['Overhead Barbell Press (Standing)', 'Shoulders'],
          ['Romanian Deadlift', 'Legs'],
          ['Barbell Bicep Curl', 'Arms'],
          ['Tricep Rope Pushdown', 'Arms'],
        ],
      },
      {
        name: 'Session B',
        exercises: [
          ['Conventional Barbell Deadlift', 'Back'],
          ['Incline Dumbbell Press', 'Chest'],
          ['Weighted Pull-Up', 'Back'],
          ['Seated Dumbbell Shoulder Press', 'Shoulders'],
          ['Bulgarian Split Squat (Dumbbell)', 'Legs'],
          ['Dumbbell Hammer Curl', 'Arms'],
          ['Overhead Tricep Cable Extension', 'Arms'],
        ],
      },
      {
        name: 'Session C',
        exercises: [
          ['Barbell Front Squat', 'Legs'],
          ['Dumbbell Flat Bench Press', 'Chest'],
          ['Seated Cable Row', 'Back'],
          ['Dumbbell Lateral Raise', 'Shoulders'],
          ['Hip Thrust (Barbell)', 'Legs'],
          ['Cable Bicep Curl', 'Arms'],
          ['Tricep Dip (Weighted)', 'Arms'],
        ],
      },
    ],
  },
  {
    name: 'PPLUL Hybrid',
    days: [
      {
        name: 'Push',
        exercises: [
          ['Barbell Bench Press', 'Chest'],
          ['Overhead Barbell Press (Standing)', 'Shoulders'],
          ['Incline Dumbbell Press', 'Chest'],
          ['Dumbbell Lateral Raise', 'Shoulders'],
          ['Tricep Rope Pushdown', 'Arms'],
          ['Overhead Tricep Cable Extension', 'Arms'],
        ],
      },
      {
        name: 'Pull',
        exercises: [
          ['Barbell Bent-Over Row', 'Back'],
          ['Weighted Pull-Up', 'Back'],
          ['Seated Cable Row', 'Back'],
          ['Face Pull', 'Shoulders'],
          ['Barbell Bicep Curl', 'Arms'],
          ['Dumbbell Hammer Curl', 'Arms'],
        ],
      },
      {
        name: 'Legs (Heavy)',
        exercises: [
          ['Barbell Back Squat', 'Legs'],
          ['Romanian Deadlift', 'Legs'],
          ['Leg Press', 'Legs'],
          ['Leg Curl Machine', 'Legs'],
          ['Standing Calf Raise', 'Legs'],
        ],
      },
      {
        name: 'Upper (Hypertrophy)',
        exercises: [
          ['Incline Dumbbell Press', 'Chest'],
          ['Lat Pulldown (Wide Grip)', 'Back'],
          ['Seated Dumbbell Shoulder Press', 'Shoulders'],
          ['Dumbbell Single Arm Row', 'Back'],
          ['Cable Lateral Raise', 'Shoulders'],
          ['Cable Bicep Curl', 'Arms'],
          ['Skull Crusher (EZ Bar)', 'Arms'],
        ],
      },
      {
        name: 'Lower (Hypertrophy)',
        exercises: [
          ['Barbell Front Squat', 'Legs'],
          ['Bulgarian Split Squat (Dumbbell)', 'Legs'],
          ['Hip Thrust (Barbell)', 'Legs'],
          ['Leg Extension Machine', 'Legs'],
          ['Leg Curl Machine', 'Legs'],
          ['Seated Calf Raise', 'Legs'],
          ['Hanging Leg Raise', 'Core'],
        ],
      },
    ],
  },
  {
    name: 'Anterior / Posterior Split',
    days: [
      {
        name: 'Anterior A',
        exercises: [
          ['Barbell Back Squat', 'Legs'],
          ['Barbell Bench Press (Flat)', 'Chest'],
          ['Overhead Barbell Press (Standing)', 'Shoulders'],
          ['Leg Extension Machine', 'Legs'],
          ['Incline Dumbbell Press', 'Chest'],
          ['Dumbbell Lateral Raise', 'Shoulders'],
          ['Tricep Rope Pushdown', 'Arms'],
          ['Cable Crunch', 'Core'],
        ],
      },
      {
        name: 'Posterior A',
        exercises: [
          ['Conventional Barbell Deadlift', 'Back'],
          ['Barbell Bent-Over Row', 'Back'],
          ['Romanian Deadlift', 'Legs'],
          ['Weighted Pull-Up', 'Back'],
          ['Leg Curl Machine', 'Legs'],
          ['Face Pull', 'Shoulders'],
          ['Barbell Bicep Curl', 'Arms'],
          ['Reverse Hyperextension', 'Back'],
        ],
      },
      {
        name: 'Anterior B',
        exercises: [
          ['Barbell Front Squat', 'Legs'],
          ['Incline Barbell Bench Press', 'Chest'],
          ['Seated Dumbbell Shoulder Press', 'Shoulders'],
          ['Leg Press', 'Legs'],
          ['Cable Chest Fly (Low to High)', 'Chest'],
          ['Cable Lateral Raise', 'Shoulders'],
          ['Overhead Tricep Cable Extension', 'Arms'],
          ['Hanging Leg Raise', 'Core'],
        ],
      },
      {
        name: 'Posterior B',
        exercises: [
          ['Hip Thrust (Barbell)', 'Legs'],
          ['Seated Cable Row', 'Back'],
          ['Glute Ham Raise', 'Legs'],
          ['Lat Pulldown (Wide Grip)', 'Back'],
          ['Dumbbell Single Arm Row', 'Back'],
          ['Reverse Pec Deck Fly', 'Shoulders'],
          ['Dumbbell Hammer Curl', 'Arms'],
          ['Back Extension (Weighted)', 'Back'],
        ],
      },
    ],
  },
]

export function seedTemplates(db: Database): void {
  const count = db.exec('SELECT COUNT(*) FROM templates')
  if (count.length && Number(count[0].values[0][0]) > 0) return

  for (const schedule of SCHEDULES) {
    execute(db, 'INSERT INTO templates (name, is_preset) VALUES (?, 1)', [schedule.name])
    const tplResult = db.exec('SELECT last_insert_rowid()')
    const templateId = Number(tplResult[0].values[0][0])

    for (let d = 0; d < schedule.days.length; d++) {
      const day = schedule.days[d]
      execute(db, 'INSERT INTO template_days (template_id, name, sort_order) VALUES (?, ?, ?)', [templateId, day.name, d])
      const dayResult = db.exec('SELECT last_insert_rowid()')
      const dayId = Number(dayResult[0].values[0][0])

      for (let e = 0; e < day.exercises.length; e++) {
        const [exName, exGroup] = day.exercises[e]
        const exerciseId = findOrCreateExercise(db, exName, exGroup)
        execute(db, 'INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES (?, ?, ?)', [dayId, exerciseId, e])
      }
    }
  }
}
