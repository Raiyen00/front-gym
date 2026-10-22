import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type { Payment, PaymentCreate } from '@/types/payment'

const BASE = ENDPOINTS.PAYMENTS

/** GET /payment — admin, historial completo. */
export function getPayments(): Promise<Payment[]> {
  return request<Payment[]>(BASE)
}

/** GET /payment/me — autenticado, solo los pagos propios. */
export function getMyPayments(): Promise<Payment[]> {
  return request<Payment[]>(`${BASE}/me`)
}

/** GET /payment/{id} — admin. */
export function getPayment(id: number): Promise<Payment> {
  return request<Payment>(`${BASE}/${id}`)
}

/** POST /payment — admin, 201. `payment_date` lo genera el backend. */
export function createPayment(data: PaymentCreate): Promise<Payment> {
  return request<Payment>(BASE, {
    method: 'POST',
    body: data,
  })
}
