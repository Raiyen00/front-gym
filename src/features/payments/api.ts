import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type { Payment, PaymentCreate, PaymentWire } from '@/types/payment'

const BASE = ENDPOINTS.PAYMENTS

/**
 * La API serializa los `Decimal` como string (`"15000.00"`). Normalizamos
 * en el borde para que el resto de la app siempre sume números y los totales
 * no terminen en `NaN`.
 */
function normalizePayment(payment: PaymentWire): Payment {
  const amount = Number(payment.amount)
  return { ...payment, amount: Number.isFinite(amount) ? amount : 0 }
}

function normalizePayments(payments: PaymentWire[]): Payment[] {
  return payments.map(normalizePayment)
}

/** GET /payment — admin, historial completo. */
export async function getPayments(): Promise<Payment[]> {
  const payments = await request<PaymentWire[]>(BASE)
  return normalizePayments(payments)
}

/** GET /payment/me — autenticado, solo los pagos propios. */
export async function getMyPayments(): Promise<Payment[]> {
  const payments = await request<PaymentWire[]>(`${BASE}/me`)
  return normalizePayments(payments)
}

/** GET /payment/{id} — admin. */
export async function getPayment(id: number): Promise<Payment> {
  const payment = await request<PaymentWire>(`${BASE}/${id}`)
  return normalizePayment(payment)
}

/** POST /payment — admin, 201. `payment_date` lo genera el backend. */
export async function createPayment(data: PaymentCreate): Promise<Payment> {
  const payment = await request<PaymentWire>(BASE, {
    method: 'POST',
    body: data,
  })
  return normalizePayment(payment)
}
