import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { CheckIcon } from '../ui/CheckIcon'
import type { Set, WeightUnit } from '../../types'
import { convertWeight, toKg } from '../../lib/formulas'

interface SetRowProps {
  set: Set
  unit: WeightUnit
  readOnly?: boolean
  checked?: boolean
  onToggleCheck?: (setId: number) => void
  onUpdate: (setId: number, weightKg: number, reps: number, isWarmup: boolean, rpe: number | null) => void
  onDelete: (setId: number) => void
}

export function SetRow({ set, unit, readOnly, checked, onToggleCheck, onUpdate, onDelete }: SetRowProps) {
  const displayWeight = Number(convertWeight(set.weight_kg, unit).toFixed(1))

  return (
    <div className={`flex items-center gap-2 py-1.5 ${set.is_warmup ? 'opacity-50' : ''}`}>
      {!readOnly && (
        <button
          onClick={() => onDelete(set.id)}
          className="p-2 text-text-muted hover:text-danger active:text-danger transition-colors shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="flex flex-col items-center flex-1 min-w-0">
        {!readOnly && (
          <button
            onClick={() => onUpdate(set.id, toKg(displayWeight + 2.5, unit), set.reps, set.is_warmup, set.rpe)}
            className="text-text-muted hover:text-primary active:text-primary w-full flex justify-center"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={displayWeight || ''}
          onChange={(e) => onUpdate(set.id, toKg(Number(e.target.value), unit), set.reps, set.is_warmup, set.rpe)}
          className="w-full bg-[#121212] border border-border-input rounded-lg px-2 py-2.5 text-sm text-center text-text-primary font-medium focus:outline-none focus:border-primary"
          placeholder="0"
          disabled={readOnly}
        />
        {!readOnly && (
          <button
            onClick={() => onUpdate(set.id, toKg(Math.max(0, displayWeight - 2.5), unit), set.reps, set.is_warmup, set.rpe)}
            className="text-text-muted hover:text-primary active:text-primary w-full flex justify-center"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>
      <span className="text-text-muted text-xs shrink-0">x</span>
      <div className="flex flex-col items-center flex-1 min-w-0">
        {!readOnly && (
          <button
            onClick={() => onUpdate(set.id, set.weight_kg, set.reps + 1, set.is_warmup, set.rpe)}
            className="text-text-muted hover:text-primary active:text-primary w-full flex justify-center"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        <input
          type="number"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => onUpdate(set.id, set.weight_kg, Number(e.target.value), set.is_warmup, set.rpe)}
          className="w-full bg-[#121212] border border-border-input rounded-lg px-2 py-2.5 text-sm text-center text-text-primary font-medium focus:outline-none focus:border-primary"
          placeholder="reps"
          disabled={readOnly}
        />
        {!readOnly && (
          <button
            onClick={() => onUpdate(set.id, set.weight_kg, Math.max(0, set.reps - 1), set.is_warmup, set.rpe)}
            className="text-text-muted hover:text-primary active:text-primary w-full flex justify-center"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>
      {!readOnly && (
        <>
          <button
            onClick={() => onUpdate(set.id, set.weight_kg, set.reps, !set.is_warmup, set.rpe)}
            className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              set.is_warmup ? 'bg-primary/20 text-primary' : 'bg-surface text-text-muted hover:bg-surface-hover'
            }`}
            title="Toggle warmup"
          >
            W
          </button>
          {onToggleCheck && (
            <button
              onClick={() => onToggleCheck(set.id)}
              className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${
                checked
                  ? 'bg-primary border-primary'
                  : 'border-text-muted/40 bg-transparent'
              }`}
            >
              {checked && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
          )}
        </>
      )}
    </div>
  )
}
