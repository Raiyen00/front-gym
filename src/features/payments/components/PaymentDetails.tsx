import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { METODO_PAGO_LABELS } from '@/types/enums'
import { getPaymentStatus } from '@/features/payments/membership'
import type { Payment } from '@/types/payment'

const BADGE_VARIANTS = {
  vigente: 'default',
  vence_hoy: 'secondary',
  vencida: 'destructive',
} as const

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0 last:pb-0">
      <span className="text-[0.8125rem] text-text-muted">{label}</span>
      <span className="text-right text-[0.8125rem] font-medium text-foreground">
        {children}
      </span>
    </div>
  )
}

interface PaymentStatusBadgeProps {
  payment: Payment
  now?: Date
}

/** Badge de estado reutilizable en tablas y detalles. */
export function PaymentStatusBadge({ payment, now }: PaymentStatusBadgeProps) {
  const status = getPaymentStatus(payment, now)
  return <Badge variant={BADGE_VARIANTS[status.kind]}>{status.label}</Badge>
}

interface PaymentDetailsProps {
  payment: Payment
  userLabel?: string
}

/** Detalle de solo lectura de un pago. */
export function PaymentDetails({ payment, userLabel }: PaymentDetailsProps) {
  return (
    <div className="grid gap-0 text-sm">
      {userLabel && <Field label="Socio">{userLabel}</Field>}
      <Field label="Monto">
        <span className="num">{formatCurrency(payment.amount)}</span>
      </Field>
      <Field label="Método de pago">{METODO_PAGO_LABELS[payment.payment_method]}</Field>
      <Field label="Fecha de pago">
        <span className="num">{formatDate(payment.payment_date)}</span>
      </Field>
      <Field label="Vencimiento">
        <span className="num">{formatDate(payment.expiration_date)}</span>
      </Field>
      <Field label="Estado">
        <PaymentStatusBadge payment={payment} />
      </Field>
    </div>
  )
}
