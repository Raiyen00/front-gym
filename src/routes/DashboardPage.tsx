import { CalendarDays, Dumbbell, Users } from 'lucide-react'

import { NAV_ITEMS } from '@/config/nav'
import { ROL_LABELS } from '@/types/enums'
import { useAuth } from '@/features/auth/useAuth'

const STATS = [
  { label: 'Socios activos', value: '—', icon: Users },
  { label: 'Rutinas creadas', value: '—', icon: Dumbbell },
  { label: 'Clases de hoy', value: '—', icon: CalendarDays },
]

export function DashboardPage() {
  const { user } = useAuth()
  const visibleSections = user
    ? NAV_ITEMS.filter((item) => item.allowedRoles.includes(user.rol))
    : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Hola, {user?.name || 'usuario'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user ? `${ROL_LABELS[user.rol]} · ` : ''}Bienvenido al panel de gestión.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.825rem] text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Secciones disponibles para tu rol
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {visibleSections.map((section) => (
            <li
              key={section.to}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-[0.825rem] text-muted-foreground"
            >
              <section.icon className="size-3.5 text-primary" />
              {section.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
