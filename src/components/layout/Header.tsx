import { Dumbbell } from 'lucide-react'

export function Header() {
  return (
    <header className="flex items-center gap-2.5 px-4 py-3 bg-background border-b border-border shrink-0" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}>
      <Dumbbell className="h-6 w-6 text-primary" />
      <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Gym Tracker</h1>
    </header>
  )
}
