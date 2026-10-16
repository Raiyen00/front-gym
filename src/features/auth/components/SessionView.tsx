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
    <div className="flex items-center justify-between border-b border-border py-[0.45rem] text-[0.825rem] last:border-b-0 last:pb-0">
      <span className="text-text-muted">{label}</span>
      <span className={cn('font-medium text-foreground', valueClass)}>{value}</span>
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
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-[58px] items-center justify-center rounded-full border-2 border-primary bg-[rgba(16,185,129,0.08)] text-[1.4rem] font-bold text-primary">
        {initials}
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        ¡Hola, {user.name || 'Socio'}!
      </h2>
      <p className="mt-0.5 text-[0.825rem] text-muted-foreground">
        Tu sesión está activa en este navegador
      </p>

      <div className="my-5 rounded-md border border-border bg-surface-elevated p-4 text-left">
        <SessionItem
          label="Usuario"
          value={`${user.name ?? ''} ${user.lastname ?? ''}`.trim() || 'Usuario'}
        />
        <SessionItem label="Correo" value={user.email || '-'} />
        <SessionItem label="Rol" value={roleLabel} />
        <SessionItem
          label="Estado"
          value={stateLabel}
          valueClass={isActive ? 'text-primary' : 'text-warning'}
        />
      </div>

      <p className="mb-1.5 text-left text-[0.75rem] text-text-muted">
        Token de autorización (JWT en localStorage):
      </p>
      <div className="mb-5 max-h-[65px] overflow-y-auto rounded-sm border border-border bg-input-bg px-3 py-[0.55rem] text-left font-mono text-[0.725rem] break-all text-primary">
        {token || 'Bearer (sin token)'}
      </div>

      <Button asChild className="mb-2 w-full">
        <Link to="/dashboard">
          <LayoutDashboard className="size-3.5" />
          Ir al panel
        </Link>
      </Button>
      <Button variant="secondary" className="w-full" onClick={handleLogout}>
        <LogOut className="size-3.5" />
        Cerrar sesión
      </Button>
    </div>
  )
}
