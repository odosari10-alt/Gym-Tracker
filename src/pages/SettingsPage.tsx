import { useDatabase } from '../db/hooks/useDatabase'
import { useAuth } from '../db/hooks/useAuth'
import { Card } from '../components/ui/Card'
import type { WeightUnit } from '../types'
import { LogOut } from 'lucide-react'

const REST_PRESETS = [
  { label: '30s', value: 30 },
  { label: '1:00', value: 60 },
  { label: '1:30', value: 90 },
  { label: '2:00', value: 120 },
  { label: '3:00', value: 180 },
]

export function SettingsPage() {
  const { unit, setUnit, restTimerSeconds, setRestTimerSeconds } = useDatabase()
  const { user, signOut } = useAuth()

  return (
    <div className="py-4 flex flex-col gap-5">
      <h2 className="text-xl font-extrabold tracking-tight">Settings</h2>

      <Card>
        <h3 className="font-bold text-text-primary mb-3">Account</h3>
        <p className="text-sm text-text-secondary mb-4">{user?.email ?? 'Unknown'}</p>
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#121212] border border-border rounded-xl text-sm font-semibold text-danger hover:border-danger transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </Card>

      <Card>
        <h3 className="font-bold text-text-primary mb-3">Weight Unit</h3>
        <div className="flex gap-2">
          {(['kg', 'lb'] as WeightUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                unit === u
                  ? 'bg-primary text-white'
                  : 'bg-[#121212] text-text-secondary border border-border hover:border-text-muted'
              }`}
            >
              {u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-text-primary mb-1">Rest Timer</h3>
        <p className="text-xs text-text-muted mb-3">Auto-starts after logging a set</p>
        <div className="flex flex-wrap gap-2">
          {REST_PRESETS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRestTimerSeconds(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                restTimerSeconds === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-[#121212] text-text-secondary border border-border hover:border-text-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
