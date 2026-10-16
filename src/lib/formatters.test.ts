import { describe, expect, it } from 'vitest'

import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters'

describe('formatCurrency', () => {
  it('formatea en pesos argentinos sin decimales', () => {
    expect(formatCurrency(15000)).toMatch(/15\.?000/)
  })

  it('devuelve $0 para valores vacíos', () => {
    expect(formatCurrency(null)).toBe('$0')
    expect(formatCurrency(undefined)).toBe('$0')
    expect(formatCurrency(Number.NaN)).toBe('$0')
  })
})

describe('formatDate', () => {
  it('devuelve "-" si no hay valor', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('devuelve el string original si es inválido', () => {
    expect(formatDate('no-es-fecha')).toBe('no-es-fecha')
  })

  it('formatea una fecha ISO en dd/mm/aaaa', () => {
    expect(formatDate('2026-03-05T10:00:00Z')).toMatch(/^0?5\/0?3\/2026$/)
  })
})

describe('formatDateTime', () => {
  it('devuelve "-" si no hay valor', () => {
    expect(formatDateTime('')).toBe('-')
  })
})
