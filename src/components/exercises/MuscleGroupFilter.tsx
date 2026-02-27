import type { MuscleGroup } from '../../types'

interface MuscleGroupFilterProps {
  groups: MuscleGroup[]
  selected: number | null
  onSelect: (id: number | null) => void
}

export function MuscleGroupFilter({ groups, selected, onSelect }: MuscleGroupFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors select-none border ${
          selected === null
            ? 'bg-primary/15 text-primary border-primary'
            : 'bg-transparent text-text-secondary border-border hover:border-text-muted'
        }`}
      >
        All
      </button>
      {groups.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id === selected ? null : g.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors select-none border ${
            selected === g.id
              ? 'bg-primary/15 text-primary border-primary'
              : 'bg-transparent text-text-secondary border-border hover:border-text-muted'
          }`}
        >
          {g.name}
        </button>
      ))}
    </div>
  )
}
