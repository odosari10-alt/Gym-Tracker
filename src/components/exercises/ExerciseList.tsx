import { Dumbbell } from 'lucide-react'
import { getExerciseGif } from '../../lib/exerciseGifs'
import { BookmarkIcon } from '../ui/BookmarkIcon'
import type { Exercise } from '../../types'

interface ExerciseListProps {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  favorites: Set<number>
  onToggleFavorite: (exercise: Exercise) => void
}

export function ExerciseList({ exercises, onSelect, favorites, onToggleFavorite }: ExerciseListProps) {
  if (!exercises.length) {
    return <p className="text-text-muted text-center py-8">No exercises found</p>
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {exercises.map((ex) => {
        const gifUrl = getExerciseGif(ex.name)
        const isFav = favorites.has(ex.id)

        return (
          <div
            key={ex.id}
            className="flex flex-col rounded-2xl bg-surface overflow-hidden"
            style={{ maxWidth: 350 }}
          >
            <div className="relative">
              <button
                onClick={() => onSelect(ex)}
                className="w-full"
              >
                <div className="w-full bg-[#111] overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {gifUrl ? (
                    <img
                      src={gifUrl}
                      alt={ex.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="h-8 w-8 text-text-muted/30" />
                    </div>
                  )}
                </div>
              </button>
              <button
                onClick={() => onToggleFavorite(ex)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 transition-colors"
              >
                <BookmarkIcon
                  className={`h-4 w-4 ${isFav ? 'text-primary' : 'text-white/70'}`}
                  filled={isFav}
                />
              </button>
            </div>
            <button
              onClick={() => onSelect(ex)}
              className="text-left px-3 py-2.5"
            >
              <p className="text-text-primary font-semibold text-xs truncate">{ex.name}</p>
              <p className="text-text-muted text-[10px]">{ex.muscle_group_name}</p>
            </button>
          </div>
        )
      })}
    </div>
  )
}
