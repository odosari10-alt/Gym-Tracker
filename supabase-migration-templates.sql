-- ============================================================
-- Migration: Add missing exercises + rebuild all 6 preset templates
-- Run in Supabase SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ADD MISSING EXERCISES
-- ============================================================

-- Chest
INSERT INTO exercises (name, muscle_group_id, is_custom)
SELECT v.name, (SELECT id FROM muscle_groups WHERE name = 'Chest'), false
FROM (VALUES
  ('Incline Dumbbell Press'),
  ('Decline Barbell Press'),
  ('Cable Chest Fly (Low to High)'),
  ('Cable Chest Fly (High to Low)'),
  ('Dumbbell Pullover'),
  ('Dumbbell Flat Bench Press')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.name = v.name);

-- Back
INSERT INTO exercises (name, muscle_group_id, is_custom)
SELECT v.name, (SELECT id FROM muscle_groups WHERE name = 'Back'), false
FROM (VALUES
  ('Barbell Bent-Over Row'),
  ('Weighted Pull-Up'),
  ('Conventional Barbell Deadlift'),
  ('Straight Arm Lat Pulldown'),
  ('Dumbbell Single Arm Row'),
  ('Lat Pulldown (Wide Grip)'),
  ('Reverse Hyperextension'),
  ('Back Extension (Weighted)')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.name = v.name);

-- Legs
INSERT INTO exercises (name, muscle_group_id, is_custom)
SELECT v.name, (SELECT id FROM muscle_groups WHERE name = 'Legs'), false
FROM (VALUES
  ('Barbell Back Squat'),
  ('Barbell Front Squat'),
  ('Walking Dumbbell Lunge'),
  ('Leg Curl Machine'),
  ('Standing Calf Raise'),
  ('Leg Extension Machine'),
  ('Bulgarian Split Squat (Dumbbell)'),
  ('Glute Ham Raise'),
  ('Hip Thrust (Barbell)')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.name = v.name);

-- Shoulders
INSERT INTO exercises (name, muscle_group_id, is_custom)
SELECT v.name, (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false
FROM (VALUES
  ('Overhead Barbell Press (Standing)'),
  ('Dumbbell Lateral Raise'),
  ('Seated Dumbbell Shoulder Press'),
  ('Barbell Upright Row'),
  ('Reverse Pec Deck Fly')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.name = v.name);

-- Arms
INSERT INTO exercises (name, muscle_group_id, is_custom)
SELECT v.name, (SELECT id FROM muscle_groups WHERE name = 'Arms'), false
FROM (VALUES
  ('Tricep Rope Pushdown'),
  ('Overhead Tricep Cable Extension'),
  ('Barbell Bicep Curl'),
  ('Dumbbell Hammer Curl'),
  ('Close Grip Barbell Bench Press'),
  ('Dumbbell Incline Curl'),
  ('Skull Crusher (EZ Bar)'),
  ('Cable Overhead Curl'),
  ('Tricep Dip (Weighted)'),
  ('Cable Bicep Curl')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.name = v.name);

-- ============================================================
-- 2. DELETE ALL EXISTING PRESET TEMPLATES
--    (ON DELETE CASCADE removes template_days and template_day_exercises)
-- ============================================================

DELETE FROM templates WHERE is_preset = true;

-- ============================================================
-- 3. CREATE ALL 6 TEMPLATES
-- ============================================================

-- ============================================================
-- Template 1: Push / Pull / Legs (PPL)
-- ============================================================
INSERT INTO templates (name, is_preset) VALUES ('Push / Pull / Legs (PPL)', true);

INSERT INTO template_days (template_id, name, sort_order) VALUES
  ((SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)'), 'Push', 0),
  ((SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)'), 'Pull', 1),
  ((SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)'), 'Legs', 2);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
  -- Push
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bench Press' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Overhead Barbell Press (Standing)' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Lateral Raise' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Tricep Rope Pushdown' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Overhead Tricep Cable Extension' LIMIT 1), 5),
  -- Pull
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bent-Over Row' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Weighted Pull-Up' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Face Pull' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bicep Curl' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Hammer Curl' LIMIT 1), 5),
  -- Legs
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Barbell Back Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Walking Dumbbell Lunge' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Leg Curl Machine' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push / Pull / Legs (PPL)')),
   (SELECT id FROM exercises WHERE name = 'Standing Calf Raise' LIMIT 1), 5);

-- ============================================================
-- Template 2: Upper / Lower Split
-- ============================================================
INSERT INTO templates (name, is_preset) VALUES ('Upper / Lower Split', true);

INSERT INTO template_days (template_id, name, sort_order) VALUES
  ((SELECT id FROM templates WHERE name = 'Upper / Lower Split'), 'Upper A', 0),
  ((SELECT id FROM templates WHERE name = 'Upper / Lower Split'), 'Lower A', 1),
  ((SELECT id FROM templates WHERE name = 'Upper / Lower Split'), 'Upper B', 2),
  ((SELECT id FROM templates WHERE name = 'Upper / Lower Split'), 'Lower B', 3);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
  -- Upper A
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bench Press' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bent-Over Row' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Overhead Barbell Press (Standing)' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Lat Pulldown (Wide Grip)' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Lateral Raise' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bicep Curl' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Tricep Rope Pushdown' LIMIT 1), 6),
  -- Lower A
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Back Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Curl Machine' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Extension Machine' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Standing Calf Raise' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Crunch' LIMIT 1), 6),
  -- Upper B
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Weighted Pull-Up' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Dumbbell Shoulder Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Lateral Raise' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Hammer Curl' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Overhead Tricep Cable Extension' LIMIT 1), 6),
  -- Lower B
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Front Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Conventional Barbell Deadlift' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squat (Dumbbell)' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Glute Ham Raise' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Hip Thrust (Barbell)' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Calf Raise' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper / Lower Split')),
   (SELECT id FROM exercises WHERE name = 'Hanging Leg Raise' LIMIT 1), 6);

