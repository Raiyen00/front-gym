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
      className="mb-5 flex gap-0.5 rounded-md border border-border bg-surface-elevated p-0.5"
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
              'flex-1 rounded-[6px] px-3 py-[0.45rem] text-[0.825rem] font-medium transition-colors',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
