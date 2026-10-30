# MEMORY.md — Contexto del proyecto GymSasS Frontend

**Última actualización:** 2026-10-30

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

✅ **Tests:** 164 tests (33 archivos) — `npm test` verde al 2026-10-30

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

## ✅ Fase 8: Feature Exercises (Etapa 2 API)

- `ENDPOINTS.EXERCISES = '/exercises'`
- `src/features/exercises/`: `api.ts` (CRUD + filtro `?muscular_group=`), `queries.ts`, `schema.ts`, `payload.ts`
- `components/`: `ExercisesPage` (`/ejercicios`, admin y profesor), `ExercisesTable`, `ExerciseFormDialog` (alta/edición), `ExerciseDetailDialog`, `DeleteExerciseDialog`
- Tests: `api.test.ts` (método/path/body), `payload.test.ts`, `ExerciseFormDialog.test.tsx`

---

## ✅ Fase 10: Feature Routines (Etapa 4 API)

- `ENDPOINTS.ROUTINES = '/routines'`; los renglones cuelgan de la rutina (`/routines/{id}/exercises`), las rutas viejas `/routine-exercises` ya no existen.
- `src/features/routines/`:
  - `api.ts`: cabecera (`getRoutines`, `getRoutine`, `createRoutine`, `updateRoutine`, `deleteRoutine`) + renglones (`createRoutineExercise`, `updateRoutineExercise`, `deleteRoutineExercise`)
  - `queries.ts`: hooks con invalidación de `routines.*`
  - `payload.ts`: alta de rutina y PATCH parcial de renglón (solo campos modificados; no permite cambiar el ejercicio)
  - `schema.ts`, `grouping.ts` (agrupa lunes→domingo porque SQL ordena `day` alfabéticamente), `dates.ts`, `share.ts`
  - `components/`: `RoutinesPage` (staff y cliente según rol), `StaffRoutinesView` (tabla + alta + activar/desactivar), `MyRoutinesView` (cliente, sección “Historial” para inactivas), `RoutineDetailPage` (`/rutinas/:id`), `RoutineExercisesByDay`, `RoutineFormDialog`, `RoutineExerciseFormDialog`, `DeleteRoutineDialog`, `DeleteRoutineExerciseDialog`, `RoutinePrintSheet`
- Rutas: `/rutinas` y `/rutinas/:id` (admin, profesor, cliente). Nav: “Rutinas” para los tres roles.
- Tests: `api.test.ts` (395 líneas, método/path/body exactos), `payload.test.ts`, `grouping.test.ts`, `share.test.ts`, `routines-flow.test.tsx`, `MyRoutinesView.test.tsx`, `StaffRoutinesView.test.tsx`, `RoutineExerciseFormDialog.test.tsx`

---

## ✅ Fase 11: Feature Payments (Etapa 5 API)

- `ENDPOINTS.PAYMENTS = '/payment'` (`lib/api/config.ts`) — **la API lo expone en singular**
- `src/features/payments/`:
  - `api.ts`: `getPayments()`, `getMyPayments()`, `getPayment(id)`, `createPayment()`
  - `queries.ts`: hooks + `useCreatePayment` (invalida `payments.all` y `payments.me`)
  - `schema.ts` + `payload.ts`: monto como string (acepta coma decimal), método enum y vencimiento `YYYY-MM-DD` → `${fecha}T00:00:00`; nunca envía `payment_date`
  - `membership.ts`: `daysUntilExpiration`, `getPaymentStatus`, `isPaymentActive`, `getMembershipStatus`, `countExpiredMemberships` (cuenta socios por su último pago, no pagos sueltos)
  - `components/`: `PaymentsPage` (`/pagos`, admin, KPIs + búsqueda + alta + detalle), `MyMembershipPage` (`/mi-membresia`, cliente, estado + historial), `PaymentsTable`, `PaymentFormDialog`, `PaymentDetailDialog`, `PaymentDetails`
- La API **no expone PATCH ni DELETE** de pagos → la UI no ofrece editar/eliminar
- `insights.ts` + `insights.test.ts`: serie mensual de recaudación y conteo de membresías por vencer (cuenta socios por su último pago)
- `MonthlySeriesCard` y `ExpiringMembershipsCard` en `/pagos`; `PaymentsPage.test.tsx` cubre KPIs y tarjetas
- Router y nav: "Pagos" (admin) y "Mi membresía" (cliente)

---

## ✅ Auth: cambio de contraseña (2026-10-27)

