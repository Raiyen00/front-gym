import { Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'
import { AuthPage } from '@/routes/AuthPage'
import { DashboardPage } from '@/routes/DashboardPage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { PlaceholderPage } from '@/routes/PlaceholderPage'
import { UsersPage } from '@/features/users/components/UsersPage'
import { ProfilePage } from '@/features/users/components/ProfilePage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/usuarios"
            element={
              <RequireRole roles={['admin', 'profesor']}>
                <UsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/ejercicios"
            element={
              <RequireRole roles={['admin', 'profesor']}>
                <PlaceholderPage title="Ejercicios" />
              </RequireRole>
            }
          />
          <Route
            path="/rutinas"
            element={
              <RequireRole roles={['admin', 'profesor', 'cliente']}>
                <PlaceholderPage title="Rutinas" />
              </RequireRole>
            }
          />
          <Route
            path="/mi-perfil"
            element={
              <RequireRole roles={['cliente']}>
                <ProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="/pagos"
            element={
              <RequireRole roles={['admin']}>
                <PlaceholderPage title="Pagos" />
              </RequireRole>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
