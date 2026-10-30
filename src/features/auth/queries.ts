import { useMutation } from '@tanstack/react-query'

import * as authApi from '@/features/auth/api'
import { useAuth } from '@/features/auth/useAuth'
import type { UserPasswordUpdate } from '@/types/user'

/**
 * PATCH /auth/password. No modifica la sesión: el token sigue siendo válido,
 * así que no hace falta invalidar caché ni volver a hidratar el usuario.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: UserPasswordUpdate) => authApi.updatePassword(data),
  })
}

export interface LoginChangePassword {
  email: string
  oldPassword: string
  newPassword: string
}

/**
 * Cambio de contraseña sin sesión iniciada (pantalla de login).
 * Valida la identidad con `POST /auth/login`, usa ese token para el PATCH y,
 * al terminar, inicia sesión con la contraseña nueva.
 */
export function useLoginChangePassword() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: async (data: LoginChangePassword) => {
      const { access_token } = await authApi.login(
        data.email,
        data.oldPassword,
      )
      await authApi.updatePassword(
        {
          old_password: data.oldPassword,
          new_password: data.newPassword,
        },
        { token: access_token },
      )
      return login(data.email, data.newPassword)
    },
  })
}
