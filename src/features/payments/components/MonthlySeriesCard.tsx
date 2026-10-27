import { cn } from '@/lib/utils'
import type { MonthlyStat } from '@/features/payments/insights'

interface MonthlySeriesCardProps {
  title: string
  caption: string
  /** Serie ordenada cronológicamente (de la más vieja a la actual). */
  series: MonthlyStat[]
  /** Valor a graficar de cada mes. */
  getValue: (stat: MonthlyStat) => number
  formatValue: (value: number) => string
  tone?: 'primary' | 'ring'
}

/**
 * Barras horizontales de los últimos meses. Sin dependencias de gráficos:
 * cada fila es una barra de alto fijo contra el máximo de la serie.
 */
export function MonthlySeriesCard({
  title,
  caption,
  series,
  getValue,
  formatValue,
  tone = 'primary',
}: MonthlySeriesCardProps) {
  const max = series.reduce(
    (peak, stat) => Math.max(peak, getValue(stat)),
    0,
  )

  return (
    <section className="rounded-xl bg-card px-5 py-4" aria-label={title}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-[0.9375rem] font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-[0.8125rem] text-text-muted">{caption}</p>
      </header>

      <ul className="mt-4 flex flex-col gap-2.5">
        {series.map((stat) => {
          const value = getValue(stat)
          const width = max > 0 ? Math.round((value / max) * 100) : 0

          return (
            <li
              key={stat.key}
              className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3"
            >
              <span className="text-[0.75rem] text-text-muted">
                {stat.label}
              </span>
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-elevated"
                role="img"
                aria-label={`${stat.fullLabel}: ${formatValue(value)}`}
              >
                <div
                  className={cn(
                    'h-full rounded-full',
                    tone === 'ring' ? 'bg-ring' : 'bg-primary',
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="num text-[0.8125rem] text-foreground">
                {formatValue(value)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
