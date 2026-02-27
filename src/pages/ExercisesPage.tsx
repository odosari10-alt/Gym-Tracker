import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { getExercises, getMuscleGroups, createExercise, deleteExercise } from '../db/queries/exercises'
import { MuscleGroupFilter } from '../components/exercises/MuscleGroupFilter'
import { ExerciseList } from '../components/exercises/ExerciseList'
import { ExerciseForm } from '../components/exercises/ExerciseForm'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Button } from '../components/ui/Button'
import type { Exercise } from '../types'

export function ExercisesPage() {
  const { db } = useDatabase()
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)
  const [refresh, setRefresh] = useState(0)
  const navigate = useNavigate()

  const muscleGroups = useMemo(() => db ? getMuscleGroups(db) : [], [db])
  const exercises = useMemo(
    () => db ? getExercises(db, selectedGroup ?? undefined, search || undefined) : [],
    [db, selectedGroup, search, refresh]
  )

  const handleAddExercise = useCallback((name: string, muscleGroupId: number) => {
    if (!db) return
    createExercise(db, name, muscleGroupId)
    setRefresh((r) => r + 1)
  }, [db])

  const handleSelect = useCallback((ex: Exercise) => {
    navigate(`/exercises/${ex.id}`)
  }, [navigate])

  const handleDelete = useCallback(() => {
    if (!db || !deleteTarget) return
    deleteExercise(db, deleteTarget.id)
    setDeleteTarget(null)
    setRefresh((r) => r + 1)
  }, [db, deleteTarget])

  return (
    <div className="py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">Exercises</h2>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border-input rounded-xl pl-10 pr-3 py-2.5 text-base text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
        />
      </div>

      <MuscleGroupFilter
        groups={muscleGroups}
        selected={selectedGroup}
        onSelect={setSelectedGroup}
      />

      <ExerciseList exercises={exercises} onSelect={handleSelect} onDelete={setDeleteTarget} />

      <ExerciseForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddExercise}
        muscleGroups={muscleGroups}
      />

      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Exercise"
        message={`Delete "${deleteTarget?.name}"? This only works for custom exercises.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
