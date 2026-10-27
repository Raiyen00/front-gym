import { describe, expect, it } from 'vitest'

import {
  EXPIRING_WINDOW_DAYS,
  buildMonthlySeries,
  getExpiringMemberships,
} from '@/features/payments/insights'
import type { Payment } from '@/types/payment'

/** 25/10/2026: el mes actual de la serie es octubre. */
const NOW = new Date(2026, 9, 25, 12, 0, 0)

function makePayment(
  overrides: Partial<Payment> & { id: number },
): Payment {
  return {
    user_id: 1,
    amount: 1000,
    payment_method: 'efectivo',
    payment_date: '2026-10-01T12:00:00',
    expiration_date: '2026-10-31T00:00:00',
    ...overrides,
  }
}

describe('buildMonthlySeries', () => {
  it('genera los últimos 6 meses en orden cronológico, incluido el actual', () => {
    const series = buildMonthlySeries([], { now: NOW })

    expect(series.map((stat) => stat.key)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ])
    expect(series.map((stat) => stat.label)).toEqual([
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sept',
      'Oct',
    ])
    expect(series[5]?.fullLabel).toBe('Octubre de 2026')
    // Meses sin pagos: en cero, pero igual aparecen en la serie.
    expect(
      series.every(
        (stat) =>
          stat.collected === 0 && stat.payments === 0 && stat.clients === 0,
      ),
    ).toBe(true)
  })

  it('suma por mes, cuenta pagos y socios distintos y salta lo que está fuera de la ventana', () => {
    const series = buildMonthlySeries(
      [
        makePayment({
          id: 1,
          user_id: 1,
          amount: 15000,
          payment_date: '2026-10-05T12:00:00',
        }),
        makePayment({
          id: 2,
          user_id: 2,
          amount: 20000,
          payment_date: '2026-10-20T12:00:00',
        }),
        // Mismo socio otra vez en octubre: no debe sumar un socio más.
        makePayment({
          id: 4,
          user_id: 1,
          amount: 1000,
          payment_date: '2026-10-25T12:00:00',
        }),
        makePayment({
          id: 3,
          user_id: 1,
          amount: 5000,
          payment_date: '2026-09-10T12:00:00',
        }),
        // Fuera de la ventana (enero) y fecha inválida: no cuentan.
        makePayment({
          id: 5,
          user_id: 9,
          amount: 9999,
          payment_date: '2026-01-15T12:00:00',
        }),
        makePayment({ id: 6, user_id: 9, amount: 9999, payment_date: 'fecha-invalida' }),
      ],
      { now: NOW },
    )

    expect(series[5]).toMatchObject({
      key: '2026-10',
      collected: 15000 + 20000 + 1000,
      payments: 3,
      clients: 2,
    })
    expect(series[4]).toMatchObject({
      key: '2026-09',
      collected: 5000,
      payments: 1,
      clients: 1,
    })
    expect(
      series
        .slice(0, 4)
        .every((stat) => stat.collected === 0 && stat.clients === 0),
    ).toBe(true)
  })

  it('permite cambiar la cantidad de meses', () => {
    const series = buildMonthlySeries([], { months: 3, now: NOW })

    expect(series).toHaveLength(3)
    expect(series[0]?.key).toBe('2026-08')
    expect(series[2]?.key).toBe('2026-10')
  })
})

describe('getExpiringMemberships', () => {
  it('devuelve las membresías dentro de la ventana, de la más próxima a la más lejana', () => {
    const list = getExpiringMemberships(
      [
        makePayment({ id: 1, user_id: 1, expiration_date: '2026-10-28T00:00:00' }),
        makePayment({ id: 2, user_id: 2, expiration_date: '2026-10-25T00:00:00' }),
        makePayment({ id: 3, user_id: 3, expiration_date: '2026-11-10T00:00:00' }),
        makePayment({ id: 4, user_id: 4, expiration_date: '2026-10-20T00:00:00' }),
        makePayment({ id: 5, user_id: 5, expiration_date: '2026-11-01T00:00:00' }),
      ],
      NOW,
    )

    // 2 vence hoy, 1 en 3 días y 5 en 7 (límite incluido).
    // 3 está a 16 días y 4 ya venció: las dos quedan afuera.
    expect(list.map((item) => item.user_id)).toEqual([2, 1, 5])
    expect(list.map((item) => item.daysLeft)).toEqual([0, 3, 7])
  })

  it('usa siempre el pago más nuevo de cada socio', () => {
    const list = getExpiringMemberships(
      [
        makePayment({ id: 1, user_id: 1, expiration_date: '2026-10-26T00:00:00' }),
        makePayment({ id: 2, user_id: 1, expiration_date: '2026-09-30T00:00:00' }),
      ],
      NOW,
    )

    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ user_id: 1, daysLeft: 1 })
  })

  it('respeta la ventana configurable y queda vacío si no hay nada por vencer', () => {
    const payments = [
      makePayment({ id: 1, user_id: 1, expiration_date: '2026-11-10T00:00:00' }),
    ]

    expect(EXPIRING_WINDOW_DAYS).toBe(7)
    expect(getExpiringMemberships(payments, NOW)).toEqual([])
    expect(getExpiringMemberships(payments, NOW, 30)).toHaveLength(1)
  })
})
