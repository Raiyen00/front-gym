import { describe, expect, it } from 'vitest'

import { buildPaymentCreate, defaultExpirationDate } from '@/features/payments/payload'

describe('payments payload', () => {
  it('defaultExpirationDate suma 30 días en formato de input date', () => {
    expect(defaultExpirationDate(new Date(2026, 0, 1))).toBe('2026-01-31')
    expect(defaultExpirationDate(new Date(2026, 11, 20))).toBe('2027-01-19')
  })

  it('buildPaymentCreate convierte monto con coma y fecha a datetime', () => {
    expect(
      buildPaymentCreate({
        user_id: '7',
        amount: '1500,50',
        payment_method: 'transferencia',
        expiration_date: '2026-12-31',
      }),
    ).toEqual({
      user_id: 7,
      amount: 1500.5,
      payment_method: 'transferencia',
      expiration_date: '2026-12-31T00:00:00',
    })
  })

  it('buildPaymentCreate no incluye payment_date', () => {
    const payload = buildPaymentCreate({
      user_id: '3',
      amount: '10000',
      payment_method: 'tarjeta',
      expiration_date: '2026-11-30',
    })

    expect(payload).not.toHaveProperty('payment_date')
  })
})
