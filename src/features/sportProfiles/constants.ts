/**
 * `goal` y `level` son strings libres en el backend (sin enum).
 * Acá definimos enums con valores legibles que se guardan tal cual y
 * se muestran como etiquetas en la UI.
 */
export interface SportOption {
  value: string
  label: string
}

export const SPORT_GOALS: SportOption[] = [
  { value: 'Hipertrofia', label: 'Hipertrofia' },
  { value: 'Fuerza', label: 'Fuerza' },
  { value: 'Perder grasa', label: 'Perder grasa' },
  { value: 'Resistencia', label: 'Resistencia' },
  { value: 'Tonificación', label: 'Tonificación' },
  { value: 'Salud general', label: 'Salud general' },
  { value: 'Rendimiento deportivo', label: 'Rendimiento deportivo' },
  { value: 'Movilidad', label: 'Movilidad' },
]

export const SPORT_LEVELS: SportOption[] = [
  { value: 'Principiante', label: 'Principiante' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Avanzado', label: 'Avanzado' },
]

const ALL_OPTIONS = [...SPORT_GOALS, ...SPORT_LEVELS]

/**
 * Etiqueta legible para un valor de `goal`/`level`.
 * Si no está en el enum (dato legacy tipo `perder_grasa`), lo prettifica.
 */
export function formatSportOption(value: string | null | undefined): string {
  if (!value) return '-'
  const match = ALL_OPTIONS.find((option) => option.value === value)
  if (match) return match.label
  const spaced = value.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Opciones del enum + valor legacy si no pertenece a la lista. */
export function optionsWithLegacy(options: SportOption[], current?: string | null): SportOption[] {
  if (current && !options.some((option) => option.value === current)) {
    return [{ value: current, label: formatSportOption(current) }, ...options]
  }
  return options
}
