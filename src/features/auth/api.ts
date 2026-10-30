import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type { User, UserCreate, UserPasswordUpdate } from '@/types/user'

export interface LoginResponse {
  access_token: string
  token_type: string
}

/**
 * POST /auth/login — FastAPI espera `application/x-www-form-urlencoded`
 * con los campos `username` (el email) y `password` (OAuth2PasswordRequestForm).
 */
export function login(email: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams()
  body.append('username', email)
  body.append('password', password)

  return request<LoginResponse>(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    auth: false,
  })
}

/** GET /users/me — hidrata el usuario autenticado a partir del token. */
export function me(): Promise<User> {
  return request<User>(ENDPOINTS.ME)
}

/** POST /auth/register — alta de socio. */
export function register(data: UserCreate): Promise<User> {
  return request<User>(ENDPOINTS.REGISTER, {
    method: 'POST',
    body: data,
    auth: false,
  })
}

/** PATCH /auth/password — cambia la contraseña del usuario autenticado. */
export function updatePassword(
  data: UserPasswordUpdate,
  options: { token?: string } = {},
): Promise<User> {
  return request<User>(ENDPOINTS.PASSWORD, {
    method: 'PATCH',
    body: data,
    headers: options.token
      ? { Authorization: `Bearer ${options.token}` }
      : undefined,
  })
}
