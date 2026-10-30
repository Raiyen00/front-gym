import { cn } from '@/lib/utils'
import { PASSWORD_POLICY_HINT } from '@/lib/passwordPolicy'

/**
 * Nota visible con la política de contraseñas. Va fuera de los `FormField`
 * para que no agregue una fila extra en una sola columna del formulario
 * (desalineaba los inputs cuando las contraseñas van lado a lado).
 */
export function PasswordPolicyNote({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs leading-relaxed text-text-muted', className)}>
      {PASSWORD_POLICY_HINT}
    </p>
  )
}
