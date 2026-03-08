-- ============================================================
-- Add Cardio muscle group and cardio exercises
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add Cardio muscle group
INSERT INTO muscle_groups (name) VALUES ('Cardio')
ON CONFLICT (name) DO NOTHING;

-- Cardio exercises (only ones with animated GIFs)
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Treadmill Running',    (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Incline Walking',      (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Sprint Intervals',     (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Stationary Bike',      (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Air Bike',             (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Jump Rope',            (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Jumping Jacks',        (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Jump Squats',          (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Broad Jumps',          (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Burpees',              (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Mountain Climbers',    (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Elliptical',           (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Battle Ropes',         (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Tire Flips',           (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Farmer''s Carry',      (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false),
    ('Kettlebell Swings',    (SELECT id FROM muscle_groups WHERE name = 'Cardio'), false);
