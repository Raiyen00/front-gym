import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { toast } from 'sonner'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS } from '@/config/nav'
import { ROL_LABELS } from '@/types/enums'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter(
    (item) => user && item.allowedRoles.includes(user.rol),
  )

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-surface-hover text-foreground'
                  : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
              )
            }
          >
            <Icon className="size-4" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function UserFooter() {
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    toast.info('Sesión cerrada correctamente')
  }

  const initials =
    `${user?.name?.[0] ?? ''}${user?.lastname?.[0] ?? ''}`.toUpperCase() || 'US'

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary bg-[rgba(16,185,129,0.08)] text-xs font-bold text-primary">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.825rem] font-medium text-foreground">
          {user ? `${user.name} ${user.lastname}` : 'Usuario'}
        </p>
        <p className="truncate text-[0.7rem] text-text-muted">
          {user ? ROL_LABELS[user.rol] : ''}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleLogout}
        aria-label="Cerrar sesión"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Brand className="text-base" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t border-border p-3">
          <UserFooter />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Brand className="text-base" />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <UserFooter />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-4" />
          </Button>
          <Brand className="text-base" />
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
