import { format, parseISO } from 'date-fns'

/** Fecha sin hora (YYYY-MM-DD) sin corrimiento por zona horaria. */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return '-'
  const date = parseISO(value)
  if (Number.isNaN(date.getTime())) return value
  return format(date, 'dd/MM/yyyy')
}

/** Fecha de hoy en el formato que espera `<input type="date">`. */
export function todayInputDate(now: Date = new Date()): string {
  return format(now, 'yyyy-MM-dd')
}
