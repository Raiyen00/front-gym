import { Loader2, Receipt } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from '@/features/users/queries'
import { paymentFormSchema, type PaymentFormValues } from '@/features/payments/schema'
import {
  buildPaymentCreate,
  defaultExpirationDate,
} from '@/features/payments/payload'
import { METODOS_PAGO, METODO_PAGO_LABELS } from '@/types/enums'
import type { PaymentCreate } from '@/types/payment'

interface PaymentFormDialogProps {
  open: boolean
  isPending: boolean
  onSubmit: (payload: PaymentCreate) => Promise<void>
  onOpenChange: (open: boolean) => void
}

const DEFAULT_VALUES: Omit<PaymentFormValues, 'expiration_date'> = {
  user_id: '',
  amount: '',
  payment_method: 'efectivo',
}

export function PaymentFormDialog({
  open,
  isPending,
  onSubmit,
  onOpenChange,
}: PaymentFormDialogProps) {
  const { data: users } = useUsers()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { ...DEFAULT_VALUES, expiration_date: defaultExpirationDate() },
  })

  async function handleSubmit(values: PaymentFormValues) {
    await onSubmit(buildPaymentCreate(values))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-4 text-text-muted" strokeWidth={1.75} />
            Registrar pago
          </DialogTitle>
          <DialogDescription>
            El pago queda asociado a un socio y vence en la fecha indicada.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Socio</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Elegí un socio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} {user.lastname} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        inputMode="decimal"
                        placeholder="15000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pago</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Elegí un método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {METODOS_PAGO.map((method) => (
                          <SelectItem key={method} value={method}>
                            {METODO_PAGO_LABELS[method]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiration_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vencimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Receipt className="size-3.5" />
                    Registrar pago
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
