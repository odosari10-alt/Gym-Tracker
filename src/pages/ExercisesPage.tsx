import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search } from 'lucide-react'
import { getExercises, getMuscleGroups, createExercise } from '../db/queries/exercises'
import { MuscleGroupFilter } from '../components/exercises/MuscleGroupFilter'
import { ExerciseList } from '../components/exercises/ExerciseList'
import { ExerciseForm } from '../components/exercises/ExerciseForm'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { Exercise, MuscleGroup } from '../types'

const FAVORITES_KEY = 'gym-tracker-favorites'

function loadFavorites(): Set<number> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set()
}

function saveFavorites(favs: Set<number>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]))
}

export function ExercisesPage() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const navigate = useNavigate()
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites)

  useEffect(() => {
    getMuscleGroups().then(setMuscleGroups).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getExercises(selectedGroup ?? undefined, search || undefined).then(setExercises)
  }, [selectedGroup, search, refresh])

  const displayedExercises = useMemo(() => {
    if (!showFavorites) return exercises
    return exercises.filter((ex) => favorites.has(ex.id))
  }, [exercises, showFavorites, favorites])

  const handleAddExercise = useCallback(async (name: string, muscleGroupId: number) => {
    await createExercise(name, muscleGroupId)
    setRefresh((r) => r + 1)
  }, [])

  const handleSelect = useCallback((ex: Exercise) => {
    navigate(`/exercises/${ex.id}`)
  }, [navigate])

  const handleToggleFavorite = useCallback((ex: Exercise) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(ex.id)) {
        next.delete(ex.id)
      } else {
        next.add(ex.id)
      }
      saveFavorites(next)
      return next
    })
  }, [])

  const handleGroupSelect = useCallback((id: number | null) => {
    setSelectedGroup(id)
    setShowFavorites(false)
  }, [])

  const handleFavoritesSelect = useCallback(() => {
    setShowFavorites((prev) => !prev)
    setSelectedGroup(null)
  }, [])

  if (loading) return <Spinner />

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
        onSelect={handleGroupSelect}
        showFavorites
        favoritesSelected={showFavorites}
        onFavoritesSelect={handleFavoritesSelect}
      />

      <ExerciseList
        exercises={displayedExercises}
        onSelect={handleSelect}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />

      <ExerciseForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddExercise}
        muscleGroups={muscleGroups}
      />
    </div>
  )
}
