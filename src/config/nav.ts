import {
  Activity,
  ClipboardList,
  CreditCard,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { Rol } from '@/types/enums'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  allowedRoles: Rol[]
}

const TODOS: Rol[] = ['admin', 'profesor', 'cliente']

/**
 * Navegación del panel. Los items se filtran por rol del usuario.
 * Las rutas se irán habilitando a medida que la API exponga sus endpoints
 * (ver plan.md, Fases 7+).
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Panel',
    to: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: TODOS,
  },
  {
    label: 'Socios',
    to: '/usuarios',
    icon: Users,
    allowedRoles: ['admin', 'profesor'],
  },
  {
    label: 'Ejercicios',
    to: '/ejercicios',
    icon: Dumbbell,
    allowedRoles: ['admin', 'profesor'],
  },
  {
    label: 'Rutinas',
    to: '/rutinas',
    icon: ClipboardList,
    allowedRoles: TODOS,
  },
  {
    label: 'Perfiles deportivos',
    to: '/perfiles-deportivos',
    icon: Activity,
    allowedRoles: ['admin'],
  },
  {
    label: 'Mi perfil',
    to: '/mi-perfil',
    icon: UserCog,
    allowedRoles: ['cliente'],
  },
  {
    label: 'Mi perfil deportivo',
    to: '/mi-perfil-deportivo',
    icon: HeartPulse,
    allowedRoles: ['cliente'],
  },
  {
    label: 'Pagos',
    to: '/pagos',
    icon: CreditCard,
    allowedRoles: ['admin'],
  },
]
