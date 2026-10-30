import { useState } from 'react'
import { KeyRound, LogOut, Menu, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { ApiUrlBadge } from '@/components/ApiUrlBadge'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'
import {
  NAV_ITEMS,
  NAV_SECTIONS,
  NAV_SECTION_LABELS,
  type NavItem,
} from '@/config/nav'
import { ROL_LABELS } from '@/types/enums'
import { ChangePasswordDialog } from '@/features/auth/components/ChangePasswordDialog'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter(
    (item) => user && item.allowedRoles.includes(user.rol),
  )

  return (
    <nav className="flex flex-col">
      {NAV_SECTIONS.map((section, index) => {
        const sectionItems = items.filter((item) => item.section === section)
        if (sectionItems.length === 0) return null

        return (
          <div
            key={section}
            className={cn('flex flex-col gap-0.5', index > 0 && 'mt-7')}
          >
            <p className="mb-2 px-3 text-xs text-text-muted">
              {user?.rol === 'cliente' && section === 'gestion'
                ? 'Entrenamiento'
                : NAV_SECTION_LABELS[section]}
            </p>
            {sectionItems.map((item) => (
              <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function NavItemLink({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate?: () => void
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex h-9 items-center gap-2.5 rounded-md px-3 text-[0.8125rem] transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none',
          isActive
            ? 'bg-surface text-[0.8125rem] font-medium text-foreground'
            : 'font-normal text-muted-foreground hover:bg-surface/70 hover:text-foreground',
        )
      }
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      {item.label}
    </NavLink>
  )
}

function Initials({ name, lastname }: { name?: string; lastname?: string }) {
  const initials =
    `${name?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase() || 'US'
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[0.6875rem] font-semibold tracking-wide text-foreground"
    >
      {initials}
    </span>
  )
}

function UserFooter() {
  const { user, logout } = useAuth()
  const [passwordOpen, setPasswordOpen] = useState(false)

  function handleLogout() {
    logout()
    toast.info('Sesión cerrada correctamente')
  }

  return (
    <>
      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
      <div className="flex items-center gap-2.5">
        <Initials name={user?.name} lastname={user?.lastname} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] font-medium text-foreground">
            {user ? `${user.name} ${user.lastname}` : 'Usuario'}
          </p>
          <p className="truncate text-xs text-text-muted">
            {user ? ROL_LABELS[user.rol] : ''}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setPasswordOpen(true)}
          aria-label="Cambiar contraseña"
          title="Cambiar contraseña"
          className="text-text-muted hover:text-foreground"
        >
          <KeyRound className="size-4" strokeWidth={1.75} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="text-text-muted hover:text-foreground"
        >
          <LogOut className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </>
  )
}

function PageContext() {
  const location = useLocation()
  const current = NAV_ITEMS.find((item) => item.to === location.pathname)

  return (
    <div className="flex min-w-0 items-baseline gap-2.5">
      <span className="hidden text-xs text-text-muted sm:inline">
        {current ? NAV_SECTION_LABELS[current.section] : 'GymSasS'}
      </span>
      <span
        className="hidden text-xs text-border-muted sm:inline"
        aria-hidden="true"
      >
        /
      </span>
      <span className="truncate text-[0.8125rem] font-medium text-foreground">
        {current?.label ?? 'Panel'}
      </span>
    </div>
  )
}

function MobileSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute top-0 left-0 flex h-full w-[17.5rem] flex-col bg-background">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Brand />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="text-text-muted hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavLinks onNavigate={onClose} />
        </div>
        <div className="shrink-0 border-t border-border px-4 py-4">
          <UserFooter />
        </div>
      </aside>
    </div>
  )
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[15rem] shrink-0 flex-col border-r border-border md:flex">
        <div className="flex h-16 shrink-0 items-center px-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavLinks />
        </div>
        <div className="shrink-0 border-t border-border px-4 py-4">
          <UserFooter />
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
            <span className="text-[0.6875rem] text-text-muted">v0.1</span>
            <ApiUrlBadge />
          </div>
        </div>
      </aside>

      <MobileSheet open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-5 md:px-8">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="-ml-2 text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="size-4" />
          </Button>
          <Brand compact className="md:hidden" />
          <span
            className="h-5 w-px bg-border md:hidden"
            aria-hidden="true"
          />
          <div className="md:hidden">
            <PageContext />
          </div>
          <div className="hidden md:block">
            <PageContext />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Initials name={user?.name} lastname={user?.lastname} />
              <div className="hidden leading-tight sm:block">
                <p className="text-[0.8125rem] font-medium text-foreground">
                  {user?.name} {user?.lastname}
                </p>
                <p className="text-xs text-text-muted">
                  {user ? ROL_LABELS[user.rol] : ''}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="app-canvas mx-auto w-full max-w-[1400px] py-8 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
