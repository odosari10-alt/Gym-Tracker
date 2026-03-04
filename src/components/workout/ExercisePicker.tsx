import { useState, useMemo } from 'react'
import { Search, Dumbbell } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { MuscleGroupFilter } from '../exercises/MuscleGroupFilter'
import { getExerciseGif } from '../../lib/exerciseGifs'
import type { Exercise, MuscleGroup } from '../../types'

interface ExercisePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
  exercises: Exercise[]
  muscleGroups: MuscleGroup[]
}

export function ExercisePicker({ open, onClose, onSelect, exercises, muscleGroups }: ExercisePickerProps) {
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (groupId && ex.muscle_group_id !== groupId) return false
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [exercises, groupId, search])

  const handleSelect = (ex: Exercise) => {
    onSelect(ex)
    setSearch('')
    setGroupId(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise">
      <div className="flex flex-col gap-3 -mt-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border-input rounded-xl pl-10 pr-3 py-2.5 text-base text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>
        <MuscleGroupFilter groups={muscleGroups} selected={groupId} onSelect={setGroupId} />
        <div className="flex flex-col max-h-[50vh] overflow-y-auto overscroll-contain">
          {filtered.map((ex) => {
            const gifUrl = getExerciseGif(ex.name)
            return (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="flex items-center gap-3 text-left px-3 py-2.5 rounded-xl hover:bg-surface-hover active:bg-surface transition-colors"
              >
                <div className="w-22 h-22 rounded-xl bg-[#111] overflow-hidden shrink-0">
                  {gifUrl ? (
                    <img src={gifUrl} alt={ex.name} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-text-muted/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary text-sm font-semibold truncate">{ex.name}</p>
                  <p className="text-text-muted text-xs">{ex.muscle_group_name}</p>
                </div>
              </button>
            )
          })}
          {!filtered.length && <p className="text-text-muted text-center py-4 text-sm">No exercises found</p>}
        </div>
      </div>
    </Modal>
  )
}
