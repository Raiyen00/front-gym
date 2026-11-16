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

/** Fecha de hoy (hora local) en formato `YYYY-MM-DD`. */
export function todayInputDate(now: Date = new Date()): string {
  return toInputDate(now)
}

/** Fecha de mañana (hora local) en formato `YYYY-MM-DD`. */
export function tomorrowInputDate(now: Date = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  date.setDate(date.getDate() + 1)
  return toInputDate(date)
}

/**
 * Convierte el formulario al body de `POST /payment`.
 * No incluye `payment_date` (lo genera el servidor) y la fecha de vencimiento
 * viaja como datetime ISO naive a las 23:59:59. El back la compara contra
 * `datetime.now(timezone.utc)`: con `T00:00:00`, un vencimiento "mañana"
 * elegido de noche en Argentina (UTC-3) caía en el pasado y daba un 422 falso.
 */
export function buildPaymentCreate(values: PaymentFormValues): PaymentCreate {
  return {
    user_id: Number(values.user_id),
    amount: Number(values.amount.replace(',', '.')),
    payment_method: values.payment_method,
    expiration_date: `${values.expiration_date}T23:59:59`,
  }
}
