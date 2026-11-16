import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type { User, UserCreate, UserRolUpdate, UserUpdate } from '@/types/user'

export function getUsers(): Promise<User[]> {
  return request<User[]>(ENDPOINTS.USERS)
}

/**
 * Alta de socio desde el panel admin.
 * La API solo expone `POST /auth/register` para crear usuarios; el rol y el
 * estado inicial (`cliente` / `pendiente_habilitacion`) los define el backend.
 */
export function createUser(data: UserCreate): Promise<User> {
  return request<User>(ENDPOINTS.REGISTER, {
    method: 'POST',
    body: data,
  })
}

export function getUser(id: number): Promise<User> {
  return request<User>(`${ENDPOINTS.USERS}/${id}`)
}

export function updateUser(id: number, data: UserUpdate): Promise<User> {
  return request<User>(`${ENDPOINTS.USERS}/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

/**
 * Edición del perfil propio (`PATCH /users/me`).
 * Es el endpoint que acepta a cualquier autenticado; `/users/{id}` es admin-only.
 */
export function updateMe(data: UserUpdate): Promise<User> {
  return request<User>(ENDPOINTS.ME, {
    method: 'PATCH',
    body: data,
  })
}

/** Cambio de rol (admin). El backend rechaza con 400 cambiar el rol propio. */
export function updateUserRol(id: number, rol: UserRolUpdate['rol']): Promise<User> {
  return request<User>(`${ENDPOINTS.USERS}/${id}/rol`, {
    method: 'PATCH',
    body: { rol },
  })
}

export function enableUser(id: number): Promise<User> {
  return request<User>(`${ENDPOINTS.USERS}/${id}/habilitar`, {
    method: 'PATCH',
  })
}

export function deleteUser(id: number): Promise<void> {
  return request<void>(`${ENDPOINTS.USERS}/${id}`, {
    method: 'DELETE',
  })
}
