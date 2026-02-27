import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Plus, Trash2, Play, GripVertical } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getTemplateById, addTemplateDay, deleteTemplateDay, addExerciseToDay, removeExerciseFromDay, startWorkoutFromDay } from '../db/queries/templates'
import { getExercises, getMuscleGroups } from '../db/queries/exercises'
import { getActiveWorkout, deleteWorkout, getWorkoutExercises } from '../db/queries/workouts'
import { ExercisePicker } from '../components/workout/ExercisePicker'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { db } = useDatabase()
  const navigate = useNavigate()
  const [refresh, setRefresh] = useState(0)
  const [pickerDayId, setPickerDayId] = useState<number | null>(null)
  const [showAddDay, setShowAddDay] = useState(false)
  const [dayName, setDayName] = useState('')
  const [deleteDayId, setDeleteDayId] = useState<number | null>(null)
  const [confirmStartDayId, setConfirmStartDayId] = useState<number | null>(null)

  const template = useMemo(() => db && id ? getTemplateById(db, Number(id)) : null, [db, id, refresh])
  const allExercises = useMemo(() => db ? getExercises(db) : [], [db])
  const muscleGroups = useMemo(() => db ? getMuscleGroups(db) : [], [db])

  const reload = () => setRefresh((r) => r + 1)

  const handleAddDay = useCallback(() => {
    if (!db || !id || !dayName.trim()) return
    addTemplateDay(db, Number(id), dayName.trim())
    setDayName('')
    setShowAddDay(false)
    reload()
  }, [db, id, dayName])

  const handleDeleteDay = useCallback(() => {
    if (!db || deleteDayId == null) return
    deleteTemplateDay(db, deleteDayId)
    setDeleteDayId(null)
    reload()
  }, [db, deleteDayId])

  const handleAddExercise = useCallback((ex: { id: number }) => {
    if (!db || pickerDayId == null) return
    addExerciseToDay(db, pickerDayId, ex.id)
    setPickerDayId(null)
    reload()
  }, [db, pickerDayId])

  const handleRemoveExercise = useCallback((tdeId: number) => {
    if (!db) return
    removeExerciseFromDay(db, tdeId)
    reload()
  }, [db])

  const handleStartWorkout = useCallback((dayId: number) => {
    if (!db) return
    const active = getActiveWorkout(db)
    if (active) {
      const exs = getWorkoutExercises(db, active.id)
      if (exs.length === 0) {
        deleteWorkout(db, active.id)
      } else {
        navigate('/workout')
        return
      }
    }
    startWorkoutFromDay(db, dayId)
    setConfirmStartDayId(null)
    navigate('/workout')
  }, [db, navigate])

  if (!template) {
    return <div className="py-8 text-center text-text-muted">Template not found</div>
  }

  return (
    <div className="py-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/templates')} className="p-2 rounded-xl hover:bg-surface active:bg-surface-hover text-text-muted">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold tracking-tight">{template.name}</h2>
          <p className="text-xs text-text-muted">{template.days.length} days</p>
        </div>
      </div>

      {template.days.map((day) => (
        <Card key={day.id}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary">{day.name}</h3>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setConfirmStartDayId(day.id)}
                className="p-2 rounded-xl hover:bg-surface-hover text-primary"
                title="Start workout from this day"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteDayId(day.id)}
                className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            {day.exercises.map((ex, i) => (
              <div key={ex.id} className="flex items-center gap-2 py-2 group">
                <GripVertical className="h-3.5 w-3.5 text-text-muted/30 shrink-0" />
                <span className="w-5 text-xs text-text-muted text-center font-medium">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate">{ex.exercise_name}</p>
                  <p className="text-xs text-text-muted">{ex.muscle_group_name}</p>
                </div>
                <button
                  onClick={() => handleRemoveExercise(ex.id)}
                  className="p-1.5 rounded text-text-muted/30 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPickerDayId(day.id)}
            className="mt-2 w-full text-center text-sm font-semibold text-primary py-2 hover:bg-surface-hover rounded-xl transition-colors"
          >
            + Add Exercise
          </button>
        </Card>
      ))}

      <Button variant="secondary" onClick={() => setShowAddDay(true)} className="w-full">
        <Plus className="h-4 w-4" /> Add Day
      </Button>

      <ExercisePicker
        open={pickerDayId != null}
        onClose={() => setPickerDayId(null)}
        onSelect={handleAddExercise}
        exercises={allExercises}
        muscleGroups={muscleGroups}
      />

      <Modal open={showAddDay} onClose={() => setShowAddDay(false)} title="Add Day">
        <div className="flex flex-col gap-4">
          <Input
            label="Day Name"
            value={dayName}
            onChange={(e) => setDayName(e.target.value)}
            placeholder="e.g. Push, Legs, Upper A"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddDay()}
          />
          <Button onClick={handleAddDay} disabled={!dayName.trim()}>Add Day</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDayId != null}
        onClose={() => setDeleteDayId(null)}
        onConfirm={handleDeleteDay}
        title="Delete Day"
        message="Delete this day and all its exercises?"
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={confirmStartDayId != null}
        onClose={() => setConfirmStartDayId(null)}
        onConfirm={() => confirmStartDayId != null && handleStartWorkout(confirmStartDayId)}
        title="Start Workout"
        message="Start a new workout with this day's exercises?"
        confirmLabel="Start"
        variant="primary"
      />
    </div>
  )
}
