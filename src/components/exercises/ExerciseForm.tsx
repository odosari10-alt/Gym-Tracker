import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { MuscleGroup } from '../../types'

interface ExerciseFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (name: string, muscleGroupId: number) => void
  muscleGroups: MuscleGroup[]
}

export function ExerciseForm({ open, onClose, onSubmit, muscleGroups }: ExerciseFormProps) {
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState(muscleGroups[0]?.id ?? 1)

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed, groupId)
    setName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Custom Exercise">
      <div className="flex flex-col gap-4">
        <Input
          label="Exercise Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Cable Crunch"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-secondary">Muscle Group</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(Number(e.target.value))}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
          >
            {muscleGroups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleSubmit} disabled={!name.trim()}>Add Exercise</Button>
      </div>
    </Modal>
  )
}
