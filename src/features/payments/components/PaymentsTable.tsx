import { Eye } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { METODO_PAGO_LABELS } from '@/types/enums'
import { PaymentStatusBadge } from '@/features/payments/components/PaymentDetails'
import type { Payment } from '@/types/payment'

interface PaymentsTableProps {
  payments: Payment[]
  getUserLabel: (userId: number) => string
  onView: (payment: Payment) => void
}

export function PaymentsTable({ payments, getUserLabel, onView }: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
        <p className="text-[0.875rem] font-medium text-foreground">
          No hay pagos para mostrar
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          Probá con otra búsqueda o registrá un pago nuevo.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Socio</TableHead>
          <TableHead className="num text-right">Monto</TableHead>
          <TableHead className="hidden md:table-cell">Método</TableHead>
          <TableHead className="num hidden text-right sm:table-cell">Pagado</TableHead>
          <TableHead className="num hidden text-right lg:table-cell">Vence</TableHead>
          <TableHead className="hidden sm:table-cell">Estado</TableHead>
          <TableHead className="w-12 pr-5 text-right">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="min-w-0 pl-5 whitespace-normal">
              <p className="text-[0.875rem] font-medium text-foreground">
                {getUserLabel(payment.user_id)}
              </p>
              <p className="num mt-0.5 text-[0.8125rem] text-text-muted md:hidden">
                {METODO_PAGO_LABELS[payment.payment_method]} ·{' '}
                {formatDate(payment.payment_date)} · vence {formatDate(payment.expiration_date)}
              </p>
              <div className="mt-1.5 sm:hidden">
                <PaymentStatusBadge payment={payment} />
              </div>
            </TableCell>
            <TableCell className="num text-right text-[0.875rem] font-medium text-foreground">
              {formatCurrency(payment.amount)}
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
            <TableCell className="hidden sm:table-cell">
              <PaymentStatusBadge payment={payment} />
            </TableCell>
            <TableCell className="pr-5 text-right">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onView(payment)}
                aria-label={`Ver pago de ${getUserLabel(payment.user_id)}`}
              >
                <Eye className="size-4" strokeWidth={1.75} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
