/**
 * Claves de TanStack Query centralizadas por dominio.
 * Mantener un solo lugar evita colisiones y facilita la invalidación.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
    me: ['users', 'me'] as const,
  },
  exercises: {
    all: ['exercises'] as const,
    list: (muscularGroup?: string) =>
      ['exercises', 'list', muscularGroup ?? 'all'] as const,
    detail: (id: number) => ['exercises', id] as const,
  },
  sportProfiles: {
    all: ['sport-profiles'] as const,
    me: ['sport-profiles', 'me'] as const,
    detail: (id: number) => ['sport-profiles', id] as const,
  },
  routines: {
    all: ['routines'] as const,
    me: ['routines', 'me'] as const,
    detail: (id: number) => ['routines', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (userId?: number) => ['payments', 'list', userId ?? 'all'] as const,
    me: ['payments', 'me'] as const,
    detail: (id: number) => ['payments', id] as const,
  },
} as const
