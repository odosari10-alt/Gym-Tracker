import { NavLink } from 'react-router'
import { Home, ClipboardList, Dumbbell, BarChart3, Settings } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/templates', icon: ClipboardList, label: 'Templates' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-border" style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-2 text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted active:text-text-secondary'
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            <span className="truncate text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
