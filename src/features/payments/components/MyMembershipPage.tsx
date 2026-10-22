import { CreditCard, Info, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMyPayments } from '@/features/payments/queries'
import { getMembershipStatus } from '@/features/payments/membership'
import { PaymentStatusBadge } from '@/features/payments/components/PaymentDetails'
import { getErrorMessage } from '@/features/auth/utils'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { METODO_PAGO_LABELS } from '@/types/enums'
import { cn } from '@/lib/utils'

export function MyMembershipPage() {
  const { data: payments, isLoading, error, refetch } = useMyPayments()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando membresía</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">
          No se pudo cargar tu membresía.
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  const history = [...(payments ?? [])].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
  )
  const status = getMembershipStatus(history)
  const isActive = status.kind === 'vigente' || status.kind === 'vence_hoy'
  const isExpired = status.kind === 'vencida'

  const StatusIcon =
    status.kind === 'sin_pagos' ? CreditCard : isActive ? ShieldCheck : ShieldAlert

  const detail =
    status.kind === 'sin_pagos'
      ? 'Todavía no hay pagos registrados a tu nombre.'
      : status.kind === 'vencida'
        ? `Venció el ${formatDate(status.expirationDate)}.`
        : status.kind === 'vence_hoy'
          ? `Vence hoy (${formatDate(status.expirationDate)}).`
          : `Vigente hasta el ${formatDate(status.expirationDate)}${
              status.daysLeft !== null ? ` · ${status.daysLeft} días restantes` : ''
            }.`

  return (
    <div className="flex flex-col gap-6 lg:max-w-4xl">
      <header>
        <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
          Mi membresía
        </h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">
          Estado de tu cuota e historial de pagos.
        </p>
      </header>

      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          Los pagos los registra un administrador. Esta información es de solo
          lectura.
        </AlertDescription>
      </Alert>

      <section className="rounded-xl bg-card px-6 py-6">
        <p className="text-xs text-text-muted">Estado de tu cuota</p>
        <div className="mt-2 flex items-start gap-3">
          <StatusIcon
            className={cn(
              'mt-1 size-5 shrink-0',
              isActive
                ? 'text-state-positive-ink'
                : isExpired
                  ? 'text-state-negative-ink'
                  : 'text-text-muted',
            )}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p
              className={cn(
                'text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]',
                isActive
                  ? 'text-foreground'
                  : isExpired
                    ? 'text-state-negative-ink'
                    : 'text-foreground',
              )}
            >
              {status.label}
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {detail}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[0.9375rem] font-semibold text-foreground">
            Historial de pagos
            <span className="num ml-2 text-xs font-normal text-text-muted">
              {history.length}
            </span>
          </h2>
        </div>
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
            <p className="text-[0.875rem] font-medium text-foreground">
              Todavía no tenés pagos registrados
            </p>
            <p className="text-[0.8125rem] text-muted-foreground">
              Cuando el gimnasio registre tu cuota, va a aparecer acá.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Monto</TableHead>
                <TableHead className="hidden md:table-cell">Método</TableHead>
                <TableHead className="num hidden text-right sm:table-cell">Pagado</TableHead>
                <TableHead className="num hidden text-right lg:table-cell">Vence</TableHead>
                <TableHead className="pr-5 text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="pl-5">
                    <p className="num text-[0.875rem] font-medium text-foreground">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="num mt-0.5 text-xs text-text-muted md:hidden">
                      {METODO_PAGO_LABELS[payment.payment_method]} ·{' '}
                      {formatDate(payment.payment_date)}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-[0.8125rem] text-muted-foreground md:table-cell">
                    {METODO_PAGO_LABELS[payment.payment_method]}
                  </TableCell>
                  <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground sm:table-cell">
                    {formatDate(payment.payment_date)}
                  </TableCell>
                  <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground lg:table-cell">
                    {formatDate(payment.expiration_date)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <PaymentStatusBadge payment={payment} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
