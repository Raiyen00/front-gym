import type { MetodoPago } from './enums'

/** Espejo de `PaymentResponse`. */
export interface Payment {
  id: number
  user_id: number
  amount: number
  payment_method: MetodoPago
  /** ISO 8601 */
  payment_date: string
  /** ISO 8601 */
  expiration_date: string
}

/** Espejo de `PaymentCreate`. */
export interface PaymentCreate {
  user_id: number
  amount: number
  payment_method: MetodoPago
  expiration_date: string
}
