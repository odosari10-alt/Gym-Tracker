import { useCallback, useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { useDatabase } from '../db/hooks/useDatabase'
import { exportDatabase, importDatabase } from '../db/database'
import { Card } from '../components/ui/Card'
import type { WeightUnit } from '../types'

export function SettingsPage() {
  const { unit, setUnit } = useDatabase()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(async () => {
    const data = await exportDatabase()
    const blob = new Blob([new Uint8Array(data)], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-tracker-${new Date().toISOString().slice(0, 10)}.db`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await file.arrayBuffer()
    await importDatabase(data)
    window.location.reload()
  }, [])

  return (
    <div className="py-4 flex flex-col gap-5">
      <h2 className="text-xl font-extrabold tracking-tight">Settings</h2>

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
        <h3 className="font-bold text-text-primary mb-3">Data</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#121212] border border-border rounded-xl text-sm font-semibold text-text-primary hover:border-text-muted transition-colors"
          >
            <Download className="h-4 w-4" /> Export Database
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#121212] border border-border rounded-xl text-sm font-semibold text-text-primary hover:border-text-muted transition-colors"
          >
            <Upload className="h-4 w-4" /> Import Database
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".db"
            onChange={handleImport}
            className="hidden"
          />
          <p className="text-xs text-text-muted">
            Export your database as a backup or import a previously exported database.
            Importing will replace all current data.
          </p>
        </div>
      </Card>
    </div>
  )
}
