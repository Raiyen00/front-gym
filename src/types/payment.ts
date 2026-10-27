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

/**
 * Forma cruda que puede devolver la API: los `Decimal` de Pydantic a veces
 * viajan como string. La capa de API normaliza a `Payment`.
 */
export type PaymentWire = Omit<Payment, 'amount'> & {
  amount: number | string
}

/** Espejo de `PaymentCreate`. */
export interface PaymentCreate {
  user_id: number
  amount: number
  payment_method: MetodoPago
  expiration_date: string
}
