import { Loader2, Receipt } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePayment } from '@/features/payments/queries'
import { PaymentDetails } from '@/features/payments/components/PaymentDetails'
import { getErrorMessage } from '@/features/auth/utils'

interface PaymentDetailDialogProps {
  paymentId: number | null
  getUserLabel: (userId: number) => string
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailDialog({
  paymentId,
  getUserLabel,
  onOpenChange,
}: PaymentDetailDialogProps) {
  const { data: payment, isLoading, error } = usePayment(paymentId ?? 0)

  return (
    <Dialog open={paymentId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-4 text-text-muted" strokeWidth={1.75} />
            Detalle del pago
          </DialogTitle>
          <DialogDescription>
            {payment ? `ID ${payment.id}` : 'Información registrada'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-destructive">{getErrorMessage(error)}</div>
        ) : payment ? (
          <PaymentDetails payment={payment} userLabel={getUserLabel(payment.user_id)} />
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
