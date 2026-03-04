import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { WeightUnit } from '../../types'
import { SETTINGS_KEY, DEFAULT_REST_TIMER_SECONDS } from '../../lib/constants'

interface DatabaseContextValue {
  unit: WeightUnit
  setUnit: (u: WeightUnit) => void
  restTimerSeconds: number
  setRestTimerSeconds: (s: number) => void
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null)

function loadSettings(): { unit: WeightUnit; restTimerSeconds: number } {
  try {
    const s = localStorage.getItem(SETTINGS_KEY)
    if (s) {
      const parsed = JSON.parse(s)
      return {
        unit: parsed.unit === 'lb' ? 'lb' : 'kg',
        restTimerSeconds: typeof parsed.restTimerSeconds === 'number'
          ? parsed.restTimerSeconds
          : DEFAULT_REST_TIMER_SECONDS,
      }
    }
  } catch { /* ignore */ }
  return { unit: 'kg', restTimerSeconds: DEFAULT_REST_TIMER_SECONDS }
}

function saveSettings(settings: { unit: WeightUnit; restTimerSeconds: number }) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>(() => loadSettings().unit)
  const [restTimerSeconds, setRestTimerSecondsState] = useState<number>(() => loadSettings().restTimerSeconds)

  const setUnit = useCallback((u: WeightUnit) => {
    setUnitState(u)
    setRestTimerSecondsState((prev) => {
      saveSettings({ unit: u, restTimerSeconds: prev })
      return prev
    })
  }, [])

  const setRestTimerSeconds = useCallback((s: number) => {
    setRestTimerSecondsState(s)
    setUnitState((prev) => {
      saveSettings({ unit: prev, restTimerSeconds: s })
      return prev
    })
  }, [])

  return (
    <DatabaseContext.Provider value={{ unit, setUnit, restTimerSeconds, setRestTimerSeconds }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext)
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider')
  return ctx
}
