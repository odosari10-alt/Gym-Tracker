import { Routes, Route } from 'react-router'
import { useAuth } from './db/hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { WorkoutPage } from './pages/WorkoutPage'
import { WorkoutDetailPage } from './pages/WorkoutDetailPage'
import { HistoryPage } from './pages/HistoryPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { ExerciseDetailPage } from './pages/ExerciseDetailPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { TemplateDetailPage } from './pages/TemplateDetailPage'

export default function App() {
  const auth = useAuth()

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!auth.user) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="templates/:id" element={<TemplateDetailPage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="exercises/:id" element={<ExerciseDetailPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="workout" element={<WorkoutPage />} />
      <Route path="workout/:id" element={<WorkoutDetailPage />} />
    </Routes>
  )
}
