import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { WeightUnit } from '../../types'
import { SETTINGS_KEY } from '../../lib/constants'

interface DatabaseContextValue {
  unit: WeightUnit
  setUnit: (u: WeightUnit) => void
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null)

function loadUnit(): WeightUnit {
  try {
    const s = localStorage.getItem(SETTINGS_KEY)
    if (s) {
      const parsed = JSON.parse(s)
      if (parsed.unit === 'lb') return 'lb'
    }
  } catch { /* ignore */ }
  return 'kg'
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>(loadUnit)

  const setUnit = useCallback((u: WeightUnit) => {
    setUnitState(u)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ unit: u }))
  }, [])

  return (
    <DatabaseContext.Provider value={{ unit, setUnit }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext)
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider')
  return ctx
}
