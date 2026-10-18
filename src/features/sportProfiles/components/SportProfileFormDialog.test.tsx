import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SportProfileFormDialog } from '@/features/sportProfiles/components/SportProfileFormDialog'
import { Toaster } from '@/components/ui/sonner'
import { server } from '@/test/msw/server'
import type { SportProfile } from '@/types/sportProfile'

const BASE = 'http://127.0.0.1:8000'

const ORIGINAL: SportProfile = {
  id: 5,
  user_id: 7,
  goal: 'Hipertrofia',
  level: 'Intermedio',
  days_per_week: 4,
  session_duration: 60,
  age: 28,
  injuries: null,
  trainer_tracking: false,
  created_at: '2026-02-01T10:00:00Z',
}

function renderDialog(
  props: Partial<ComponentProps<typeof SportProfileFormDialog>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(http.get(`${BASE}/users`, () => HttpResponse.json([])))

  return render(
    <QueryClientProvider client={queryClient}>
      <SportProfileFormDialog
        open
        profile={ORIGINAL}
        isPending={false}
        onSubmit={vi.fn()}
        onOpenChange={vi.fn()}
        {...props}
      />
      <Toaster />
    </QueryClientProvider>,
  )
}

describe('SportProfileFormDialog (edición)', () => {
  it('envía PATCH solo con trainer_tracking al cambiar el seguimiento', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderDialog({ onSubmit })

    await user.click(screen.getByRole('checkbox', { name: /seguimiento del entrenador/i }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ trainer_tracking: true }),
    )
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('no llama a onSubmit si no hay cambios', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderDialog({ onSubmit })

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(screen.getByText('No hay cambios para guardar')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
