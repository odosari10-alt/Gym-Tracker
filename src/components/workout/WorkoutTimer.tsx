import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface WorkoutTimerProps {
  startedAt: string
}

export function WorkoutTimer({ startedAt }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(startedAt).getTime()
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      const hrs = Math.floor(mins / 60)
      if (hrs > 0) {
        setElapsed(`${hrs}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
      } else {
        setElapsed(`${mins}:${String(secs).padStart(2, '0')}`)
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return (
    <div className="flex items-center gap-1.5 text-text-muted text-sm">
      <Clock className="h-3.5 w-3.5" />
      <span className="font-mono font-medium">{elapsed}</span>
    </div>
  )
}
