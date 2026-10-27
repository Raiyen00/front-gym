import { useAuth } from '@/features/auth/useAuth'
import { StaffRoutinesView } from '@/features/routines/components/StaffRoutinesView'
import { MyRoutinesView } from '@/features/routines/components/MyRoutinesView'

export function RoutinesPage() {
  const { user } = useAuth()
  const canManage = user?.rol === 'admin' || user?.rol === 'profesor'

  return canManage ? <StaffRoutinesView /> : <MyRoutinesView />
}
