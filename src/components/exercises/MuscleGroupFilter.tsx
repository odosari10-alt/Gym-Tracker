import { BookmarkIcon } from '../ui/BookmarkIcon'
import { CardioIcon } from '../ui/CardioIcon'
import type { MuscleGroup } from '../../types'

interface MuscleGroupFilterProps {
  groups: MuscleGroup[]
  selected: number | null
  onSelect: (id: number | null) => void
  showFavorites?: boolean
  favoritesSelected?: boolean
  onFavoritesSelect?: () => void
}

export function MuscleGroupFilter({ groups, selected, onSelect, showFavorites, favoritesSelected, onFavoritesSelect }: MuscleGroupFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors select-none border ${
          selected === null && !favoritesSelected
            ? 'bg-primary/15 text-primary border-primary'
            : 'bg-transparent text-text-secondary border-border hover:border-text-muted'
        }`}
      >
        All
      </button>
      {showFavorites && onFavoritesSelect && (
        <button
          onClick={onFavoritesSelect}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors select-none border flex items-center gap-1.5 ${
            favoritesSelected
              ? 'bg-primary/15 text-primary border-primary'
              : 'bg-transparent text-text-secondary border-border hover:border-text-muted'
          }`}
        >
          <BookmarkIcon className="h-3.5 w-3.5" filled={favoritesSelected} />
          Favorites
        </button>
      )}
      {groups.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id === selected ? null : g.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors select-none border flex items-center gap-1.5 ${
            selected === g.id
              ? 'bg-primary/15 text-primary border-primary'
              : 'bg-transparent text-text-secondary border-border hover:border-text-muted'
          }`}
        >
          {g.name.toLowerCase() === 'cardio' && <CardioIcon className="h-5 w-5" />}
          {g.name}
        </button>
      ))}
    </div>
  )
}
