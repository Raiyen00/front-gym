import { formatDateOnly } from '@/features/routines/dates'
import { groupExercisesByDay } from '@/features/routines/grouping'
import { GRUPO_MUSCULAR_LABELS } from '@/types/enums'
import type { RoutineDetail } from '@/types/routine'

interface RoutinePrintSheetProps {
  routine: RoutineDetail
  memberLabel: string
}

/**
 * Documento que solo se ve al imprimir (o al "Guardar como PDF" desde el
 * diálogo de impresión). Usa el atributo `hidden` en pantalla —así también
 * queda fuera del árbol de accesibilidad— y `print:block` para mostrarse.
 *
 * Los colores son tinta explícita (no los tokens del tema, que es oscuro):
 * el navegador no imprime los fondos por defecto, así que el papel sale blanco.
 */
export function RoutinePrintSheet({
  routine,
  memberLabel,
}: RoutinePrintSheetProps) {
  const groups = groupExercisesByDay(routine.exercises)
  const count = routine.exercises.length

  return (
    <section
      hidden
      className="print:block max-w-[760px] text-[13px] leading-snug text-neutral-900"
    >
      <header className="flex items-end justify-between gap-6 border-b-2 border-neutral-900 pb-2.5">
        <div>
          <h1 className="font-display text-[1.375rem] leading-none font-semibold tracking-[-0.02em]">
            Rutina #{routine.id}
          </h1>
          <p className="mt-1.5 text-[0.8125rem] text-neutral-700">
            {memberLabel} · {formatDateOnly(routine.date_generated)} ·{' '}
            {count} {count === 1 ? 'ejercicio' : 'ejercicios'}
          </p>
        </div>
        <span className="text-[0.6875rem] tracking-wide text-neutral-500 uppercase">
          GymSasS
        </span>
      </header>

      {groups.length === 0 ? (
        <p className="mt-5 text-[0.8125rem] text-neutral-600">
          La rutina todavía no tiene ejercicios cargados.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.day} className="mt-5">
            <h2 className="break-after-avoid text-[0.8125rem] font-semibold tracking-wide uppercase">
              {group.label}
            </h2>
            <table className="mt-1.5 w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-400 text-left text-[0.6875rem] tracking-wide text-neutral-600 uppercase">
                  <th className="w-8 py-1 font-medium">#</th>
                  <th className="py-1 font-medium">Ejercicio</th>
                  <th className="py-1 text-right font-medium">Series × reps</th>
                  <th className="py-1 text-right font-medium">Descanso</th>
                </tr>
              </thead>
              <tbody>
                {group.exercises.map((row) => (
                  <tr
                    key={row.id}
                    className="break-inside-avoid border-b border-neutral-200"
                  >
                    <td className="py-1.5 text-neutral-500">{row.position}</td>
                    <td className="py-1.5 pr-3">
                      <span className="font-medium">
                        {row.exercise.name}
                      </span>
                      <span className="text-neutral-600">
                        {' '}
                        ·{' '}
                        {GRUPO_MUSCULAR_LABELS[row.exercise.muscular_group] ??
                          row.exercise.muscular_group}
                      </span>
                    </td>
                    <td className="py-1.5 text-right whitespace-nowrap">
                      {row.sets} × {row.repetitions}
                    </td>
                    <td className="py-1.5 text-right text-neutral-600 whitespace-nowrap">
                      {row.rest} s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}

      <footer className="mt-6 border-t border-neutral-300 pt-2 text-[0.6875rem] text-neutral-500">
        Plan generado el {formatDateOnly(routine.date_generated)} · GymSasS
      </footer>
    </section>
  )
}