- Endpoint del back: `PATCH /auth/password` (autenticado) con JSON `{ old_password, new_password }`; devuelve `UserResponse`. 400 `"Contraseña incorrecta"` si la actual no coincide, 404 si el usuario no existe.
- `ENDPOINTS.PASSWORD = '/auth/password'` (`lib/api/config.ts`).
- `src/types/user.ts`: `UserPasswordUpdate` (espejo de `UserPasswordUpdate` de Pydantic).
- `features/auth/api.ts`: `updatePassword(data)`.
- `features/auth/queries.ts`: `useChangePassword()` (no invalida caché: el token sigue válido).
- `src/lib/passwordPolicy.ts`: regla compartida para contraseñas nuevas (`newPasswordSchema`): mínimo 8, máximo 128, solo letras y números, al menos una mayúscula y un número; `PASSWORD_POLICY_HINT` con el texto visible.
- `src/components/PasswordPolicyNote.tsx`: nota visible con la política, fuera de los `FormField` para no desalinear inputs en grillas de dos columnas (se usa en alta de socio, alta desde admin y los dos cambios de contraseña).
- `features/auth/schema.ts`: `changePasswordSchema` y `loginChangePasswordSchema` (confirmación y nueva ≠ actual); la contraseña nueva usa la política compartida.
- `features/users/schema.ts`: `userCreateSchema.password` usa la misma política.
- `features/auth/components/ChangePasswordDialog.tsx`: diálogo con contraseña actual, nueva y confirmación; error inline + toast.
- `features/auth/components/LoginChangePasswordDialog.tsx`: mismo cambio desde el login, con email precargado. Hace `POST /auth/login` (verifica identidad) → `PATCH /auth/password` con ese token → `POST /auth/login` con la nueva para dejar la sesión abierta. Si la actual es incorrecta, no llega al PATCH.
- `features/auth/queries.ts`: `useChangePassword()` (logueado) y `useLoginChangePassword()` (login → PATCH → login).
- Acceso:
  - Logueado: botón de llave (`KeyRound`, aria-label “Cambiar contraseña”) en el pie del sidebar (`DashboardLayout` → `UserFooter`), para todos los roles.
  - Sin sesión: link “¿Olvidaste tu contraseña?” debajo del campo de contraseña en `LoginForm`.
- Nota: la API no tiene recuperación pública (email/reset token). Sin la contraseña actual no hay forma de cambiarla; el diálogo lo aclara y sugiere contactar al gimnasio.
- Tests: `auth/api.test.ts` (PATCH y body exactos) y `auth-flow.test.tsx` (éxito/error/validación logueado, y flujo desde login con token temporal y doble login).

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
| **Edición de perfil propio** | `ProfilePage` ("Mi perfil") usa `buildUserUpdate` con los `dirtyFields` de RHF → `PATCH /users/{id}` parcial. Sin cambios → toast "No hay cambios para guardar" y no hay request. `UserFormDialog` reusa la misma función |

---

## Problemas resueltos

1. **Columna `state` faltante en BD** → `ALTER TABLE user ADD state NVARCHAR(50) DEFAULT 'pendiente_habilitacion'`
2. **DNI duplicado en seed** → Usar DNI libre (`87654321`)
3. **CORS bloqueado** → `allow_credentials=True` incompatible con `allow_origins=["*"]` → solución: `allow_credentials=False`
4. **Tests rotos por cambio `active` → `state`** → Actualizado `auth-flow.test.tsx` a `state: 'activo'` y expect `'Activo'`
5. **`updateMe` (PATCH /users/me) eliminado** → el backend ahora expone `PATCH /users/{id}`; el perfil propio se edita con el id del usuario logueado
6. **En `/usuarios` "Ver" seguía mostrando un TODO** → no era código: se estaba sirviendo `dist/` viejo. Usar `npm run dev` (HMR) en vez de `preview`/abrir `dist`, y regenerar con `npm run build`
7. **`ProfilePage.test.tsx` en rojo (2026-10-30)** → el test se había agregado en `14cf297` esperando `PATCH /users/me` con `dirtyFields`, pero `ProfilePage` mandaba el form completo a `/users/{id}`. Se implementó el PATCH parcial con `buildUserUpdate` + toast "No hay cambios para guardar" y se actualizó el test a `/users/{id}`, porque `/users/me` ya no existe en la API

---

## Pendientes (Fases 7+ según plan.md)

