import {
  getLatestPaymentsByUser,
  getPaymentStatus,
} from '@/features/payments/membership'
import type { Payment } from '@/types/payment'

/** Serie mensual para los gráficos de la página de Pagos. */
export interface MonthlyStat {
  /** Clave estable del mes, `YYYY-MM`. */
  key: string
  year: number
  /** Mes 0-11. */
  month: number
  /** "Oct" — corto, para la fila del gráfico. */
  label: string
  /** "Octubre de 2026" — para accesibilidad y tooltips. */
  fullLabel: string
  /** Suma de `amount` de los pagos del mes. */
  collected: number
  /** Cantidad de pagos del mes. */
  payments: number
  /** Socios distintos que pagaron en el mes. */
  clients: number
}

const shortMonth = new Intl.DateTimeFormat('es-AR', { month: 'short' })
const longMonth = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  year: 'numeric',
})

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

/**
 * Serie de los últimos `months` meses (incluido el actual), en orden
 * cronológico. Los meses sin pagos quedan en 0.
 *
 * Los pagos fuera de la ventana o con fecha inválida se ignoran. El importe
 * se suma con guarda: `amount` es `number` porque `features/payments/api.ts`
 * lo normaliza en el borde, pero un NaN arruinaría toda la serie.
 */
export function buildMonthlySeries(
  payments: Payment[],
  options: { months?: number; now?: Date } = {},
): MonthlyStat[] {
  const { months = 6, now = new Date() } = options
  const buckets = new Map<
    string,
    { stat: MonthlyStat; userIds: Set<number> }
  >()

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = monthKey(year, month)

    buckets.set(key, {
      stat: {
        key,
        year,
        month,
        label: capitalize(shortMonth.format(date)),
        fullLabel: capitalize(longMonth.format(date)),
        collected: 0,
        payments: 0,
        clients: 0,
      },
      userIds: new Set(),
    })
  }

  for (const payment of payments) {
    const date = new Date(payment.payment_date)
    if (Number.isNaN(date.getTime())) continue

    const bucket = buckets.get(monthKey(date.getFullYear(), date.getMonth()))
    if (!bucket) continue

    const amount = Number(payment.amount)
    if (Number.isFinite(amount)) bucket.stat.collected += amount
    bucket.stat.payments += 1
    bucket.userIds.add(payment.user_id)
  }

  return Array.from(buckets.values(), ({ stat, userIds }) => ({
    ...stat,
    clients: userIds.size,
  }))
}

/** Ventana por defecto de "membresías por vencer", en días. */
export const EXPIRING_WINDOW_DAYS = 7

export interface ExpiringMembership {
  user_id: number
  /** Último pago del socio (el que define su vencimiento). */
  payment: Payment
  /** Días hasta el vencimiento; 0 si vence hoy. */
  daysLeft: number
}

/**
 * Socios cuya última membresía vence entre hoy y `windowDays` días
 * inclusive. Las ya vencidas quedan afuera: esas las cubre el stat
 * de "Membresías vencidas".
 */
export function getExpiringMemberships(
  payments: Payment[],
  now: Date = new Date(),
  windowDays: number = EXPIRING_WINDOW_DAYS,
): ExpiringMembership[] {
  return getLatestPaymentsByUser(payments)
    .map((payment) => ({
      user_id: payment.user_id,
      payment,
      daysLeft: getPaymentStatus(payment, now).daysLeft,
    }))
    .filter(({ daysLeft }) => daysLeft >= 0 && daysLeft <= windowDays)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}
