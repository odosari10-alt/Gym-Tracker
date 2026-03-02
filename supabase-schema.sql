-- ============================================================
-- Gym Tracker: Supabase PostgreSQL Schema
-- Migration from sql.js to Supabase
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE muscle_groups (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE exercises (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            TEXT NOT NULL,
    muscle_group_id BIGINT NOT NULL REFERENCES muscle_groups (id),
    is_custom       BOOLEAN NOT NULL DEFAULT FALSE,
    user_id         UUID REFERENCES auth.users (id) ON DELETE CASCADE
);

CREATE TABLE workouts (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    notes       TEXT
);

CREATE TABLE workout_exercises (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_id     BIGINT NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
    exercise_id    BIGINT NOT NULL REFERENCES exercises (id),
    sort_order     INTEGER NOT NULL DEFAULT 0,
    notes          TEXT,
    superset_group BIGINT
);

CREATE TABLE sets (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_exercise_id BIGINT NOT NULL REFERENCES workout_exercises (id) ON DELETE CASCADE,
    set_number          INTEGER NOT NULL,
    weight_kg           REAL NOT NULL DEFAULT 0,
    reps                INTEGER NOT NULL DEFAULT 0,
    is_warmup           BOOLEAN NOT NULL DEFAULT FALSE,
    rpe                 REAL
);

CREATE TABLE templates (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id   UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    name      TEXT NOT NULL,
    is_preset BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE template_days (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES templates (id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE template_day_exercises (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    template_day_id BIGINT NOT NULL REFERENCES template_days (id) ON DELETE CASCADE,
    exercise_id     BIGINT NOT NULL REFERENCES exercises (id),
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX idx_exercises_user ON exercises (user_id);
CREATE INDEX idx_workouts_user  ON workouts (user_id);
CREATE INDEX idx_we_workout     ON workout_exercises (workout_id);
CREATE INDEX idx_sets_we        ON sets (workout_exercise_id);
CREATE INDEX idx_templates_user ON templates (user_id);
CREATE INDEX idx_td_template    ON template_days (template_id);
CREATE INDEX idx_tde_day        ON template_day_exercises (template_day_id);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- muscle_groups -----------------------------------------------
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "muscle_groups: anyone can read"
    ON muscle_groups FOR SELECT
    USING (true);

-- exercises ---------------------------------------------------
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises: read presets and own custom"
    ON exercises FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "exercises: insert own custom"
    ON exercises FOR INSERT
    WITH CHECK (user_id = auth.uid() AND is_custom = true);

CREATE POLICY "exercises: delete own custom"
    ON exercises FOR DELETE
    USING (user_id = auth.uid() AND is_custom = true);

-- workouts ----------------------------------------------------
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts: full access own rows"
    ON workouts FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- workout_exercises -------------------------------------------
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_exercises: full access via workout owner"
    ON workout_exercises FOR ALL
    USING (
        workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
    )
    WITH CHECK (
        workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
    );

-- sets --------------------------------------------------------
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sets: full access via workout owner"
    ON sets FOR ALL
    USING (
        workout_exercise_id IN (
            SELECT we.id
            FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
            WHERE w.user_id = auth.uid()
        )
    )
    WITH CHECK (
        workout_exercise_id IN (
            SELECT we.id
            FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
            WHERE w.user_id = auth.uid()
        )
    );

-- templates ---------------------------------------------------
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates: read own + presets"
    ON templates FOR SELECT
    USING (user_id = auth.uid() OR is_preset = true);

CREATE POLICY "templates: insert own"
    ON templates FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "templates: update own"
    ON templates FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "templates: delete own"
    ON templates FOR DELETE
    USING (user_id = auth.uid());

-- template_days -----------------------------------------------
ALTER TABLE template_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_days: read own + presets"
    ON template_days FOR SELECT
    USING (
        template_id IN (SELECT id FROM templates WHERE user_id = auth.uid() OR is_preset = true)
    );

CREATE POLICY "template_days: insert own"
    ON template_days FOR INSERT
    WITH CHECK (
        template_id IN (SELECT id FROM templates WHERE user_id = auth.uid())
    );

CREATE POLICY "template_days: update own"
    ON template_days FOR UPDATE
    USING (
        template_id IN (SELECT id FROM templates WHERE user_id = auth.uid())
    );

CREATE POLICY "template_days: delete own"
    ON template_days FOR DELETE
    USING (
        template_id IN (SELECT id FROM templates WHERE user_id = auth.uid())
    );

-- template_day_exercises --------------------------------------
ALTER TABLE template_day_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_day_exercises: read own + presets"
    ON template_day_exercises FOR SELECT
    USING (
        template_day_id IN (
            SELECT td.id
            FROM template_days td
            JOIN templates t ON t.id = td.template_id
            WHERE t.user_id = auth.uid() OR t.is_preset = true
        )
    );

CREATE POLICY "template_day_exercises: insert own"
    ON template_day_exercises FOR INSERT
    WITH CHECK (
        template_day_id IN (
            SELECT td.id
            FROM template_days td
            JOIN templates t ON t.id = td.template_id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "template_day_exercises: update own"
    ON template_day_exercises FOR UPDATE
    USING (
        template_day_id IN (
            SELECT td.id
            FROM template_days td
            JOIN templates t ON t.id = td.template_id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "template_day_exercises: delete own"
    ON template_day_exercises FOR DELETE
    USING (
        template_day_id IN (
            SELECT td.id
            FROM template_days td
            JOIN templates t ON t.id = td.template_id
            WHERE t.user_id = auth.uid()
        )
    );

-- ============================================================
-- 3. SEED DATA
-- ============================================================

-- Muscle groups -----------------------------------------------
INSERT INTO muscle_groups (name) VALUES
    ('Chest'),
    ('Back'),
    ('Legs'),
    ('Shoulders'),
    ('Arms'),
    ('Core');

-- Exercises: Chest --------------------------------------------
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Barbell Bench Press',         (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Incline Barbell Bench Press', (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Decline Barbell Bench Press', (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Dumbbell Bench Press',        (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Incline Dumbbell Bench Press',(SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Dumbbell Fly',                (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Incline Dumbbell Fly',        (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Cable Fly',                   (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Machine Chest Press',         (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Pec Deck Machine',            (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Push-Up',                     (SELECT id FROM muscle_groups WHERE name = 'Chest'), false),
    ('Dips (Chest)',                (SELECT id FROM muscle_groups WHERE name = 'Chest'), false);

-- Exercises: Back ---------------------------------------------
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Barbell Row',            (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Dumbbell Row',           (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Pendlay Row',            (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Seated Cable Row',       (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('T-Bar Row',              (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Pull-Up',                (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Chin-Up',                (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Lat Pulldown',           (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Straight-Arm Pulldown',  (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Face Pull',              (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Deadlift',               (SELECT id FROM muscle_groups WHERE name = 'Back'), false),
    ('Rack Pull',              (SELECT id FROM muscle_groups WHERE name = 'Back'), false);

-- Exercises: Legs ---------------------------------------------
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Barbell Squat',        (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Front Squat',          (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Leg Press',            (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Hack Squat',           (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Bulgarian Split Squat',(SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Lunges',               (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Romanian Deadlift',    (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Leg Curl',             (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Leg Extension',        (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Calf Raise',           (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Seated Calf Raise',    (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Hip Thrust',           (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Goblet Squat',         (SELECT id FROM muscle_groups WHERE name = 'Legs'), false),
    ('Sumo Deadlift',        (SELECT id FROM muscle_groups WHERE name = 'Legs'), false);

-- Exercises: Shoulders ----------------------------------------
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Overhead Press',         (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Dumbbell Shoulder Press',(SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Arnold Press',           (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Lateral Raise',          (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Front Raise',            (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Reverse Fly',            (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Cable Lateral Raise',    (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Upright Row',            (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Shrugs',                 (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Barbell Shrugs',         (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false),
    ('Machine Shoulder Press',  (SELECT id FROM muscle_groups WHERE name = 'Shoulders'), false);

-- Exercises: Arms ---------------------------------------------
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Barbell Curl',                (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Dumbbell Curl',               (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Hammer Curl',                 (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Preacher Curl',               (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Concentration Curl',          (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Cable Curl',                  (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Tricep Pushdown',             (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Overhead Tricep Extension',   (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Skull Crusher',               (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Close-Grip Bench Press',      (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Dips (Triceps)',              (SELECT id FROM muscle_groups WHERE name = 'Arms'), false),
    ('Kickbacks',                   (SELECT id FROM muscle_groups WHERE name = 'Arms'), false);

-- Exercises: Core ---------------------------------------------
INSERT INTO exercises (name, muscle_group_id, is_custom) VALUES
    ('Plank',              (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Crunch',             (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Hanging Leg Raise',  (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Cable Crunch',       (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Ab Wheel Rollout',   (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Russian Twist',      (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Woodchop',           (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Dead Bug',           (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Side Plank',         (SELECT id FROM muscle_groups WHERE name = 'Core'), false),
    ('Decline Sit-Up',     (SELECT id FROM muscle_groups WHERE name = 'Core'), false);

-- Preset templates -----------------------------------------------

-- Push Pull Legs
INSERT INTO templates (name, is_preset) VALUES ('Push Pull Legs', true);
INSERT INTO template_days (template_id, name, sort_order) VALUES
    ((SELECT id FROM templates WHERE name = 'Push Pull Legs'), 'Push', 0),
    ((SELECT id FROM templates WHERE name = 'Push Pull Legs'), 'Pull', 1),
    ((SELECT id FROM templates WHERE name = 'Push Pull Legs'), 'Legs', 2);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
    ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 0),
    ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Overhead Press'), 1),
    ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Bench Press'), 2),
    ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Lateral Raise'), 3),
    ((SELECT id FROM template_days WHERE name = 'Push' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Tricep Pushdown'), 4),
    ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Barbell Row'), 0),
    ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Pull-Up'), 1),
    ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Seated Cable Row'), 2),
    ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Face Pull'), 3),
    ((SELECT id FROM template_days WHERE name = 'Pull' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Barbell Curl'), 4),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Barbell Squat'), 0),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Romanian Deadlift'), 1),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Leg Press'), 2),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Leg Curl'), 3),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Push Pull Legs')),
     (SELECT id FROM exercises WHERE name = 'Calf Raise'), 4);

-- Upper Lower
INSERT INTO templates (name, is_preset) VALUES ('Upper Lower', true);
INSERT INTO template_days (template_id, name, sort_order) VALUES
    ((SELECT id FROM templates WHERE name = 'Upper Lower'), 'Upper A', 0),
    ((SELECT id FROM templates WHERE name = 'Upper Lower'), 'Lower A', 1),
    ((SELECT id FROM templates WHERE name = 'Upper Lower'), 'Upper B', 2),
    ((SELECT id FROM templates WHERE name = 'Upper Lower'), 'Lower B', 3);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
    ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 0),
    ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Barbell Row'), 1),
    ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Overhead Press'), 2),
    ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Lat Pulldown'), 3),
    ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Dumbbell Curl'), 4),
    ((SELECT id FROM template_days WHERE name = 'Upper A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Tricep Pushdown'), 5),
    ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Barbell Squat'), 0),
    ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Romanian Deadlift'), 1),
    ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Leg Press'), 2),
    ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Leg Curl'), 3),
    ((SELECT id FROM template_days WHERE name = 'Lower A' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Calf Raise'), 4),
    ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Dumbbell Bench Press'), 0),
    ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Dumbbell Row'), 1),
    ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Dumbbell Shoulder Press'), 2),
    ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Cable Fly'), 3),
    ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Hammer Curl'), 4),
    ((SELECT id FROM template_days WHERE name = 'Upper B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Overhead Tricep Extension'), 5),
    ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Deadlift'), 0),
    ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Front Squat'), 1),
    ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Bulgarian Split Squat'), 2),
    ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Leg Extension'), 3),
    ((SELECT id FROM template_days WHERE name = 'Lower B' AND template_id = (SELECT id FROM templates WHERE name = 'Upper Lower')),
     (SELECT id FROM exercises WHERE name = 'Hip Thrust'), 4);

-- Full Body
INSERT INTO templates (name, is_preset) VALUES ('Full Body 3x', true);
INSERT INTO template_days (template_id, name, sort_order) VALUES
    ((SELECT id FROM templates WHERE name = 'Full Body 3x'), 'Day A', 0),
    ((SELECT id FROM templates WHERE name = 'Full Body 3x'), 'Day B', 1),
    ((SELECT id FROM templates WHERE name = 'Full Body 3x'), 'Day C', 2);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
    ((SELECT id FROM template_days WHERE name = 'Day A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Barbell Squat'), 0),
    ((SELECT id FROM template_days WHERE name = 'Day A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 1),
    ((SELECT id FROM template_days WHERE name = 'Day A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Barbell Row'), 2),
    ((SELECT id FROM template_days WHERE name = 'Day A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Lateral Raise'), 3),
    ((SELECT id FROM template_days WHERE name = 'Day A' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Barbell Curl'), 4),
    ((SELECT id FROM template_days WHERE name = 'Day B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Deadlift'), 0),
    ((SELECT id FROM template_days WHERE name = 'Day B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Overhead Press'), 1),
    ((SELECT id FROM template_days WHERE name = 'Day B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Pull-Up'), 2),
    ((SELECT id FROM template_days WHERE name = 'Day B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Dumbbell Fly'), 3),
    ((SELECT id FROM template_days WHERE name = 'Day B' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Tricep Pushdown'), 4),
    ((SELECT id FROM template_days WHERE name = 'Day C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Front Squat'), 0),
    ((SELECT id FROM template_days WHERE name = 'Day C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Bench Press'), 1),
    ((SELECT id FROM template_days WHERE name = 'Day C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Seated Cable Row'), 2),
    ((SELECT id FROM template_days WHERE name = 'Day C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Romanian Deadlift'), 3),
    ((SELECT id FROM template_days WHERE name = 'Day C' AND template_id = (SELECT id FROM templates WHERE name = 'Full Body 3x')),
     (SELECT id FROM exercises WHERE name = 'Face Pull'), 4);

-- Bro Split
INSERT INTO templates (name, is_preset) VALUES ('Bro Split', true);
INSERT INTO template_days (template_id, name, sort_order) VALUES
    ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Chest', 0),
    ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Back', 1),
    ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Shoulders', 2),
    ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Legs', 3),
    ((SELECT id FROM templates WHERE name = 'Bro Split'), 'Arms', 4);

INSERT INTO template_day_exercises (template_day_id, exercise_id, sort_order) VALUES
    ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 0),
    ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Bench Press'), 1),
    ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Cable Fly'), 2),
    ((SELECT id FROM template_days WHERE name = 'Chest' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Dips (Chest)'), 3),
    ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Deadlift'), 0),
    ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Barbell Row'), 1),
    ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Lat Pulldown'), 2),
    ((SELECT id FROM template_days WHERE name = 'Back' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Seated Cable Row'), 3),
    ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Overhead Press'), 0),
    ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Lateral Raise'), 1),
    ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Reverse Fly'), 2),
    ((SELECT id FROM template_days WHERE name = 'Shoulders' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Shrugs'), 3),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Barbell Squat'), 0),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Leg Press'), 1),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Leg Curl'), 2),
    ((SELECT id FROM template_days WHERE name = 'Legs' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Calf Raise'), 3),
    ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Barbell Curl'), 0),
    ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Hammer Curl'), 1),
    ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Tricep Pushdown'), 2),
    ((SELECT id FROM template_days WHERE name = 'Arms' AND template_id = (SELECT id FROM templates WHERE name = 'Bro Split')),
     (SELECT id FROM exercises WHERE name = 'Skull Crusher'), 3);

-- ============================================================
-- 4. RPC FUNCTIONS
-- ============================================================

-- get_workout_summaries ---------------------------------------
CREATE OR REPLACE FUNCTION get_workout_summaries(p_limit INTEGER DEFAULT NULL)
RETURNS TABLE (
    id               BIGINT,
    started_at       TIMESTAMPTZ,
    finished_at      TIMESTAMPTZ,
    notes            TEXT,
    exercise_count   BIGINT,
    total_sets       BIGINT,
    total_volume     REAL,
    duration_minutes REAL
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        w.id,
        w.started_at,
        w.finished_at,
        w.notes,
        COUNT(DISTINCT we.id)                                       AS exercise_count,
        COUNT(s.id)                                                 AS total_sets,
        COALESCE(SUM(s.weight_kg * s.reps) FILTER (WHERE s.is_warmup = false), 0)::REAL
                                                                    AS total_volume,
        (EXTRACT(EPOCH FROM w.finished_at - w.started_at) / 60.0)::REAL
                                                                    AS duration_minutes
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN sets s               ON s.workout_exercise_id = we.id
    WHERE w.user_id = auth.uid()
      AND w.finished_at IS NOT NULL
    GROUP BY w.id, w.started_at, w.finished_at, w.notes
    ORDER BY w.started_at DESC
    LIMIT p_limit;
$$;

-- get_exercise_progress ---------------------------------------
CREATE OR REPLACE FUNCTION get_exercise_progress(p_exercise_id BIGINT)
RETURNS TABLE (
    date         TEXT,
    best_weight  REAL,
    best_e1rm    REAL,
    total_volume REAL,
    total_sets   BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        DATE(w.started_at)::TEXT                                    AS date,
        MAX(s.weight_kg)                                            AS best_weight,
        MAX(s.weight_kg * (1.0 + s.reps / 30.0))::REAL             AS best_e1rm,
        COALESCE(SUM(s.weight_kg * s.reps), 0)::REAL               AS total_volume,
        COUNT(s.id)                                                 AS total_sets
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w           ON w.id  = we.workout_id
    WHERE we.exercise_id = p_exercise_id
      AND w.user_id      = auth.uid()
      AND s.is_warmup    = false
      AND s.reps         > 0
      AND w.finished_at  IS NOT NULL
    GROUP BY DATE(w.started_at)
    ORDER BY DATE(w.started_at);
$$;

-- get_personal_records ----------------------------------------
CREATE OR REPLACE FUNCTION get_personal_records(p_limit INTEGER DEFAULT NULL)
RETURNS TABLE (
    exercise_id   BIGINT,
    exercise_name TEXT,
    weight_kg     REAL,
    reps          INTEGER,
    e1rm          REAL,
    date          TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        exercise_id,
        exercise_name,
        weight_kg,
        reps,
        e1rm,
        date
    FROM (
        SELECT
            e.id                                                    AS exercise_id,
            e.name                                                  AS exercise_name,
            s.weight_kg,
            s.reps,
            (s.weight_kg * (1.0 + s.reps / 30.0))::REAL            AS e1rm,
            DATE(w.started_at)::TEXT                                AS date,
            ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY (s.weight_kg * (1.0 + s.reps / 30.0)) DESC)
                                                                    AS rn
        FROM sets s
        JOIN workout_exercises we ON we.id = s.workout_exercise_id
        JOIN workouts w           ON w.id  = we.workout_id
        JOIN exercises e          ON e.id  = we.exercise_id
        WHERE w.user_id   = auth.uid()
          AND s.is_warmup = false
          AND s.reps      > 0
          AND w.finished_at IS NOT NULL
    ) sub
    WHERE rn = 1
    ORDER BY e1rm DESC
    LIMIT p_limit;
$$;

-- get_exercise_pr ---------------------------------------------
CREATE OR REPLACE FUNCTION get_exercise_pr(p_exercise_id BIGINT)
RETURNS TABLE (
    exercise_id   BIGINT,
    exercise_name TEXT,
    weight_kg     REAL,
    reps          INTEGER,
    e1rm          REAL,
    date          TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        exercise_id,
        exercise_name,
        weight_kg,
        reps,
        e1rm,
        date
    FROM (
        SELECT
            e.id                                                    AS exercise_id,
            e.name                                                  AS exercise_name,
            s.weight_kg,
            s.reps,
            (s.weight_kg * (1.0 + s.reps / 30.0))::REAL            AS e1rm,
            DATE(w.started_at)::TEXT                                AS date,
            ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY (s.weight_kg * (1.0 + s.reps / 30.0)) DESC)
                                                                    AS rn
        FROM sets s
        JOIN workout_exercises we ON we.id = s.workout_exercise_id
        JOIN workouts w           ON w.id  = we.workout_id
        JOIN exercises e          ON e.id  = we.exercise_id
        WHERE we.exercise_id = p_exercise_id
          AND w.user_id      = auth.uid()
          AND s.is_warmup    = false
          AND s.reps         > 0
          AND w.finished_at  IS NOT NULL
    ) sub
    WHERE rn = 1
    ORDER BY e1rm DESC
    LIMIT 1;
$$;

-- get_weekly_summaries ----------------------------------------
CREATE OR REPLACE FUNCTION get_weekly_summaries(p_weeks INTEGER DEFAULT 12)
RETURNS TABLE (
    week_start    TEXT,
    workout_count BIGINT,
    total_volume  REAL,
    total_sets    BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        DATE_TRUNC('week', w.started_at)::TEXT                      AS week_start,
        COUNT(DISTINCT w.id)                                        AS workout_count,
        COALESCE(SUM(s.weight_kg * s.reps) FILTER (WHERE s.is_warmup = false), 0)::REAL
                                                                    AS total_volume,
        COUNT(s.id)                                                 AS total_sets
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN sets s               ON s.workout_exercise_id = we.id
    WHERE w.user_id     = auth.uid()
      AND w.finished_at IS NOT NULL
      AND w.started_at >= DATE_TRUNC('week', NOW()) - (p_weeks * INTERVAL '1 week')
    GROUP BY DATE_TRUNC('week', w.started_at)
    ORDER BY DATE_TRUNC('week', w.started_at);
$$;
