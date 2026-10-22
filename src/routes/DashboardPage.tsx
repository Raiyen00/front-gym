import {
  Activity,
  ArrowUpRight,
  CreditCard,
  Dumbbell,
  HeartPulse,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/useAuth'
import { formatDate } from '@/lib/formatters'
import {
  ROL_LABELS,
  USER_STATE_LABELS,
  type Rol,
  type UserState,
} from '@/types/enums'

interface QuickAction {
  label: string
  to: string
  description: string
  icon: LucideIcon
}

const QUICK_ACTIONS: Record<Rol, QuickAction[]> = {
  admin: [
    {
      label: 'Socios',
      to: '/usuarios',
      description: 'Altas, edición y estado de cada socio.',
      icon: Users,
    },
    {
      label: 'Pagos',
      to: '/pagos',
      description: 'Registrá cuotas y controlá vencimientos.',
      icon: CreditCard,
    },
    {
      label: 'Perfiles deportivos',
      to: '/perfiles-deportivos',
      description: 'Objetivos y seguimiento de entrenamiento.',
      icon: Activity,
    },
  ],
  profesor: [
    {
      label: 'Socios',
      to: '/usuarios',
      description: 'Consultá y actualizá los datos de los socios.',
      icon: Users,
    },
    {
      label: 'Rutinas',
      to: '/rutinas',
      description: 'Armá y revisá los planes de entrenamiento.',
      icon: Dumbbell,
    },
    {
      label: 'Ejercicios',
      to: '/ejercicios',
      description: 'Catálogo de ejercicios por grupo muscular.',
      icon: Activity,
    },
  ],
  cliente: [
    {
      label: 'Mi membresía',
      to: '/mi-membresia',
      description: 'Estado de tu cuota e historial de pagos.',
      icon: CreditCard,
    },
    {
      label: 'Mi perfil deportivo',
      to: '/mi-perfil-deportivo',
      description: 'Tus objetivos y datos de entrenamiento.',
      icon: HeartPulse,
    },
    {
      label: 'Mi perfil',
      to: '/mi-perfil',
      description: 'Tus datos personales y de contacto.',
      icon: UserCog,
    },
  ],
}

const INTRO: Record<Rol, string> = {
  admin:
    'Tenés el control de socios, cuotas y perfiles deportivos. Empezá por el módulo que necesites.',
  profesor:
    'Gestioná socios y rutinas, y mantené los perfiles de entrenamiento al día.',
  cliente:
    'Consultá tu membresía y tu perfil deportivo. Todo lo que necesitás, en un solo lugar.',
}

const STEPS: Record<Rol, { title: string; description: string }[]> = {
  admin: [
    {
      title: 'Alta de socio',
      description: 'Creá la cuenta con los datos personales y de contacto.',
    },
    {
      title: 'Perfil deportivo',
      description: 'Registrá objetivos y antecedentes para entrenar seguro.',
    },
    {
      title: 'Registrar el pago',
      description: 'Cargá la cuota y controlá su vencimiento desde Pagos.',
    },
  ],
  profesor: [
    {
      title: 'Revisar socios',
      description: 'Consultá quién está habilitado para entrenar.',
    },
    {
      title: 'Cargar ejercicios',
      description: 'Organizá el catálogo por grupo muscular.',
    },
    {
      title: 'Armar la rutina',
      description: 'Asigná el plan de entrenamiento a cada socio.',
    },
  ],
  cliente: [
    {
      title: 'Completar tu perfil',
      description: 'Revisá tus datos personales y de contacto.',
    },
    {
      title: 'Consultar tu cuota',
      description: 'Mirá el estado de tu membresía y tus pagos.',
    },
    {
      title: 'Seguir tu rutina',
      description: 'Accedé al plan de entrenamiento que te asignaron.',
    },
  ],
}

function AccountRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 py-2.5 last:border-0 last:pb-0">
      <span className="text-[0.8125rem] text-text-muted">{label}</span>
      <span className="min-w-0 text-right text-[0.8125rem] font-medium text-foreground">
        {children}
      </span>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const rol: Rol = user?.rol ?? 'cliente'
  const state: UserState = user?.state ?? 'pendiente_habilitacion'
  const isActive = state === 'activo' || state === 'habilitado_entrenar'
  const actions = QUICK_ACTIONS[rol]

  const today = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <div className="flex flex-col gap-9">
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-text-muted">{todayLabel}</p>
          <h1 className="mt-2 text-[1.625rem] leading-tight font-semibold tracking-[-0.025em] text-foreground md:text-[1.875rem]">
            Hola, {user?.name || 'usuario'}
          </h1>
          <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            {INTRO[rol]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{ROL_LABELS[rol]}</Badge>
          <Badge variant={isActive ? 'default' : 'warning'}>
            {USER_STATE_LABELS[state]}
          </Badge>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 pb-3">
            <h2 className="text-[0.9375rem] font-semibold text-foreground">
              Accesos rápidos
            </h2>
            <span className="num text-xs text-text-muted">
              {actions.length} secciones
            </span>
          </div>

          <div className="overflow-hidden rounded-xl bg-card">
            {actions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center gap-4 border-b border-border/70 px-5 py-4 transition-colors last:border-b-0 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset focus-visible:outline-none"
              >
                <action.icon
                  className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-state-positive-ink"
                  strokeWidth={1.75}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-medium text-foreground">
                    {action.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.8125rem] text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-foreground"
                  strokeWidth={1.75}
                />
              </Link>
            ))}
          </div>
        </section>

        <aside className="min-w-0 rounded-xl bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[0.9375rem] font-semibold text-foreground">
              Tu cuenta
            </h2>
          </div>
          <div className="px-5 pb-4">
            <AccountRow label="Rol">{ROL_LABELS[rol]}</AccountRow>
            <AccountRow label="Estado">
              <Badge variant={isActive ? 'default' : 'warning'}>
                {USER_STATE_LABELS[state]}
              </Badge>
            </AccountRow>
            <AccountRow label="Correo">
              <span className="block truncate">{user?.email || '-'}</span>
            </AccountRow>
            <AccountRow label="Alta">
              <span className="num">
                {user?.register_date ? formatDate(user.register_date) : '-'}
              </span>
            </AccountRow>
          </div>
          <div className="border-t border-border px-5 py-3">
            <Link
              to={rol === 'cliente' ? '/mi-perfil' : '/usuarios'}
              className="inline-flex items-center gap-1.5 rounded-sm text-[0.8125rem] font-medium text-state-positive-ink hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none"
            >
              {rol === 'cliente' ? 'Ver mi perfil' : 'Ir a socios'}
              <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        </aside>
      </div>

      <section>
        <div className="flex items-baseline justify-between gap-4 pb-3">
          <h2 className="text-[0.9375rem] font-semibold text-foreground">
            Primeros pasos
          </h2>
          <span className="text-xs text-text-muted">Según tu rol</span>
        </div>
        <ol className="grid overflow-hidden rounded-xl bg-card sm:grid-cols-3">
          {STEPS[rol].map((step) => (
            <li
              key={step.title}
              className="border-b border-border/70 p-5 last:border-b-0 sm:border-r sm:border-b-0 sm:border-border/70 sm:last:border-r-0"
            >
              <p className="text-[0.875rem] font-medium text-foreground">
                {step.title}
              </p>
              <p className="mt-1.5 max-w-[34ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
