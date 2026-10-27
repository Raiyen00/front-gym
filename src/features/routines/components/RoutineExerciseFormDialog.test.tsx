import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { Toaster } from '@/components/ui/sonner'
import { RoutineExerciseFormDialog } from '@/features/routines/components/RoutineExerciseFormDialog'
import { ApiError } from '@/lib/api/client'
import { server } from '@/test/msw/server'
import type { RoutineExercise } from '@/types/routine'

const BASE = 'http://127.0.0.1:8000'

const EXERCISE_ROW: RoutineExercise = {
  id: 7,
  day: 'lunes',
  sets: 4,
  repetitions: '10',
  position: 1,
  rest: 60,
  exercise: {
    id: 1,
    name: 'Press de banca con barra',
    description: 'Banco plano, agarre medio',
    muscular_group: 'pecho',
  },
}

const EXERCISES = [
  EXERCISE_ROW.exercise,
  {
    id: 2,
    name: 'Remo con barra',
    description: null,
    muscular_group: 'espalda' as const,
  },
  {
    id: 3,
    name: 'Sentadilla',
    description: null,
    muscular_group: 'pierna' as const,
  },
]

function renderDialog(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(
    http.get(`${BASE}/exercises`, () =>
      HttpResponse.json([EXERCISE_ROW.exercise]),
    ),
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RoutineExerciseFormDialog
        open
        exerciseRow={EXERCISE_ROW}
        isPending={false}
        onSubmit={onSubmit}
        onOpenChange={vi.fn()}
      />
      <Toaster />
    </QueryClientProvider>,
  )
}

function renderCreateDialog(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(
    http.get(`${BASE}/exercises`, () => HttpResponse.json(EXERCISES)),
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RoutineExerciseFormDialog
        open
        exerciseRow={null}
        isPending={false}
        onSubmit={onSubmit}
        onOpenChange={vi.fn()}
      />
      <Toaster />
    </QueryClientProvider>,
  )
}

describe('RoutineExerciseFormDialog', () => {
  it('no envía nada si no hay cambios', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog(onSubmit)

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('No hay cambios para guardar')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra inline el 409 de la API y mantiene el formulario abierto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError('Ya existe un ejercicio en ese día y posición.', {
          status: 409,
        }),
      )
    renderDialog(onSubmit)

    const sets = screen.getByLabelText('Series')
    await user.clear(sets)
    await user.type(sets, '5')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ sets: 5 }),
    )
    expect(
      await screen.findByText('Ya existe un ejercicio en ese día y posición.'),
    ).toBeInTheDocument()
  })

  it('filtra los ejercicios por grupo muscular y resetea al cambiarlo', async () => {
    const user = userEvent.setup()
    renderCreateDialog()

    const groupSelect = screen.getByRole('combobox', {
      name: 'Grupo muscular',
    })
    await waitFor(() => expect(groupSelect).toBeEnabled())

    await user.click(groupSelect)
    await user.click(await screen.findByRole('option', { name: 'Pecho' }))

    const exerciseSelect = screen.getByRole('combobox', { name: 'Ejercicio' })
    expect(exerciseSelect).toBeEnabled()

    await user.click(exerciseSelect)
    expect(
      await screen.findByRole('option', { name: 'Press de banca con barra' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Remo con barra' }),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('option', { name: 'Press de banca con barra' }),
    )
    expect(exerciseSelect).toHaveTextContent('Press de banca con barra')

    // Cambiar de grupo descarta la selección anterior.
    await user.click(groupSelect)
    await user.click(await screen.findByRole('option', { name: 'Espalda' }))
    expect(exerciseSelect).toHaveTextContent('Elegí un ejercicio')
  })

  it('envía el ejercicio elegido dentro del grupo', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderCreateDialog(onSubmit)

    const groupSelect = screen.getByRole('combobox', {
      name: 'Grupo muscular',
    })
    await waitFor(() => expect(groupSelect).toBeEnabled())
    await user.click(groupSelect)
    await user.click(await screen.findByRole('option', { name: 'Pecho' }))

    await user.click(screen.getByRole('combobox', { name: 'Ejercicio' }))
    await user.click(
      await screen.findByRole('option', { name: 'Press de banca con barra' }),
    )

    await user.click(screen.getByRole('combobox', { name: 'Día' }))
    await user.click(await screen.findByRole('option', { name: 'Lunes' }))

    await user.click(screen.getByRole('button', { name: 'Agregar ejercicio' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        exercise_id: 1,
        day: 'lunes',
        sets: 3,
        repetitions: '10',
        position: 1,
        rest: 60,
      }),
    )
  })
})
