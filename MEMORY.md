# MEMORY.md — Contexto del proyecto GymSasS Frontend

**Última actualización:** 2026-10-18

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

✅ **Tests:** 54 tests pasan (incluye `users/api.test.ts`, `sportProfiles/api.test.ts`, `sportProfiles/payload.test.ts`, `SportProfileFormDialog.test.tsx` y auth-flow para `state`)

✅ **Build/Lint/Typecheck:** Todo pasa

---

## ✅ Fase 9: Feature Sport Profiles (Etapa 3 API)

- `src/types/sportProfile.ts`: `SportProfile`, `SportProfileCreate` (con `user_id`), `SportProfileUpdate` (parcial, sin `user_id`)
- `ENDPOINTS.SPORT_PROFILES = '/sport-profiles'` (`lib/api/config.ts`)
- `src/features/sportProfiles/`:
  - `api.ts`: `getSportProfiles()`, `getMySportProfiles()`, `getSportProfile(id)`, `createSportProfile()`, `updateSportProfile(id, data)`, `deleteSportProfile(id)`
  - `queries.ts`: hooks correspondientes (invalida `queryKeys.sportProfiles.*`; el `queryKeys` ya existía)
  - `schema.ts`: `sportProfileFormSchema` (Zod; numéricos como string + `refine`, se convierten a number al enviar)
  - `constants.ts`: `GOAL_OPTIONS`/`LEVEL_OPTIONS` sugeridas + `formatSportOption()`
  - `components/`:
    - `SportProfilesPage.tsx`: `/perfiles-deportivos` (solo admin, CRUD completo)
    - `SportProfilesTable.tsx`, `SportProfileFormDialog.tsx` (alta con Select de socio / edición parcial `dirtyFields`), `SportProfileDetailDialog.tsx`, `SportProfileDetails.tsx` (detalle reutilizable), `DeleteSportProfileDialog.tsx`
    - `MySportProfilePage.tsx`: `/mi-perfil-deportivo` (cliente, SOLO LECTURA de `GET /sport-profiles/me`)
- Router y `config/nav.ts` actualizados: "Perfiles deportivos" (admin) y "Mi perfil deportivo" (cliente)
- Contrato verificado **contra el código del back** (`schemas/sport_profile_schema.py`, `controllers/sport_profile_controller.py`, `services/..._service.py`, `security/permissions.py`), no solo contra el prompt

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
| **sport_profile (Fase 9)** | Escritura `require_admin` (403 para cliente). Cliente SOLO lectura vía `/sport-profiles/me`. `POST` manda `user_id` (nunca `created_at`); `PATCH` parcial sin `user_id`. `goal`/`level` en el back son strings libres → en el front son enums con **valores legibles en español** (`Hipertrofia`, `Perder grasa`, `Principiante`…), guardados tal cual. `session_duration` en MINUTOS. 404 con `"User not found"` / `"Sport profile not found"` |
| **Update sport_profile** | El PATCH se arma por **diff contra el perfil original** (`payload.ts` → `buildSportProfileUpdate`), no con `dirtyFields` de RHF. `trainer_tracking` es checkbox nativo. Sin cambios reales → toast "No hay cambios" y no cierra |

---

## Problemas resueltos

1. **Columna `state` faltante en BD** → `ALTER TABLE user ADD state NVARCHAR(50) DEFAULT 'pendiente_habilitacion'`
2. **DNI duplicado en seed** → Usar DNI libre (`87654321`)
3. **CORS bloqueado** → `allow_credentials=True` incompatible con `allow_origins=["*"]` → solución: `allow_credentials=False`
4. **Tests rotos por cambio `active` → `state`** → Actualizado `auth-flow.test.tsx` a `state: 'activo'` y expect `'Activo'`
5. **`updateMe` (PATCH /users/me) eliminado** → el backend ahora expone `PATCH /users/{id}`; el perfil propio se edita con el id del usuario logueado
6. **En `/usuarios` "Ver" seguía mostrando un TODO** → no era código: se estaba sirviendo `dist/` viejo. Usar `npm run dev` (HMR) en vez de `preview`/abrir `dist`, y regenerar con `npm run build`

---

## Pendientes (Fases 7+ según plan.md)

### Fase 7 — Users (Etapa 1 API)
- [x] `PATCH /users/{id}` (parcial; 409 si email/dni/phone son de otro usuario; no edita rol/state/password)
- [x] `PATCH /users/{id}/habilitar` → `state = habilitado_entrenar`
- [x] `DELETE /users/{id}` → 204
- [x] `GET /users/{id}` (detalle, `UserDetailDialog`)
- [x] `GET /users/me` corregido en API
- [ ] **Verificar permiso de cliente** en `/mi-perfil` con `PATCH /users/{id}`: el spec lo marca admin-only; si el backend no permite edición propia, dará 403 (definir `/users/me` para clientes)
- [ ] Alta de socio desde admin ("Nuevo socio" en `/usuarios` sigue sin endpoint/handler)
- [ ] Paginación, orden, búsqueda server-side

