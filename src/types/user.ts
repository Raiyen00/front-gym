import type { Rol, UserState } from './enums'

/** Espejo de `UserResponse` (schemas/user_schema.py). */
export interface User {
  id: number
  email: string
  name: string
  lastname: string
  dni: string
  phone: string | null
  rol: Rol
  state: UserState
  /** ISO 8601 */
  register_date: string
}

/** Espejo de `UserCreate` (POST /auth/register). */
export interface UserCreate {
  email: string
  password: string
  name: string
  lastname: string
  dni: string
  phone: string
}

/**
 * Actualización de usuario. Sin `rol` ni `password`
 * (ver plan.md de la API, Etapa 1).
 */
export interface UserUpdate {
  email?: string
  name?: string
  lastname?: string
  dni?: string
  phone?: string
}
