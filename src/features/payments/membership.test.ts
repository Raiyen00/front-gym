import { describe, expect, it } from 'vitest'

import {
  countExpiredMemberships,
  daysUntilExpiration,
  getLatestPaymentsByUser,
  getMembershipStatus,
  getPaymentStatus,
  isPaymentActive,
} from '@/features/payments/membership'
import type { Payment } from '@/types/payment'

const NOW = new Date(2026, 9, 21) // 21/10/2026

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    user_id: 7,
    amount: 15000,
    payment_method: 'efectivo',
    payment_date: '2026-10-01T10:00:00',
    expiration_date: '2026-10-31T00:00:00',
    ...overrides,
  }
}

describe('payments membership', () => {
  it('daysUntilExpiration compara por día calendario', () => {
    expect(daysUntilExpiration('2026-10-21T00:00:00', NOW)).toBe(0)
    expect(daysUntilExpiration('2026-10-31T00:00:00', NOW)).toBe(10)
    expect(daysUntilExpiration('2026-10-20T23:59:00', NOW)).toBe(-1)
  })

  it('getPaymentStatus distingue vigente, vence hoy y vencida', () => {
    expect(getPaymentStatus(payment({ expiration_date: '2026-10-31T00:00:00' }), NOW).kind).toBe(
      'vigente',
    )
    expect(getPaymentStatus(payment({ expiration_date: '2026-10-21T00:00:00' }), NOW).kind).toBe(
      'vence_hoy',
    )
    expect(getPaymentStatus(payment({ expiration_date: '2026-10-01T00:00:00' }), NOW).kind).toBe(
      'vencida',
    )
  })

  it('isPaymentActive considera activo el que vence hoy', () => {
    expect(isPaymentActive(payment({ expiration_date: '2026-10-21T00:00:00' }), NOW)).toBe(true)
    expect(isPaymentActive(payment({ expiration_date: '2026-10-20T00:00:00' }), NOW)).toBe(false)
  })

  it('getLatestPaymentsByUser deja el pago con vencimiento más lejano', () => {
    const latest = getLatestPaymentsByUser([
      payment({ id: 1, user_id: 7, expiration_date: '2026-09-30T00:00:00' }),
      payment({ id: 2, user_id: 7, expiration_date: '2026-12-31T00:00:00' }),
      payment({ id: 3, user_id: 8, expiration_date: '2026-10-15T00:00:00' }),
    ])

    expect(latest).toHaveLength(2)
    expect(latest.find((item) => item.user_id === 7)?.id).toBe(2)
    expect(latest.find((item) => item.user_id === 8)?.id).toBe(3)
  })

  it('countExpiredMemberships cuenta socios (no pagos) con la última vencida', () => {
    const count = countExpiredMemberships(
      [
        payment({ id: 1, user_id: 7, expiration_date: '2026-09-01T00:00:00' }),
        payment({ id: 2, user_id: 7, expiration_date: '2026-12-31T00:00:00' }),
        payment({ id: 3, user_id: 8, expiration_date: '2026-10-01T00:00:00' }),
        payment({ id: 4, user_id: 9, expiration_date: '2026-11-01T00:00:00' }),
      ],
      NOW,
    )

    expect(count).toBe(1)
  })

  it('getMembershipStatus devuelve sin_pagos sin historial', () => {
    const status = getMembershipStatus([], NOW)

    expect(status.kind).toBe('sin_pagos')
    expect(status.expirationDate).toBeNull()
    expect(status.payment).toBeNull()
  })

  it('getMembershipStatus usa el último vencimiento del historial', () => {
    const status = getMembershipStatus(
      [
        payment({ id: 1, expiration_date: '2026-09-01T00:00:00' }),
        payment({ id: 2, expiration_date: '2026-11-15T00:00:00' }),
      ],
      NOW,
    )

    expect(status.kind).toBe('vigente')
    expect(status.label).toBe('Membresía vigente')
    expect(status.daysLeft).toBe(25)
    expect(status.expirationDate).toBe('2026-11-15T00:00:00')
  })

  it('getMembershipStatus marca vencida la última membresía', () => {
    const status = getMembershipStatus(
      [payment({ expiration_date: '2026-10-01T00:00:00' })],
      NOW,
    )

    expect(status.kind).toBe('vencida')
    expect(status.label).toBe('Membresía vencida')
  })
})
