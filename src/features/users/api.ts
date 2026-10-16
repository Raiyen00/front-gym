import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type { User, UserUpdate } from '@/types/user'

export function getUsers(): Promise<User[]> {
  return request<User[]>(ENDPOINTS.USERS)
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
