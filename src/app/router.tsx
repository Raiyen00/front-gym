import { Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'
import { AuthPage } from '@/routes/AuthPage'
import { DashboardPage } from '@/routes/DashboardPage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { UsersPage } from '@/features/users/components/UsersPage'
import { ExercisesPage } from '@/features/exercises/components/ExercisesPage'
import { RoutinesPage } from '@/features/routines/components/RoutinesPage'
import { RoutineDetailPage } from '@/features/routines/components/RoutineDetailPage'
import { ProfilePage } from '@/features/users/components/ProfilePage'
import { SportProfilesPage } from '@/features/sportProfiles/components/SportProfilesPage'
import { MySportProfilePage } from '@/features/sportProfiles/components/MySportProfilePage'
import { PaymentsPage } from '@/features/payments/components/PaymentsPage'
import { MyMembershipPage } from '@/features/payments/components/MyMembershipPage'

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
                <ExercisesPage />
              </RequireRole>
            }
          />
          <Route
            path="/rutinas"
            element={
              <RequireRole roles={['admin', 'profesor', 'cliente']}>
                <RoutinesPage />
              </RequireRole>
            }
          />
          <Route
            path="/rutinas/:id"
            element={
              <RequireRole roles={['admin', 'profesor', 'cliente']}>
                <RoutineDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="/perfiles-deportivos"
            element={
              <RequireRole roles={['admin']}>
                <SportProfilesPage />
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
            path="/mi-perfil-deportivo"
            element={
              <RequireRole roles={['cliente']}>
                <MySportProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="/pagos"
            element={
              <RequireRole roles={['admin']}>
                <PaymentsPage />
              </RequireRole>
            }
          />
          <Route
            path="/mi-membresia"
            element={
              <RequireRole roles={['cliente']}>
                <MyMembershipPage />
              </RequireRole>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
