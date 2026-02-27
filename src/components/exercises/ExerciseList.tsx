import { ChevronRight, Trash2 } from 'lucide-react'
import type { Exercise } from '../../types'

interface ExerciseListProps {
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  onDelete?: (exercise: Exercise) => void
}

export function ExerciseList({ exercises, onSelect, onDelete }: ExerciseListProps) {
  if (!exercises.length) {
    return <p className="text-text-muted text-center py-8">No exercises found</p>
  }

  return (
    <div className="flex flex-col">
      {exercises.map((ex) => (
        <div
          key={ex.id}
          className="flex items-center justify-between py-3 px-1 border-b border-border last:border-b-0"
        >
          <button
            onClick={() => onSelect(ex)}
            className="flex-1 text-left min-w-0 py-0.5"
          >
            <p className="text-text-primary font-semibold text-sm">{ex.name}</p>
            <p className="text-text-muted text-xs">{ex.muscle_group_name}</p>
          </button>
          <div className="flex items-center gap-0.5 shrink-0">
            {onDelete && (
              <button
                onClick={() => onDelete(ex)}
                className="p-2 rounded-xl text-text-muted hover:text-danger active:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => onSelect(ex)} className="p-2 text-text-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
