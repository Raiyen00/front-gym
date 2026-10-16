import { STORAGE_KEYS } from '@/lib/api/config'
import type { User } from '@/types/user'

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.USER)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

/** Persiste token + usuario de una sesión. */
export function setSession(token: string, user: User): void {
  setToken(token)
  setStoredUser(user)
}

/** Limpia toda la sesión persistida. */
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}
