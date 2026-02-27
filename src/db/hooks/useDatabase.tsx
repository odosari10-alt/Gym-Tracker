import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Database } from 'sql.js'
import { initDatabase, saveToIndexedDB } from '../database'
import type { WeightUnit } from '../../types'
import { SETTINGS_KEY } from '../../lib/constants'

interface DatabaseContextValue {
  db: Database | null
  loading: boolean
  error: string | null
  save: () => Promise<void>
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
  const [db, setDb] = useState<Database | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unit, setUnitState] = useState<WeightUnit>(loadUnit)

  useEffect(() => {
    initDatabase()
      .then(setDb)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (navigator.storage?.persist) {
      navigator.storage.persist()
    }
  }, [])

  const save = useCallback(async () => {
    await saveToIndexedDB()
  }, [])

  const setUnit = useCallback((u: WeightUnit) => {
    setUnitState(u)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ unit: u }))
  }, [])

  return (
    <DatabaseContext.Provider value={{ db, loading, error, save, unit, setUnit }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext)
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider')
  return ctx
}
