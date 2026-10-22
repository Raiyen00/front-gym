import { LayoutDashboard, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ROL_LABELS, USER_STATE_LABELS } from '@/types/enums'
import { getToken } from '@/lib/storage'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

function SessionItem({ label, value, valueClass }: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 text-[0.8125rem] last:border-b-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className={cn('truncate text-right font-medium text-foreground', valueClass)}>
        {value}
      </dd>
    </div>
  )
}

export function SessionView() {
  const { user, logout } = useAuth()
  if (!user) return null

  const initials =
    `${user.name?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || 'US'
  const roleLabel = ROL_LABELS[user.rol] ?? user.rol
  const stateLabel = USER_STATE_LABELS[user.state] ?? user.state
  const isActive = user.state === 'activo' || user.state === 'habilitado_entrenar'
  const token = getToken()

  function handleLogout() {
    logout()
    toast.info('Sesión cerrada correctamente')
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[0.8125rem] font-semibold tracking-wide text-foreground"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[1.25rem] leading-tight font-semibold tracking-[-0.03em] text-foreground">
            ¡Hola, {user.name || 'Socio'}!
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Sesión activa en este navegador
          </p>
        </div>
      </div>

      <dl className="mt-6 rounded-lg bg-input-bg px-4 py-1">
        <SessionItem
          label="Usuario"
          value={`${user.name ?? ''} ${user.lastname ?? ''}`.trim() || 'Usuario'}
        />
        <SessionItem label="Correo" value={user.email || '-'} />
        <SessionItem label="Rol" value={roleLabel} />
        <SessionItem
          label="Estado"
          value={stateLabel}
          valueClass={isActive ? 'text-state-positive-ink' : 'text-warning'}
        />
      </dl>

      <p className="mt-5 mb-1.5 text-[0.6875rem] text-text-muted">
        Token de autorización (JWT en localStorage)
      </p>
      <div className="mb-6 max-h-[65px] overflow-y-auto rounded-md bg-background px-3 py-2 font-mono text-[0.6875rem] leading-relaxed break-all text-state-positive-ink">
        {token || 'Bearer (sin token)'}
      </div>

      <Button asChild className="mb-2 h-10 w-full">
        <Link to="/dashboard">
          <LayoutDashboard className="size-3.5" />
          Ir al panel
        </Link>
      </Button>
      <Button variant="secondary" className="h-10 w-full" onClick={handleLogout}>
        <LogOut className="size-3.5" />
        Cerrar sesión
      </Button>
    </div>
  )
}
