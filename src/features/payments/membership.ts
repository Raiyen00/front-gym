import type { Payment } from '@/types/payment'

export type PaymentStatusKind = 'vigente' | 'vence_hoy' | 'vencida'

export interface PaymentStatus {
  kind: PaymentStatusKind
  label: string
  /** Días desde hoy hasta el vencimiento. Negativo si ya venció. */
  daysLeft: number
}

export interface MembershipStatus {
  kind: 'sin_pagos' | PaymentStatusKind
  label: string
  daysLeft: number | null
  expirationDate: string | null
  /** Pago con el vencimiento más lejano. */
  payment: Payment | null
}

const MS_PER_DAY = 86_400_000

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

/**
 * Diferencia en días calendario entre `expiration` y `now`.
 * `NaN` si la fecha no es válida.
 */
export function daysUntilExpiration(
  expiration: string | Date,
  now: Date = new Date(),
): number {
  const expirationDate = parseDate(expiration)
  if (Number.isNaN(expirationDate.getTime())) return Number.NaN
  const diff = startOfDay(expirationDate).getTime() - startOfDay(now).getTime()
  return Math.round(diff / MS_PER_DAY)
}

/** Estado de un pago individual según su fecha de vencimiento. */
export function getPaymentStatus(payment: Payment, now: Date = new Date()): PaymentStatus {
  const daysLeft = daysUntilExpiration(payment.expiration_date, now)

  if (Number.isNaN(daysLeft)) {
    return { kind: 'vencida', label: 'Vencida', daysLeft }
  }
  if (daysLeft < 0) {
    return { kind: 'vencida', label: 'Vencida', daysLeft }
  }
  if (daysLeft === 0) {
    return { kind: 'vence_hoy', label: 'Vence hoy', daysLeft }
  }
  return { kind: 'vigente', label: 'Vigente', daysLeft }
}

/** Un pago está activo si vence hoy o más adelante. */
export function isPaymentActive(payment: Payment, now: Date = new Date()): boolean {
  return getPaymentStatus(payment, now).kind !== 'vencida'
}

/** Último pago (por vencimiento) de cada socio. */
export function getLatestPaymentsByUser(payments: Payment[]): Payment[] {
  const latest = new Map<number, Payment>()

  for (const payment of payments) {
    const current = latest.get(payment.user_id)
    if (
      !current ||
      new Date(payment.expiration_date).getTime() >
        new Date(current.expiration_date).getTime()
    ) {
      latest.set(payment.user_id, payment)
    }
  }

  return Array.from(latest.values())
}

/** Socios cuya última membresía está vencida. */
export function countExpiredMemberships(
  payments: Payment[],
  now: Date = new Date(),
): number {
  return getLatestPaymentsByUser(payments).filter(
    (payment) => getPaymentStatus(payment, now).kind === 'vencida',
  ).length
}

/** Estado de membresía del socio a partir de todos sus pagos. */
export function getMembershipStatus(
  payments: Payment[],
  now: Date = new Date(),
): MembershipStatus {
  if (payments.length === 0) {
    return {
      kind: 'sin_pagos',
      label: 'Sin pagos registrados',
      daysLeft: null,
      expirationDate: null,
      payment: null,
    }
  }

  const [latest] = getLatestPaymentsByUser(payments)
  const status = getPaymentStatus(latest, now)

  return {
    kind: status.kind,
    label:
      status.kind === 'vigente'
        ? 'Membresía vigente'
        : status.kind === 'vence_hoy'
          ? 'Vence hoy'
          : 'Membresía vencida',
    daysLeft: status.daysLeft,
    expirationDate: latest.expiration_date,
    payment: latest ?? null,
  }
}
