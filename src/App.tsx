import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import AppLayout from './layout/AppLayout'
import LoginPage from './pages/login'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TasksPage     = lazy(() => import('./pages/Taskpage'))
const HabitsPage    = lazy(() => import('./pages/HabitsPage'))
const ReportsPage   = lazy(() => import('./pages/ReportPage'))
const SettingsPage  = lazy(() => import('./pages/SettingsPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      Loading...
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/tasks"     element={<Suspense fallback={<PageLoader />}><TasksPage /></Suspense>} />
          <Route path="/habits"    element={<Suspense fallback={<PageLoader />}><HabitsPage /></Suspense>} />
          <Route path="/reports"   element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
          <Route path="/settings"  element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}