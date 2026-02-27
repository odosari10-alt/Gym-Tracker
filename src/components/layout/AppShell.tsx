import { Outlet } from 'react-router'
import { BottomNav } from './BottomNav'
import { Header } from './Header'

export function AppShell() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto px-4 pb-24" style={{ paddingTop: 'var(--safe-top)' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
