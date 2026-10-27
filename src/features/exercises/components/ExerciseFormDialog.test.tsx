import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Toaster } from '@/components/ui/sonner'
import { ExerciseFormDialog } from '@/features/exercises/components/ExerciseFormDialog'
import { ApiError } from '@/lib/api/client'
import type { Exercise } from '@/types/exercise'

const EXERCISE: Exercise = {
  id: 3,
  name: 'Press de banca',
  description: 'Pecho plano con barra',
  muscular_group: 'pecho',
}

describe('ExerciseFormDialog', () => {
  it('muestra el 409 de nombre duplicado en el campo Nombre', async () => {
    const user = userEvent.setup()
    const message = "El ejercicio con el nombre 'Press de banca' ya existe."
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(message, { status: 409 }))

    render(
      <>
        <ExerciseFormDialog
          open
          exercise={EXERCISE}
          isPending={false}
          onSubmit={onSubmit}
          onOpenChange={vi.fn()}
        />
        <Toaster />
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument())
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('valida nombre y grupo muscular antes de enviar', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <>
        <ExerciseFormDialog
          open
          exercise={null}
          isPending={false}
          onSubmit={onSubmit}
          onOpenChange={vi.fn()}
        />
        <Toaster />
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Crear ejercicio' }))

    await waitFor(() => expect(screen.getByText('Ingresá un nombre')).toBeInTheDocument())
    expect(
      screen.getByText('Elegí un grupo muscular', {
        selector: '[data-slot="form-message"]',
      }),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
