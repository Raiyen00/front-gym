import { CalendarClock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  EXPIRING_WINDOW_DAYS,
  getExpiringMemberships,
} from '@/features/payments/insights'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Payment } from '@/types/payment'

interface ExpiringMembershipsCardProps {
  payments: Payment[]
  getUserLabel: (userId: number) => string
  now?: Date
  windowDays?: number
}

function urgencyLabel(daysLeft: number): string {
  if (daysLeft === 0) return 'Vence hoy'
  if (daysLeft === 1) return 'Vence mañana'
  return `Vence en ${daysLeft} días`
}

/** Socios cuya última membresía está por vencer dentro de la ventana. */
export function ExpiringMembershipsCard({
  payments,
  getUserLabel,
  now = new Date(),
  windowDays = EXPIRING_WINDOW_DAYS,
}: ExpiringMembershipsCardProps) {
  const expiring = getExpiringMemberships(payments, now, windowDays)

  return (
    <section
      className="overflow-hidden rounded-xl bg-card"
      aria-label="Membresías por vencer"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock
            className="size-4 text-text-muted"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <h2 className="text-[0.9375rem] font-semibold text-foreground">
            Membresías por vencer
          </h2>
        </div>
        <p className="num text-xs text-text-muted">
          {expiring.length} {expiring.length === 1 ? 'socio' : 'socios'} en los
          próximos {windowDays} días
        </p>
      </header>

      {expiring.length === 0 ? (
        <p className="px-5 py-8 text-center text-[0.8125rem] text-text-muted">
          Ninguna membresía vence en los próximos {windowDays} días.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {expiring.map(({ user_id, payment, daysLeft }) => (
            <li
              key={user_id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-[0.875rem] font-medium text-foreground">
                  {getUserLabel(user_id)}
                </p>
                <p className="num mt-0.5 text-[0.8125rem] text-text-muted">
                  Vence el {formatDate(payment.expiration_date)} ·{' '}
                  {formatCurrency(payment.amount)}
                </p>
              </div>
              <Badge variant={daysLeft <= 1 ? 'destructive' : 'warning'}>
                {urgencyLabel(daysLeft)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
