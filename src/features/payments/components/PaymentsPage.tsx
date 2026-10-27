import { CreditCard, Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaymentsTable } from '@/features/payments/components/PaymentsTable'
import { PaymentFormDialog } from '@/features/payments/components/PaymentFormDialog'
import { PaymentDetailDialog } from '@/features/payments/components/PaymentDetailDialog'
import { MonthlySeriesCard } from '@/features/payments/components/MonthlySeriesCard'
import { ExpiringMembershipsCard } from '@/features/payments/components/ExpiringMembershipsCard'
import { useCreatePayment, usePayments } from '@/features/payments/queries'
import {
  buildMonthlySeries,
  EXPIRING_WINDOW_DAYS,
  getExpiringMemberships,
} from '@/features/payments/insights'
import { countExpiredMemberships } from '@/features/payments/membership'
import { useUsers } from '@/features/users/queries'
import { getErrorMessage } from '@/features/auth/utils'
import { formatCurrency } from '@/lib/formatters'
import { METODO_PAGO_LABELS } from '@/types/enums'
import type { Payment, PaymentCreate } from '@/types/payment'
import { cn } from '@/lib/utils'

export function PaymentsPage() {
  const { data: payments, isLoading, error, refetch } = usePayments()
  const { data: users } = useUsers()
  const createPayment = useCreatePayment()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [viewingId, setViewingId] = useState<number | null>(null)

  const now = new Date()
  const allPayments = payments ?? []

  const userLabel = (userId: number) => {
    const user = users?.find((item) => item.id === userId)
    return user ? `${user.name} ${user.lastname}` : `Socio #${userId}`
  }

  const monthPayments = allPayments.filter((payment) => {
    const date = new Date(payment.payment_date)
    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    )
  })
  const collectedThisMonth = monthPayments.reduce((total, payment) => {
    const amount = Number(payment.amount)
    return Number.isFinite(amount) ? total + amount : total
  }, 0)
  const expiredMemberships = countExpiredMemberships(allPayments, now)
  const expiringMemberships = getExpiringMemberships(allPayments, now)
  const monthlySeries = buildMonthlySeries(allPayments, { now })

  const filtered = allPayments
    .filter((payment) => {
      const haystack = `${userLabel(payment.user_id)} ${
        METODO_PAGO_LABELS[payment.payment_method]
      }`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    })
    .sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    )

  async function handleSubmit(payload: PaymentCreate) {
    try {
      await createPayment.mutateAsync(payload)
      toast.success('Pago registrado')
      setFormOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando pagos</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">No se pudieron cargar los pagos.</p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  const monthLabel = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(now)

  const stats = [
    {
      label: 'Recaudado este mes',
      value: formatCurrency(collectedThisMonth),
      caption: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      lead: true,
    },
    {
      label: 'Pagos este mes',
      value: String(monthPayments.length),
      caption: 'cuotas registradas',
      lead: false,
    },
    {
      label: 'Por vencer',
      value: String(expiringMemberships.length),
      caption: `próximos ${EXPIRING_WINDOW_DAYS} días`,
      lead: false,
    },
    {
      label: 'Membresías vencidas',
      value: String(expiredMemberships),
      caption: 'socios sin cuota vigente',
      lead: false,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
            Pagos
          </h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Recaudación del mes, altas de cuotas y vencimientos.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" strokeWidth={2} />
          Registrar pago
        </Button>
      </header>

      <section
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border lg:grid-cols-4"
        aria-label="Resumen de pagos"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card px-5 py-5">
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p
              className={cn(
                'num mt-2.5 font-medium tracking-[-0.02em] text-foreground',
                stat.lead ? 'text-[2rem] leading-none' : 'text-[1.375rem] leading-none',
              )}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-text-muted">{stat.caption}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <MonthlySeriesCard
          title="Recaudación mensual"
          caption="Últimos 6 meses"
          series={monthlySeries}
          getValue={(stat) => stat.collected}
          formatValue={formatCurrency}
        />
        <MonthlySeriesCard
          title="Clientes activos por mes"
          caption="Socios que pagaron"
          series={monthlySeries}
          getValue={(stat) => stat.clients}
          formatValue={(value) => `${value} ${value === 1 ? 'socio' : 'socios'}`}
          tone="ring"
        />
      </div>

      <ExpiringMembershipsCard
        payments={allPayments}
        getUserLabel={userLabel}
        now={now}
      />

      <section
        className="overflow-hidden rounded-xl bg-card"
        aria-label="Historial de pagos"
      >
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CreditCard
              className="size-4 text-text-muted"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <h2 className="text-[0.9375rem] font-semibold text-foreground">
              Historial de pagos
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <p className="num order-2 text-xs text-text-muted sm:order-1">
              {filtered.length} de {allPayments.length} pagos
            </p>
            <div className="relative order-1 w-full sm:order-2 sm:w-[17rem]">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
                strokeWidth={1.75}
              />
              <Input
                placeholder="Buscar por socio o método"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 pl-9"
                aria-label="Buscar pagos"
              />
            </div>
          </div>
        </div>

        <PaymentsTable
          payments={filtered}
          getUserLabel={userLabel}
          onView={(payment: Payment) => setViewingId(payment.id)}
        />
      </section>

      <PaymentFormDialog
        key={formOpen ? 'abierto' : 'cerrado'}
        open={formOpen}
        isPending={createPayment.isPending}
        onSubmit={handleSubmit}
        onOpenChange={setFormOpen}
      />

      <PaymentDetailDialog
        paymentId={viewingId}
        getUserLabel={userLabel}
        onOpenChange={(open) => {
          if (!open) setViewingId(null)
        }}
      />
    </div>
  )
}