### Fase 8 — Exercises (Etapa 2 API)
- [ ] `src/features/exercises/` (CRUD + filtro `?muscular_group=`)
- [ ] Tipos: `Exercise`, `ExerciseCreate`, `ExerciseUpdate`
- [ ] Endpoints: `GET/POST /exercises`, `GET/PATCH/DELETE /exercises/{id}`

### Fase 9 — Sport Profiles (Etapa 3 API) ✅
- [x] `src/features/sportProfiles/`
- [x] "Mi perfil deportivo" (cliente, solo lectura `/me`) + vista admin `/perfiles-deportivos` (CRUD)
- [x] Endpoints: `GET/POST /sport-profiles`, `GET /sport-profiles/me`, `GET/PATCH/DELETE /sport-profiles/{id}`

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

## Repositorio / Git

- Remoto: `origin` → https://github.com/Raiyen00/front-gym.git
- Rama actual: `Lautaro` (trackea `origin/Lautaro`)
- Último commit: `cec1579` — *feat: migrar frontend a React 19 + Vite + TS e implementar gestión de socios* (94 archivos, +12644 / -1696)
- `.gitignore` excluye `node_modules/`, `dist/`, `coverage/` y `.env`

---

## Mejoras (ideas futuras — NO entran en el MVP)

### Multi-gimnasio (multi-tenant) — anotado 2026-10-18

**Idea:** el software podría usarse/abrirse para varios gimnasios (incluso open-source).
Hoy está pensado para **un solo gimnasio**, donde `admin` = dueño del gimnasio.

**Cómo sería:**

- Tabla `gyms`: un registro por gimnasio.
- `user.gym_id`: admin, profesor y cliente pertenecen a un gym.
- Cada tabla de negocio (perfiles deportivos, rutinas, ejercicios, pagos) lleva `gym_id`.
- **Super-admin** (el proveedor, o sea: nosotros): crea gyms y asigna el primer admin de cada uno.

**Regla de oro:** el filtro por `gym_id` NO se escribe a mano en cada endpoint. Un
*dependency* resuelve el `gym_id` del token y lo inyecta en todas las queries. Y la API
rechaza por token, no por lo que muestra el front (el front no es la barrera).

**Super-admin: tabla aparte, NO un rol más en `user`.**

- Un super-admin no pertenece a ningún gym. Si fuera `rol = super_admin` en `user`
  habría que permitir `gym_id = null` y la regla "si es null → es plataforma": un solo
  error y cualquiera con sesión válida entra a todo.
- Tabla `platform_admins` + login propio (`/platform/auth/login`) + token con scope
  `platform` + dependency `require_platform_admin` en `/platform/*`.
- El primero se crea una vez (igual que `seed_admin.py` hoy).

**Impacto real si se hiciera:**

| Dónde | Qué implica |
|-------|-------------|
| API | Tabla `gyms`, `gym_id` en todas las tablas + migración, dependency de scoping, rutas `/platform/*`, tabla de super-admins. **Es lo caro.** |
| Front | Poco: el `gym_id` viene en el token, no se muestra en la UI. Lo nuevo es un **segundo login** (platform) + guard + layout/nav de "Gimnasios" (~5 archivos, pero es un flujo de auth entero). |

**Por qué NO ahora:** MVP con menos de un mes de entrega. Con un solo gimnasio, el `admin`
actual ya es el dueño y no hay nada que cambiar.

**Póliza barata (esto sí hacer):** no hardcodear datos del gimnasio en el front (nombre,
logo, settings). Dejarlos configurables en un solo lugar, como ya se hace con
`VITE_API_BASE_URL` / `ApiUrlBadge`. Costo hoy: casi cero.

---

## Próximos pasos inmediatos

1. **Probar Fase 9 con API real** (`python -m uvicorn main:app --reload`): alta de perfil (elegir socio), edición parcial, borrado y `/mi-perfil-deportivo` con un cliente. Verificar 403 al forzar escritura como cliente y 404 con `user_id` inexistente.
2. **Confirmar permisos de cliente** en `/mi-perfil` (`PATCH /users/{id}` admin-only) → si sigue dando 403, definir `/users/me` para clientes.
3. **Arreglar CORS en API** → `allow_credentials=False` en `main.py` (si aún no está).
4. **Comenzar Fase 8 (Exercises)** cuando corresponda.