import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { ForbiddenPage } from '@/routes/ForbiddenPage'
import { useAuth } from '@/features/auth/useAuth'
import type { Rol } from '@/types/enums'

interface RequireRoleProps {
  roles: Rol[]
  children: ReactNode
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.rol)) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}
