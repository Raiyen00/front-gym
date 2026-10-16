import { createContext } from 'react'

import type { User, UserCreate } from '@/types/user'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<User>
  register: (data: UserCreate) => Promise<User>
  logout: () => void
  updateCurrentUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
