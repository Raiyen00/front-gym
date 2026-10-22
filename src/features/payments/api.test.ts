import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import {
  createPayment,
  getMyPayments,
  getPayment,
  getPayments,
} from '@/features/payments/api'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const PAYMENT = {
  id: 9,
  user_id: 7,
  amount: 15000,
  payment_method: 'efectivo',
  payment_date: '2026-10-01T10:00:00Z',
  expiration_date: '2026-10-31T00:00:00Z',
}

describe('payments api', () => {
  it('getPayments hace GET /payment', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/payment`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([PAYMENT])
      }),
    )

    const payments = await getPayments()

    expect(path).toBe('/payment')
    expect(payments[0]?.id).toBe(9)
  })

  it('getMyPayments hace GET /payment/me', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/payment/me`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([PAYMENT])
      }),
    )

    const payments = await getMyPayments()

    expect(path).toBe('/payment/me')
    expect(payments).toHaveLength(1)
  })

  it('getPayment hace GET /payment/{id}', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/payment/9`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json(PAYMENT)
      }),
    )

    const payment = await getPayment(9)

    expect(path).toBe('/payment/9')
    expect(payment.user_id).toBe(7)
  })

  it('createPayment hace POST con el body del contrato y sin payment_date', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/payment`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...PAYMENT, id: 12 }, { status: 201 })
      }),
    )

    const created = await createPayment({
      user_id: 7,
      amount: 15000,
      payment_method: 'tarjeta',
      expiration_date: '2026-11-30T00:00:00',
    })

    expect(method).toBe('POST')
    expect(payload).toEqual({
      user_id: 7,
      amount: 15000,
      payment_method: 'tarjeta',
      expiration_date: '2026-11-30T00:00:00',
    })
    expect(payload).not.toHaveProperty('payment_date')
    expect(created.id).toBe(12)
  })

  it('propaga el 403 con el detail del backend', async () => {
    server.use(
      http.post(`${BASE}/payment`, () =>
        HttpResponse.json(
          { detail: 'No tenés permisos para realizar esta operación. Solo Administradores.' },
          { status: 403 },
        ),
      ),
    )

    await expect(
      createPayment({
        user_id: 7,
        amount: 15000,
        payment_method: 'efectivo',
        expiration_date: '2026-11-30T00:00:00',
      }),
    ).rejects.toThrow(
      'No tenés permisos para realizar esta operación. Solo Administradores.',
    )
  })
})
