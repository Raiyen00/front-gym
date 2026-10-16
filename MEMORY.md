# MEMORY.md — Contexto del proyecto GymSasS Frontend

**Última actualización:** 2026-10-16

---

## Estado actual

✅ **Fases completadas (según plan.md):**
- Fase 0: Scaffold, tooling, testing (Vite + React 19 + TS + Vitest + MSW)
- Fase 1: Design system (Tailwind v4 + shadcn/ui, tema oscuro, primary `#10b981`)
- Fase 2: Núcleo API (`lib/api/client.ts`, `config.ts`, `queryKeys.ts`, `storage.ts`, `formatters.ts`)
- Fase 3: Providers y shell (`AuthProvider`, `QueryClientProvider`, `BrowserRouter`, `Toaster`, layouts)
- Fase 4: Feature Auth real (login, register, sesión, logout, hidratación con `/users/me`)
- Fase 5: RBAC, layout, navegación (`RequireAuth`, `RequireRole`, `DashboardLayout`, `config/nav.ts`)

✅ **Fase 7: Feature Users (CRUD admin + perfil)**
- Tipos actualizados: `User.state` (enum `UserState`) en lugar de `active: boolean`
- `src/types/enums.ts`: `UserState` + `USER_STATE_LABELS`
- `src/types/user.ts`: `state: UserState`
- `src/features/users/`:
  - `api.ts`: `getUsers()`, `getUser(id)`, `updateUser(id, data)`, `enableUser(id)`, `deleteUser(id)` (se quitó `updateMe`)
  - `queries.ts`: `useUsers()`, `useUser(id)`, `useUpdateUser(id)`, `useEnableUser()`, `useDeleteUser()`
  - `schema.ts`: `userUpdateSchema` (Zod)
  - `components/UsersTable.tsx`: tabla + acciones `Ver`/`Editar`/`Habilitar`/`Eliminar` (gestión solo admin)
  - `components/UserFormDialog.tsx`: edición parcial (envía solo `dirtyFields`)
  - `components/UserDetailDialog.tsx`: detalle de solo lectura (`GET /users/{id}`) con acciones Habilitar/Eliminar
  - `components/DeleteUserDialog.tsx`: confirmación de borrado (reusa `Dialog`)
  - `components/UsersPage.tsx`: `/usuarios` (admin, profesor)
  - `components/ProfilePage.tsx`: `/mi-perfil` (cliente) edita con `PATCH /users/{id}`
- `AuthContext`: `updateCurrentUser()` para reflejar la edición propia en sesión/header
- Router actualizado: `/usuarios` → `UsersPage`, `/mi-perfil` → `ProfilePage`

✅ **Tests:** 39 tests pasan (incluye `users/api.test.ts` y auth-flow para `state`)

✅ **Build/Lint/Typecheck:** Todo pasa

---

## Decisiones técnicas recientes

| Tema | Decisión |
|------|----------|
| **Estado de usuario** | `state: UserState` (4 valores: `activo`, `inactivo`, `pendiente_habilitacion`, `habilitado_entrenar`) en lugar de `active: boolean` |
| **Edición de usuario** | Todos usan `PATCH /users/{id}` (incluye perfil propio); `PATCH /users/me` eliminado. Acciones de gestión en `/usuarios` solo admin (`canManage`) |
| **CORS** | Cambiar a `allow_credentials=False` con `allow_origins=["*"]` (o orígenes explícitos si se usan cookies) |
| **Seed admin** | Script temporal `seed_admin.py` con DNI único (`87654321`) |
| **Fecha** | `date-fns` para formateo en tabla |
| **API URL** | Configurable via `VITE_API_BASE_URL` (`.env`) o runtime (`localStorage` + `ApiUrlBadge`) |

---

## Problemas resueltos