### Fase 7 — Users (Etapa 1 API)
- [x] `PATCH /users/{id}` (parcial; 409 si email/dni/phone son de otro usuario; no edita rol/state/password)
- [x] `PATCH /users/{id}/habilitar` → `state = habilitado_entrenar`
- [x] `DELETE /users/{id}` → 204
- [x] `GET /users/{id}` (detalle, `UserDetailDialog`)
- [x] `GET /users/me` corregido en API
- [ ] **Verificar permiso de cliente** en `/mi-perfil` con `PATCH /users/{id}`: el spec lo marca admin-only; si el backend no permite edición propia, dará 403 (definir `/users/me` para clientes)
- [x] Alta de socio desde admin (`UserCreateDialog` + `POST /auth/register` desde `/usuarios`)
- [ ] Paginación, orden, búsqueda server-side

### Fase 8 — Exercises (Etapa 2 API) ✅
- [x] `src/features/exercises/` (CRUD + filtro `?muscular_group=`)
- [x] Tipos: `Exercise`, `ExerciseCreate`, `ExerciseUpdate`
- [x] Endpoints: `GET/POST /exercises`, `GET/PATCH/DELETE /exercises/{id}`

### Fase 9 — Sport Profiles (Etapa 3 API) ✅
- [x] `src/features/sportProfiles/`
- [x] "Mi perfil deportivo" (cliente, solo lectura `/me`) + vista admin `/perfiles-deportivos` (CRUD)
- [x] Endpoints: `GET/POST /sport-profiles`, `GET /sport-profiles/me`, `GET/PATCH/DELETE /sport-profiles/{id}`

### Fase 10 — Routines (Etapa 4 API) ✅
- [x] `src/features/routines/`
- [x] Editor rutinas (profesor/admin) + visor read-only (cliente) con "Historial" de inactivas
- [x] Endpoints: `GET/POST /routines`, `GET/PATCH/DELETE /routines/{id}`, `POST/GET /routines/{id}/exercises`, `PATCH/DELETE /routines/{id}/exercises/{re_id}`

### Fase 11 — Payments (Etapa 5 API) ✅
- [x] `src/features/payments/`
- [x] Registro de pagos (admin) + "Mi membresía" (cliente)
- [x] Endpoints: `GET/POST /payment`, `GET /payment/me`, `GET /payment/{id}` (sin PATCH/DELETE en la API)

### Fase 12 — Transversal (Etapa 6 API)
- [ ] Paginación, orden, búsqueda global
- [ ] Toasts de mutación (éxito/error) consistentes
- [ ] Optimistic updates donde corresponda

### Rediseño visual (2026-10-21) ✅
- [x] Dirección "bitácora de entrenamiento": tinta verde, hueso y menta eléctrica; grilla técnica como motivo.
- [x] Tipografía: `Archivo` (display) + `Instrument Sans` (UI), cargadas en `index.html`.
- [x] Auth de dos columnas con statement editorial; shell con sidebar seccionado (General / Gestión / Mi cuenta) y topbar mobile.
- [x] Panel con hero, accesos rápidos por rol, tarjeta de cuenta y "Primeros pasos".
- [x] Tokens y utilidades en `src/index.css`; primitivos shadcn ajustados (button, card, input, select, table, dialog, badge, alert).
- [x] Verificado: `npm test` (164 al 2026-10-30), `npm run typecheck`, `npm run lint`, `npm run build`.

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
- Último commit: `14cf297` — *Se agregaron las features de rutina/ejercicios y cambios visuales en pagos*
- Commits previos relevantes: `1fc5b88` (pagos + rediseño), `da4e685` (perfiles deportivos), `cec1579` (migración a React 19 + Vite + TS)
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

1. **Probar con API real** (`python -m uvicorn main:app --reload`) las features nuevas:
   - Ejercicios: alta/edición/borrado y filtro por grupo muscular.
   - Rutinas: alta como profesor, renglones por día, activar/desactivar, "Historial" e impresión; visor como cliente en `/rutinas`.
   - Pagos: alta, KPIs, serie mensual, vencimientos y `/mi-membresia`.
   - Cambio de contraseña: desde el sidebar y desde "¿Olvidaste tu contraseña?" en el login.
2. **Confirmar permisos de cliente** en `/mi-perfil` (`PATCH /users/{id}` figura como admin-only en el spec) → si da 403, definir `/users/me` para clientes.
3. **Arreglar CORS en API** → `allow_credentials=False` en `main.py` (si aún no está).
4. **Fase 12 (transversal)**: paginación, orden y búsqueda server-side; toasts de mutación consistentes; optimistic updates donde corresponda.
5. **Rutinas**: el 409 (ejercicio repetido / posición ocupada) todavía no existe en la API; el formulario ya lo muestra inline. Verificar cuando se implemente.