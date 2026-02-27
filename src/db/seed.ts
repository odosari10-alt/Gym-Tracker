import type { Database } from 'sql.js'

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']

const EXERCISES: Record<string, string[]> = {
  Chest: [
    'Barbell Bench Press', 'Incline Barbell Bench Press', 'Decline Barbell Bench Press',
    'Dumbbell Bench Press', 'Incline Dumbbell Bench Press', 'Dumbbell Fly',
    'Incline Dumbbell Fly', 'Cable Fly', 'Machine Chest Press',
    'Pec Deck Machine', 'Push-Up', 'Dips (Chest)',
  ],
  Back: [
    'Barbell Row', 'Dumbbell Row', 'Pendlay Row',
    'Seated Cable Row', 'T-Bar Row', 'Pull-Up',
    'Chin-Up', 'Lat Pulldown', 'Straight-Arm Pulldown',
    'Face Pull', 'Deadlift', 'Rack Pull',
  ],
  Legs: [
    'Barbell Squat', 'Front Squat', 'Leg Press',
    'Hack Squat', 'Bulgarian Split Squat', 'Lunges',
    'Romanian Deadlift', 'Leg Curl', 'Leg Extension',
    'Calf Raise', 'Seated Calf Raise', 'Hip Thrust',
    'Goblet Squat', 'Sumo Deadlift',
  ],
  Shoulders: [
    'Overhead Press', 'Dumbbell Shoulder Press', 'Arnold Press',
    'Lateral Raise', 'Front Raise', 'Reverse Fly',
    'Cable Lateral Raise', 'Upright Row', 'Shrugs',
    'Barbell Shrugs', 'Machine Shoulder Press',
  ],
  Arms: [
    'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl',
    'Preacher Curl', 'Concentration Curl', 'Cable Curl',
    'Tricep Pushdown', 'Overhead Tricep Extension', 'Skull Crusher',
    'Close-Grip Bench Press', 'Dips (Triceps)', 'Kickbacks',
  ],
  Core: [
    'Plank', 'Crunch', 'Hanging Leg Raise',
    'Cable Crunch', 'Ab Wheel Rollout', 'Russian Twist',
    'Woodchop', 'Dead Bug', 'Side Plank',
    'Decline Sit-Up',
  ],
}

export function seedDatabase(db: Database): void {
  const count = db.exec('SELECT COUNT(*) FROM muscle_groups')
  if (count.length && Number(count[0].values[0][0]) > 0) return

  // Build the entire seed as a single SQL batch for reliability
  const statements: string[] = []

  for (const group of MUSCLE_GROUPS) {
    statements.push(`INSERT INTO muscle_groups (name) VALUES ('${group}');`)
  }

  // Muscle groups are inserted in order so IDs are 1-based matching array index
  const groupIdMap: Record<string, number> = {}
  MUSCLE_GROUPS.forEach((name, i) => { groupIdMap[name] = i + 1 })

  for (const [groupName, exercises] of Object.entries(EXERCISES)) {
    const groupId = groupIdMap[groupName]
    for (const name of exercises) {
      const escaped = name.replace(/'/g, "''")
      statements.push(`INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES ('${escaped}', ${groupId}, 0);`)
    }
  }

  db.exec(statements.join('\n'))
}