1. **Columna `state` faltante en BD** → `ALTER TABLE user ADD state NVARCHAR(50) DEFAULT 'pendiente_habilitacion'`
2. **DNI duplicado en seed** → Usar DNI libre (`87654321`)
3. **CORS bloqueado** → `allow_credentials=True` incompatible con `allow_origins=["*"]` → solución: `allow_credentials=False`
4. **Tests rotos por cambio `active` → `state`** → Actualizado `auth-flow.test.tsx` a `state: 'activo'` y expect `'Activo'`
5. **`updateMe` (PATCH /users/me) eliminado** → el backend ahora expone `PATCH /users/{id}`; el perfil propio se edita con el id del usuario logueado

---

## Pendientes (Fases 7+ según plan.md)

### Fase 7 — Users (Etapa 1 API)
- [x] `PATCH /users/{id}` (parcial; 409 si email/dni/phone son de otro usuario; no edita rol/state/password)
- [x] `PATCH /users/{id}/habilitar` → `state = habilitado_entrenar`
- [x] `DELETE /users/{id}` → 204
- [x] `GET /users/{id}` (detalle, `UserDetailDialog`)
- [x] `GET /users/me` corregido en API
- [ ] **Verificar permiso de cliente** en `/mi-perfil` con `PATCH /users/{id}`: el spec lo marca admin-only; si el backend no permite edición propia, dará 403 (definir `/users/me` para clientes)
- [ ] Paginación, orden, búsqueda server-side

### Fase 8 — Exercises (Etapa 2 API)
- [ ] `src/features/exercises/` (CRUD + filtro `?muscular_group=`)
- [ ] Tipos: `Exercise`, `ExerciseCreate`, `ExerciseUpdate`
- [ ] Endpoints: `GET/POST /exercises`, `GET/PATCH/DELETE /exercises/{id}`

### Fase 9 — Sport Profiles (Etapa 3 API)
- [ ] `src/features/sportProfiles/`
- [ ] "Mi perfil deportivo" (cliente) + vista admin
- [ ] Endpoints: `GET/POST /sport-profiles`, `GET/PATCH /sport-profiles/me`

### Fase 10 — Routines (Etapa 4 API)
- [ ] `src/features/routines/`
- [ ] Editor rutinas (profesor/admin) + visor read-only (cliente)
- [ ] Endpoints: `GET/POST /routines`, `GET/PATCH/DELETE /routines/{id}`, ejercicios de rutina

### Fase 11 — Payments (Etapa 5 API)
- [ ] `src/features/payments/`
- [ ] Registro pagos (admin) + "Mi membresía" (cliente)
- [ ] Endpoints: `GET/POST /payments`, `GET /payments/me`

### Fase 12 — Transversal (Etapa 6 API)
- [ ] Paginación, orden, búsqueda global
- [ ] Toasts de mutación (éxito/error) consistentes
- [ ] Optimistic updates donde corresponda

---

## Comandos útiles

```bash
# Frontend
cd C:\Users\chela\OneDrive\Documentos\front-gym
npm run dev          # Dev server (puerto 5173)
npm run build        # Typecheck + build producción
npm run typecheck    # Solo tsc --noEmit
npm run lint         # ESLint
npm test             # Vitest run
npm run test:watch   # Vitest watch

# API
cd C:\Users\chela\PycharmProjects\GymApi
python -m uvicorn main:app --reload  # Puerto 8000
python seed_admin.py                 # Crear admin (una vez)
python fix_state_column.py           # Agregar columna state (una vez)
```

---

## Variables de entorno

**Frontend (`.env`):**
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

**API (`.env`):**
```
DATABASE_URL=mssql+pyodbc://...
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Credenciales de prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | `admin@gym.com` | `admin123` |

---

## Próximos pasos inmediatos

1. **Verificar endpoints admin con API real**: `/usuarios` (Editar/Habilitar/Eliminar) y `PATCH /users/{id}` desde `/mi-perfil`
2. **Confirmar permisos**: si `PATCH /users/{id}` es admin-only, el cliente no podrá editar su perfil (403) → definir `/users/me` para clientes
3. **Arreglar CORS en API** → `allow_credentials=False` en `main.py`
4. **Comenzar Fase 8 (Exercises)** cuando la API exponga endpoints