-- ============================================================
-- Template 3: Bro Split
-- ============================================================
INSERT INTO templates (name, is_preset) VALUES ('Bro Split', true);

INSERT INTO template_days (template_id, name, sort_order) VALUES
  ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Chest', 0),
  ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Back', 1),
  ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Shoulders', 2),
  ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Arms', 3),
  ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Legs', 4);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
  -- Chest
  ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bench Press' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Decline Barbell Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Chest Fly (Low to High)' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Chest Fly (High to Low)' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Pullover' LIMIT 1), 5),
  -- Back
  ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Conventional Barbell Deadlift' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Weighted Pull-Up' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bent-Over Row' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Straight Arm Lat Pulldown' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Single Arm Row' LIMIT 1), 5),
  -- Shoulders
  ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Overhead Barbell Press (Standing)' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Lateral Raise' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Dumbbell Shoulder Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Upright Row' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Face Pull' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Reverse Pec Deck Fly' LIMIT 1), 5),
  -- Arms
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bicep Curl' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Close Grip Barbell Bench Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Incline Curl' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Skull Crusher (EZ Bar)' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Hammer Curl' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Tricep Rope Pushdown' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Overhead Curl' LIMIT 1), 6),
  ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Tricep Dip (Weighted)' LIMIT 1), 7),
  -- Legs
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Back Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Walking Dumbbell Lunge' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Curl Machine' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Extension Machine' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Standing Calf Raise' LIMIT 1), 6),
  ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Calf Raise' LIMIT 1), 7);

-- ============================================================
-- Template 4: Full Body
-- ============================================================
INSERT INTO templates (name, is_preset) VALUES ('Full Body', true);

INSERT INTO template_days (template_id, name, sort_order) VALUES
  ((SELECT id FROM templates WHERE name = 'Full Body'), 'Session A', 0),
  ((SELECT id FROM templates WHERE name = 'Full Body'), 'Session B', 1),
  ((SELECT id FROM templates WHERE name = 'Full Body'), 'Session C', 2);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
  -- Session A
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Barbell Back Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bench Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bent-Over Row' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Overhead Barbell Press (Standing)' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bicep Curl' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Session A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Tricep Rope Pushdown' LIMIT 1), 6),
  -- Session B
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Conventional Barbell Deadlift' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Weighted Pull-Up' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Seated Dumbbell Shoulder Press' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squat (Dumbbell)' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Hammer Curl' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Session B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Overhead Tricep Cable Extension' LIMIT 1), 6),
  -- Session C
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Barbell Front Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Flat Bench Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Lateral Raise' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Hip Thrust (Barbell)' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Cable Bicep Curl' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Session C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body')),
   (SELECT id FROM exercises WHERE name = 'Tricep Dip (Weighted)' LIMIT 1), 6);

-- ============================================================
-- Template 5: PPLUL Hybrid
-- ============================================================
INSERT INTO templates (name, is_preset) VALUES ('PPLUL Hybrid', true);

