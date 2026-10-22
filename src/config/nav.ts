import {
  Activity,
  ClipboardList,
  CreditCard,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import type { Rol } from '@/types/enums'

export const NAV_SECTIONS = ['general', 'gestion', 'cuenta'] as const
export type NavSection = (typeof NAV_SECTIONS)[number]

export const NAV_SECTION_LABELS: Record<NavSection, string> = {
  general: 'General',
  gestion: 'Gestión',
  cuenta: 'Mi cuenta',
}

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  allowedRoles: Rol[]
  section: NavSection
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
    section: 'general',
  },
  {
    label: 'Socios',
    to: '/usuarios',
    icon: Users,
    allowedRoles: ['admin', 'profesor'],
    section: 'gestion',
  },
  {
    label: 'Ejercicios',
    to: '/ejercicios',
    icon: Dumbbell,
    allowedRoles: ['admin', 'profesor'],
    section: 'gestion',
  },
  {
    label: 'Rutinas',
    to: '/rutinas',
    icon: ClipboardList,
    allowedRoles: TODOS,
    section: 'gestion',
  },
  {
    label: 'Perfiles deportivos',
    to: '/perfiles-deportivos',
    icon: Activity,
    allowedRoles: ['admin'],
    section: 'gestion',
  },
  {
    label: 'Pagos',
    to: '/pagos',
    icon: CreditCard,
    allowedRoles: ['admin'],
    section: 'gestion',
  },
  {
    label: 'Mi perfil',
    to: '/mi-perfil',
    icon: UserCog,
    allowedRoles: ['cliente'],
    section: 'cuenta',
  },
  {
    label: 'Mi perfil deportivo',
    to: '/mi-perfil-deportivo',
    icon: HeartPulse,
    allowedRoles: ['cliente'],
    section: 'cuenta',
  },
  {
    label: 'Mi membresía',
    to: '/mi-membresia',
    icon: Wallet,
    allowedRoles: ['cliente'],
    section: 'cuenta',
  },
]
