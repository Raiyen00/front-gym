import { formatDateOnly } from '@/features/routines/dates'
import { groupExercisesByDay } from '@/features/routines/grouping'
import { GRUPO_MUSCULAR_LABELS } from '@/types/enums'
import type { RoutineDetail } from '@/types/routine'

export interface RoutineShareInput {
  routineId: number
  memberLabel: string
  /** Fecha ISO (YYYY-MM-DD). */
  dateGenerated: string
  exercises: RoutineDetail['exercises']
}

/**
 * Resumen en texto plano de la rutina, listo para mandar por WhatsApp.
 *
 * `https://wa.me/?text=` solo admite texto prefilled: no se puede adjuntar
 * un archivo, así que el PDF se baja aparte con "Imprimir / Guardar como PDF".
 * Los asteriscos se renderizan como negrita en WhatsApp.
 */
export function buildRoutineShareText({
  routineId,
  memberLabel,
  dateGenerated,
  exercises,
}: RoutineShareInput): string {
  const count = exercises.length
  const header = [
    `Rutina #${routineId} — ${memberLabel}`,
    `Generada el ${formatDateOnly(dateGenerated)} · ${count} ${
      count === 1 ? 'ejercicio' : 'ejercicios'
    }`,
  ]

  const groups = groupExercisesByDay(exercises)
  if (groups.length === 0) {
    return [
      ...header,
      '',
      'La rutina todavía no tiene ejercicios cargados.',
    ].join('\n')
  }

  const blocks = groups.map((group) => {
    const lines = group.exercises.map((row, index) => {
      const muscleGroup =
        GRUPO_MUSCULAR_LABELS[row.exercise.muscular_group] ??
        row.exercise.muscular_group
      return `${index + 1}. ${row.exercise.name} (${muscleGroup}) — ${row.sets} × ${row.repetitions} · descanso ${row.rest} s`
    })
    return [`*${group.label}*`, ...lines].join('\n')
  })

  return [...header, ...blocks].join('\n\n')
}

/** Link de WhatsApp con el texto codificado (wa.me abre la app o WhatsApp Web). */
export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