INSERT INTO template_days (template_id, name, sort_order) VALUES
  ((SELECT id FROM templates WHERE name = 'PPLUL Hybrid'), 'Push', 0),
  ((SELECT id FROM templates WHERE name = 'PPLUL Hybrid'), 'Pull', 1),
  ((SELECT id FROM templates WHERE name = 'PPLUL Hybrid'), 'Legs (Heavy)', 2),
  ((SELECT id FROM templates WHERE name = 'PPLUL Hybrid'), 'Upper (Hypertrophy)', 3),
  ((SELECT id FROM templates WHERE name = 'PPLUL Hybrid'), 'Lower (Hypertrophy)', 4);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
  -- Push
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bench Press' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Overhead Barbell Press (Standing)' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Lateral Raise' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Tricep Rope Pushdown' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Overhead Tricep Cable Extension' LIMIT 1), 5),
  -- Pull
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bent-Over Row' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Weighted Pull-Up' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Face Pull' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bicep Curl' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Hammer Curl' LIMIT 1), 5),
  -- Legs (Heavy)
  ((SELECT id FROM template_days WHERE name = 'Legs (Heavy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Barbell Back Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Legs (Heavy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Legs (Heavy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Legs (Heavy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Leg Curl Machine' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Legs (Heavy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Standing Calf Raise' LIMIT 1), 4),
  -- Upper (Hypertrophy)
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Lat Pulldown (Wide Grip)' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Seated Dumbbell Shoulder Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Single Arm Row' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Cable Lateral Raise' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Cable Bicep Curl' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Upper (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Skull Crusher (EZ Bar)' LIMIT 1), 6),
  -- Lower (Hypertrophy)
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Barbell Front Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squat (Dumbbell)' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Hip Thrust (Barbell)' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Leg Extension Machine' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Leg Curl Machine' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Seated Calf Raise' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Lower (Hypertrophy)' AND template_id = (SELECT id FROM templates WHERE name = 'PPLUL Hybrid')),
   (SELECT id FROM exercises WHERE name = 'Hanging Leg Raise' LIMIT 1), 6);

-- ============================================================
-- Template 6: Anterior / Posterior Split
-- ============================================================
INSERT INTO templates (name, is_preset) VALUES ('Anterior / Posterior Split', true);

INSERT INTO template_days (template_id, name, sort_order) VALUES
  ((SELECT id FROM templates WHERE name = 'Anterior / Posterior Split'), 'Anterior A', 0),
  ((SELECT id FROM templates WHERE name = 'Anterior / Posterior Split'), 'Posterior A', 1),
  ((SELECT id FROM templates WHERE name = 'Anterior / Posterior Split'), 'Anterior B', 2),
  ((SELECT id FROM templates WHERE name = 'Anterior / Posterior Split'), 'Posterior B', 3);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
  -- Anterior A
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Back Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bench Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Overhead Barbell Press (Standing)' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Extension Machine' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Lateral Raise' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Tricep Rope Pushdown' LIMIT 1), 6),
  ((SELECT id FROM template_days WHERE name = 'Anterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Crunch' LIMIT 1), 7),
  -- Posterior A
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Conventional Barbell Deadlift' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bent-Over Row' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Romanian Deadlift' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Weighted Pull-Up' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Curl Machine' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Face Pull' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Bicep Curl' LIMIT 1), 6),
  ((SELECT id FROM template_days WHERE name = 'Posterior A' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Reverse Hyperextension' LIMIT 1), 7),
  -- Anterior B
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Barbell Front Squat' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Incline Barbell Bench Press' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Dumbbell Shoulder Press' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Leg Press' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Chest Fly (Low to High)' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Cable Lateral Raise' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Overhead Tricep Cable Extension' LIMIT 1), 6),
  ((SELECT id FROM template_days WHERE name = 'Anterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Hanging Leg Raise' LIMIT 1), 7),
  -- Posterior B
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Hip Thrust (Barbell)' LIMIT 1), 0),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Seated Cable Row' LIMIT 1), 1),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Glute Ham Raise' LIMIT 1), 2),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Lat Pulldown (Wide Grip)' LIMIT 1), 3),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Single Arm Row' LIMIT 1), 4),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Reverse Pec Deck Fly' LIMIT 1), 5),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Dumbbell Hammer Curl' LIMIT 1), 6),
  ((SELECT id FROM template_days WHERE name = 'Posterior B' AND template_id = (SELECT id FROM templates WHERE name = 'Anterior / Posterior Split')),
   (SELECT id FROM exercises WHERE name = 'Back Extension (Weighted)' LIMIT 1), 7);

COMMIT;
