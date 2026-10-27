import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Input de contraseña con botón para mostrar u ocultar el valor.
 * Reenvía todas las props (incluido `ref`) al `Input`, así `FormControl`
 * puede seguir asociando el label y los mensajes de error.
 */
function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        onMouseDown={(event) => event.preventDefault()}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-text-muted transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff className="size-4" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Eye className="size-4" strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
