import type { PaymentCreate } from '@/types/payment'
import type { PaymentFormValues } from '@/features/payments/schema'

function toInputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Vencimiento sugerido: hoy + 30 días, en formato de `<input type="date">`. */
export function defaultExpirationDate(now: Date = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  date.setDate(date.getDate() + 30)
  return toInputDate(date)
}

/**
 * Convierte el formulario al body de `POST /payment`.
 * No incluye `payment_date` (lo genera el servidor) y la fecha de vencimiento
 * viaja como datetime ISO local (`YYYY-MM-DDT00:00:00`).
 */
export function buildPaymentCreate(values: PaymentFormValues): PaymentCreate {
  return {
    user_id: Number(values.user_id),
    amount: Number(values.amount.replace(',', '.')),
    payment_method: values.payment_method,
    expiration_date: `${values.expiration_date}T00:00:00`,
  }
}
