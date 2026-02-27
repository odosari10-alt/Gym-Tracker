import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Check, ClipboardList, ChevronRight, Play, Dumbbell } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { startWorkout, finishWorkout, getActiveWorkout, addExerciseToWorkout, removeExerciseFromWorkout, getWorkoutExercises, deleteWorkout } from '../db/queries/workouts'
import { getSetsForWorkoutExercise, addSet, updateSet, deleteSet } from '../db/queries/sets'
import { getExercises, getMuscleGroups } from '../db/queries/exercises'
import { getTemplatesWithDays, addTemplateDayToWorkout } from '../db/queries/templates'
import { ExercisePicker } from '../components/workout/ExercisePicker'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { WorkoutTimer } from '../components/workout/WorkoutTimer'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import type { Set, WorkoutExercise, TemplateWithDays } from '../types'

export function WorkoutPage() {
  const { db, unit, save } = useDatabase()
  const navigate = useNavigate()
  const [workoutId, setWorkoutId] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<string>('')
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [setsMap, setSetsMap] = useState<Record<number, Set[]>>({})
  const [showPicker, setShowPicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null)
  const [showFinish, setShowFinish] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const allExercises = useMemo(() => db ? getExercises(db) : [], [db])
  const muscleGroups = useMemo(() => db ? getMuscleGroups(db) : [], [db])
  const templates = useMemo(() => {
    if (!db || !showTemplatePicker) return []
    return getTemplatesWithDays(db)
  }, [db, showTemplatePicker])

  useEffect(() => {
    if (!db) return
    const active = getActiveWorkout(db)
    if (active) {
      setWorkoutId(active.id)
      setStartedAt(active.started_at)
    } else {
      const id = startWorkout(db)
      setWorkoutId(id)
      setStartedAt(new Date().toISOString())
    }
  }, [db])

  useEffect(() => {
    if (!db || !workoutId) return
    const exs = getWorkoutExercises(db, workoutId)
    setExercises(exs)
    const map: Record<number, Set[]> = {}
    for (const ex of exs) {
      map[ex.id] = getSetsForWorkoutExercise(db, ex.id)
    }
    setSetsMap(map)
  }, [db, workoutId, refresh])

  const reload = () => setRefresh((r) => r + 1)

  const handleAddExercise = useCallback((ex: { id: number }) => {
    if (!db || !workoutId) return
    addExerciseToWorkout(db, workoutId, ex.id)
    reload()
  }, [db, workoutId])

  const handleRemoveExercise = useCallback((weId: number) => {
    if (!db) return
    removeExerciseFromWorkout(db, weId)
    reload()
  }, [db])

  const handleAddSet = useCallback((weId: number) => {
    if (!db) return
    const prevSets = getSetsForWorkoutExercise(db, weId)
    const lastSet = prevSets[prevSets.length - 1]
    addSet(db, weId, lastSet?.weight_kg ?? 0, lastSet?.reps ?? 0)
    reload()
  }, [db])

  const handleUpdateSet = useCallback((setId: number, weightKg: number, reps: number, isWarmup: boolean, rpe: number | null) => {
    if (!db) return
    updateSet(db, setId, weightKg, reps, isWarmup, rpe)
    reload()
  }, [db])

  const handleDeleteSet = useCallback((setId: number) => {
    if (!db) return
    deleteSet(db, setId)
    reload()
  }, [db])

  const handleAddTemplateDay = useCallback((dayId: number) => {
    if (!db || !workoutId) return
    addTemplateDayToWorkout(db, workoutId, dayId)
    setShowTemplatePicker(false)
    setExpandedTemplate(null)
    reload()
  }, [db, workoutId])

  const handleFinish = useCallback(async () => {
    if (!db || !workoutId) return
    finishWorkout(db, workoutId)
    await save()
    navigate('/')
  }, [db, workoutId, save, navigate])

  const handleDiscard = useCallback(async () => {
    if (!db || !workoutId) return
    deleteWorkout(db, workoutId)
    await save()
    navigate('/')
  }, [db, workoutId, save, navigate])

  const presets = templates.filter((t) => t.is_preset)
  const custom = templates.filter((t) => !t.is_preset)

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border shrink-0" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-surface active:bg-surface-hover text-text-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-text-primary tracking-tight">Workout</h1>
            {startedAt && <WorkoutTimer startedAt={startedAt} />}
          </div>
        </div>
        <Button size="sm" onClick={() => setShowFinish(true)} disabled={exercises.length === 0}>
          <Check className="h-4 w-4" /> Finish
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-4" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
        <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
          {exercises.map((we) => (
            <ExerciseCard
              key={we.id}
              workoutExercise={we}
              sets={setsMap[we.id] ?? []}
              unit={unit}
              onAddSet={handleAddSet}
              onUpdateSet={handleUpdateSet}
              onDeleteSet={handleDeleteSet}
              onRemoveExercise={handleRemoveExercise}
            />
          ))}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowPicker(true)}
              className="w-full py-4 text-center text-base font-semibold text-primary bg-surface rounded-2xl hover:bg-surface-hover active:bg-surface transition-colors"
            >
              + Add Exercise
            </button>
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="w-full py-4 text-center text-base font-semibold text-primary bg-surface rounded-2xl hover:bg-surface-hover active:bg-surface transition-colors flex items-center justify-center gap-1.5"
            >
              <ClipboardList className="h-5 w-5" /> Template
            </button>
            <button
              onClick={handleDiscard}
              className="w-full text-center text-base font-semibold text-danger py-4 rounded-2xl hover:bg-danger/10 transition-colors"
            >
              Discard Workout
            </button>
          </div>
        </div>
      </main>

      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
        exercises={allExercises}
        muscleGroups={muscleGroups}
      />

      <Modal
        open={showTemplatePicker}
        onClose={() => { setShowTemplatePicker(false); setExpandedTemplate(null) }}
        title="Add from Template"
      >
        <div className="flex flex-col gap-3">
          {custom.length > 0 && (
            <TemplatePickerSection
              title="My Templates"
              templates={custom}
              expandedTemplate={expandedTemplate}
              onToggle={setExpandedTemplate}
              onSelectDay={handleAddTemplateDay}
            />
          )}
          {presets.length > 0 && (
            <TemplatePickerSection
              title="Preset Schedules"
              templates={presets}
              expandedTemplate={expandedTemplate}
              onToggle={setExpandedTemplate}
              onSelectDay={handleAddTemplateDay}
            />
          )}
          {templates.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">No templates available</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={showFinish}
        onClose={() => setShowFinish(false)}
        onConfirm={handleFinish}
        title="Finish Workout"
        message="Save this workout and return to the home screen?"
        confirmLabel="Finish"
        variant="primary"
      />
    </div>
  )
}

function TemplatePickerSection({
  title,
  templates,
  expandedTemplate,
  onToggle,
  onSelectDay,
}: {
  title: string
  templates: TemplateWithDays[]
  expandedTemplate: number | null
  onToggle: (id: number | null) => void
  onSelectDay: (dayId: number) => void
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">{title}</p>
      <div className="flex flex-col gap-2">
        {templates.map((t) => {
          const isExpanded = expandedTemplate === t.id
          return (
            <div key={t.id} className="rounded-2xl bg-surface overflow-hidden">
              <button
                onClick={() => onToggle(isExpanded ? null : t.id)}
                className="flex items-center gap-3 p-3.5 w-full text-left hover:bg-surface-hover transition-colors"
              >
                <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.days.length} days</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
              {isExpanded && (
                <div className="border-t border-border">
                  {t.days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => onSelectDay(day.id)}
                      className="flex items-center gap-3 px-4 py-3.5 w-full text-left hover:bg-surface-hover transition-colors border-b border-border last:border-b-0"
                    >
                      <Play className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-text-primary font-medium flex-1">{day.name}</span>
                      <span className="text-xs text-primary font-semibold">Add</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
