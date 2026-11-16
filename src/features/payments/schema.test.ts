import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { paymentFormSchema } from '@/features/payments/schema'

const VALID_VALUES = {
  user_id: '7',
  amount: '1500',
  payment_method: 'efectivo' as const,
}

function parseExpiration(expiration_date: string) {
  return paymentFormSchema.safeParse({ ...VALID_VALUES, expiration_date })
}

describe('paymentFormSchema — vencimiento', () => {
  beforeEach(() => {
    // Noche del 4 de noviembre en Argentina (UTC-3): el caso que fallaba con T00:00:00.
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 4, 22, 30))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('acepta un vencimiento posterior a hoy', () => {
    const result = parseExpiration('2026-11-05')

    expect(result.success).toBe(true)
  })

  it('rechaza el vencimiento de hoy con un mensaje en español', () => {
    const result = parseExpiration('2026-11-04')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Elegí una fecha posterior a hoy')
  })

  it('rechaza un vencimiento pasado', () => {
    const result = parseExpiration('2026-11-01')

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Elegí una fecha posterior a hoy')
  })
})
