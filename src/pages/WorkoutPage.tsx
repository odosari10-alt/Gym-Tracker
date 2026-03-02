import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Check, ClipboardList, ChevronRight, Play, Dumbbell } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { startWorkout, finishWorkout, getActiveWorkout, addExerciseToWorkout, removeExerciseFromWorkout, getWorkoutExercises, deleteWorkout, linkSuperset, unlinkSuperset } from '../db/queries/workouts'
import { getSetsForWorkoutExercise, addSet, updateSet, deleteSet } from '../db/queries/sets'
import { getExercises, getMuscleGroups } from '../db/queries/exercises'
import { getTemplatesWithDays, addTemplateDayToWorkout } from '../db/queries/templates'
import { ExercisePicker } from '../components/workout/ExercisePicker'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { WorkoutTimer } from '../components/workout/WorkoutTimer'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Spinner } from '../components/ui/Spinner'
import type { Set, WorkoutExercise, Exercise, MuscleGroup, TemplateWithDays } from '../types'

export function WorkoutPage() {
  const { unit } = useDatabase()
  const navigate = useNavigate()
  const [workoutId, setWorkoutId] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<string>('')
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [setsMap, setSetsMap] = useState<Record<number, Set[]>>({})
  const [showPicker, setShowPicker] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null)
  const [showFinish, setShowFinish] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [supersetPickerFor, setSupersetPickerFor] = useState<number | null>(null)
  const [allExercises, setAllExercises] = useState<Exercise[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [templates, setTemplates] = useState<TemplateWithDays[]>([])

  useEffect(() => {
    getExercises().then(setAllExercises)
    getMuscleGroups().then(setMuscleGroups)
  }, [])

  useEffect(() => {
    if (showTemplatePicker) {
      getTemplatesWithDays().then(setTemplates)
    }
  }, [showTemplatePicker])

  useEffect(() => {
    ;(async () => {
      const active = await getActiveWorkout()
      if (active) {
        setWorkoutId(active.id)
        setStartedAt(active.started_at)
      } else {
        const id = await startWorkout()
        setWorkoutId(id)
        setStartedAt(new Date().toISOString())
      }
    })()
  }, [])

  useEffect(() => {
    if (!workoutId) return
    ;(async () => {
      const exs = await getWorkoutExercises(workoutId)
      setExercises(exs)
      const map: Record<number, Set[]> = {}
      for (const ex of exs) {
        map[ex.id] = await getSetsForWorkoutExercise(ex.id)
      }
      setSetsMap(map)
    })()
  }, [workoutId, refresh])

  const reload = () => setRefresh((r) => r + 1)

  const handleAddExercise = useCallback(async (ex: { id: number }) => {
    if (!workoutId) return
    await addExerciseToWorkout(workoutId, ex.id)
    reload()
  }, [workoutId])

  const handleRemoveExercise = useCallback(async (weId: number) => {
    await removeExerciseFromWorkout(weId)
    reload()
  }, [])

  const handleAddSet = useCallback(async (weId: number) => {
    const prevSets = await getSetsForWorkoutExercise(weId)
    const lastSet = prevSets[prevSets.length - 1]
    await addSet(weId, lastSet?.weight_kg ?? 0, lastSet?.reps ?? 0)
    reload()
  }, [])

  const handleUpdateSet = useCallback(async (setId: number, weightKg: number, reps: number, isWarmup: boolean, rpe: number | null) => {
    await updateSet(setId, weightKg, reps, isWarmup, rpe)
    reload()
  }, [])

  const handleDeleteSet = useCallback(async (setId: number) => {
    await deleteSet(setId)
    reload()
  }, [])

  const handleAddTemplateDay = useCallback(async (dayId: number) => {
    if (!workoutId) return
    await addTemplateDayToWorkout(workoutId, dayId)
    setShowTemplatePicker(false)
    setExpandedTemplate(null)
    reload()
  }, [workoutId])

  const handleFinish = useCallback(async () => {
    if (!workoutId) return
    await finishWorkout(workoutId)
    navigate('/')
  }, [workoutId, navigate])

  const handleDiscard = useCallback(async () => {
    if (!workoutId) return
    await deleteWorkout(workoutId)
    navigate('/')
  }, [workoutId, navigate])

  const handleSupersetSelect = useCallback(async (weId: number) => {
    if (supersetPickerFor == null) return
    await linkSuperset(supersetPickerFor, weId)
    setSupersetPickerFor(null)
    reload()
  }, [supersetPickerFor])

  const supersetCandidates = useMemo(() => {
    if (supersetPickerFor == null) return []
    return exercises.filter((e) => e.id !== supersetPickerFor && e.superset_group == null)
  }, [exercises, supersetPickerFor])

  const handleUnlinkSuperset = useCallback(async (supersetGroup: number) => {
    await unlinkSuperset(supersetGroup)
    reload()
  }, [])

  const SUPERSET_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

  const supersetColorMap = useMemo(() => {
    const map = new Map<number, string>()
    let colorIdx = 0
    for (const ex of exercises) {
      if (ex.superset_group != null && !map.has(ex.superset_group)) {
        map.set(ex.superset_group, SUPERSET_COLORS[colorIdx % SUPERSET_COLORS.length])
        colorIdx++
      }
    }
    return map
  }, [exercises])

  // Group exercises: superset pairs are grouped together
  const groupedExercises = useMemo(() => {
    const groups: { supersetGroup: number | null; items: WorkoutExercise[] }[] = []
    const seen = new Set<number>()
    for (const ex of exercises) {
      if (seen.has(ex.id)) continue
      if (ex.superset_group != null) {
        const partners = exercises.filter((e) => e.superset_group === ex.superset_group)
        partners.forEach((p) => seen.add(p.id))
        groups.push({ supersetGroup: ex.superset_group, items: partners })
      } else {
        seen.add(ex.id)
        groups.push({ supersetGroup: null, items: [ex] })
      }
    }
    return groups
  }, [exercises])

  const presets = templates.filter((t) => t.is_preset)
  const custom = templates.filter((t) => !t.is_preset)

  if (!workoutId) return <Spinner />

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
              onClick={() => setShowDiscard(true)}
              className="w-full text-center text-base font-semibold text-danger py-4 rounded-2xl hover:bg-danger/10 transition-colors"
            >
              Discard Workout
            </button>
          </div>

          {groupedExercises.map((group) => {
            const color = group.supersetGroup != null
              ? supersetColorMap.get(group.supersetGroup)
              : undefined

            if (group.supersetGroup != null) {
              return (
                <div
                  key={`ss-${group.supersetGroup}`}
                  className="flex flex-col gap-2 rounded-2xl p-2 border-l-4"
                  style={{ borderLeftColor: color }}
                >
                  {group.items.map((we) => (
                    <ExerciseCard
                      key={we.id}
                      workoutExercise={we}
                      sets={setsMap[we.id] ?? []}
                      unit={unit}
                      supersetColor={color}
                      onAddSet={handleAddSet}
                      onUpdateSet={handleUpdateSet}
                      onDeleteSet={handleDeleteSet}
                      onRemoveExercise={handleRemoveExercise}
                      onUnlinkSuperset={handleUnlinkSuperset}
                    />
                  ))}
                </div>
              )
            }

            const we = group.items[0]
            return (
              <ExerciseCard
                key={we.id}
                workoutExercise={we}
                sets={setsMap[we.id] ?? []}
                unit={unit}
                onAddSet={handleAddSet}
                onUpdateSet={handleUpdateSet}
                onDeleteSet={handleDeleteSet}
                onRemoveExercise={handleRemoveExercise}
                onSuperset={setSupersetPickerFor}
              />
            )
          })}

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
        open={supersetPickerFor != null}
        onClose={() => setSupersetPickerFor(null)}
        title="Link Superset"
      >
        <div className="flex flex-col gap-1">
          {supersetCandidates.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">No other exercises to link</p>
          )}
          {supersetCandidates.map((we) => (
            <button
              key={we.id}
              onClick={() => handleSupersetSelect(we.id)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-hover active:bg-surface transition-colors text-left w-full"
            >
              <Dumbbell className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{we.exercise_name}</p>
                <p className="text-xs text-text-muted">{we.muscle_group_name}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>

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

      <ConfirmDialog
        open={showDiscard}
        onClose={() => setShowDiscard(false)}
        onConfirm={handleDiscard}
        title="Discard Workout"
        message="Are you sure you want to discard workout?"
        confirmLabel="Yes"
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
