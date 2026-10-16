import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { AuthContext, type AuthStatus } from '@/features/auth/context'
import * as authApi from '@/features/auth/api'
import { onUnauthorized } from '@/lib/api/client'
import {
  clearSession,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '@/lib/storage'
import type { User, UserCreate } from '@/types/user'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? 'loading' : 'unauthenticated',
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    setStatus('unauthenticated')
    queryClient.clear()
  }, [queryClient])

  // Reacciona a cualquier 401 global en peticiones autenticadas.
  useEffect(() => {
    onUnauthorized(logout)
    return () => onUnauthorized(null)
  }, [logout])

  // Al montar: si hay token, valida la sesión con GET /users/me.
  useEffect(() => {
    if (!getToken()) return

    let active = true
    authApi
      .me()
      .then((me) => {
        if (!active) return
        setStoredUser(me)
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        clearSession()
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password)
    setToken(access_token)
    const me = await authApi.me()
    setStoredUser(me)
    setUser(me)
    setStatus('authenticated')
    return me
  }, [])

  const register = useCallback(
    (data: UserCreate) => authApi.register(data),
    [],
  )

  const updateCurrentUser = useCallback((next: User) => {
    setStoredUser(next)
    setUser(next)
  }, [])

  const value = useMemo(
    () => ({ user, status, login, register, logout, updateCurrentUser }),
    [user, status, login, register, logout, updateCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
