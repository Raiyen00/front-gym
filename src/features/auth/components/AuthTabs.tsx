import { cn } from '@/lib/utils'

export type AuthTab = 'login' | 'register'

interface AuthTabsProps {
  value: AuthTab
  onChange: (value: AuthTab) => void
}

const TABS: { value: AuthTab; label: string }[] = [
  { value: 'login', label: 'Iniciar sesión' },
  { value: 'register', label: 'Registrar socio' },
]

export function AuthTabs({ value, onChange }: AuthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Modo de acceso"
      className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-input-bg p-1"
    >
      {TABS.map((tab) => {
        const active = value === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'h-8 rounded-md text-[0.8125rem] transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none',
              active
                ? 'bg-surface-elevated font-medium text-foreground'
                : 'font-normal text-text-muted hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
