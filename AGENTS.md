# AGENTS.md

## Proyecto

- Frontend de GymSasS: SPA en React 19 + TypeScript (Vite) que consume una API FastAPI externa. En este repo no hay código de backend.
- Flujo de entrada: `src/main.tsx` -> `src/App.tsx` -> `src/app/providers.tsx` -> `src/app/router.tsx`. El orden de los providers (QueryClient -> Auth -> BrowserRouter) importa porque auth usa el query client.
- Los copys de UI, comentarios, mensajes de validación y errores están en español (rioplatense). Mantenerlos así.
- Al iniciar siempre lee MEMORY.md (notas locales, no versionadas; si no existe, seguí con este archivo y si no existe , crealo)

## Comandos

- `npm run dev` para verificación manual. No validar contra `dist/`: es un build viejo e ignorado por git.
- `npm run lint`, `npm run typecheck`, `npm test` (una pasada, ~60 s), `npm run test:watch`.
- Test puntual: `npm test -- src/features/payments/api.test.ts`; agregar `-t "nombre del test"` para acotar más.
- `npm run build` corre el typecheck de la app + build de Vite; no chequea `vite.config.ts`. Usar `npm run typecheck` para ambos configs.
- No hay CI ni hooks pre-commit. Correr lint, typecheck y tests antes de entregar trabajo.

## Despliegue

- **Estado (2026-11-09): sin deploy.** Ni la API (`GymApi`) ni este front están publicados; todo corre en local (`uvicorn` en `127.0.0.1:8000` + `npm run dev` en `5173`).
- Front: `npm run build` genera `dist/`. El hosting debe servir `index.html` como fallback de SPA (se usa `BrowserRouter`) y definir `VITE_API_BASE_URL` al compilar porque Vite la inlinea. La URL de la API no se muestra ni se edita desde la UI.
- API: al publicarla, configurar `CORS` con el origen real del front (`allow_origins` explícito; `allow_credentials=True` es incompatible con `["*"]`) y servir por HTTPS.
- Antes de publicar correr `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`.
- Queda verificar contra la API real: `PATCH /users/me`, `PATCH /users/{id}/rol`, el vencimiento de pagos (`T23:59:59`) y el 409 de perfiles deportivos.

## Arquitectura

- Cada feature vive en `src/features/<dominio>/`: `api.ts`, `queries.ts`, `schema.ts` (Zod), `payload.ts` (armado de bodies), `components/` y tests colocados.
- Los componentes nunca llaman a `fetch` ni hardcodean URLs. Flujo: componente -> hook de query/mutación -> `api.ts` de la feature -> `request<T>()` en `src/lib/api/client.ts`.
- Registrar endpoints en `ENDPOINTS` (`src/lib/api/config.ts`) y claves de caché en `queryKeys` (`src/lib/api/queryKeys.ts`). Extender ambos al agregar un dominio e invalidar las claves correspondientes después de cada mutación.
- TanStack Query es dueño del estado del servidor; `AuthContext` solo guarda sesión/usuario. No duplicar datos del servidor en Context.
- Auth: el login es form-urlencoded y devuelve solo el token; el usuario se hidrata con `GET /users/me`. Cualquier 401 autenticado dispara el logout global vía `onUnauthorized`.
- Una página nueva necesita las tres cosas: ruta + guard en `src/app/router.tsx`, ítem de navegación con `allowedRoles` en `src/config/nav.ts`, y el componente de la feature. El RBAC del front es solo UX; la autoridad real es el backend.

## Particularidades del contrato de API

- `ENDPOINTS.PAYMENTS` es `/payment` (singular). La API no tiene PATCH ni DELETE de pagos, por eso la UI no los ofrece.
- Los PATCH son parciales a propósito: el perfil propio se edita con `PATCH /users/me` y la gestión admin con `PATCH /users/{id}` (ambos mandan solo los `dirtyFields` de RHF); perfiles deportivos arman un diff contra el perfil original (`features/sportProfiles/payload.ts`). Si no hay cambios, no hacer la request.
- Roles: `PATCH /users/{id}/rol` con `{ rol }` (admin). El backend responde 400 si el admin intenta cambiar su propio rol, por eso la acción no se muestra sobre el usuario logueado.
- Nunca mandar campos generados por el servidor (`created_at`, `payment_date`, `register_date`). Los nombres del backend son snake_case; `src/types/*` espejan Pydantic y se escriben a mano (sin codegen).
- Rutinas: los renglones cuelgan de la rutina (`POST|GET /routines/{id}/exercises`, `PATCH|DELETE /routines/{id}/exercises/{re_id}`); las viejas rutas `/routine-exercises` ya no existen. El POST no lleva `routine_id`, el PATCH manda solo los campos modificados (`features/routines/payload.ts`) y puede incluir `exercise_id` para cambiar el ejercicio del renglón. `day` viaja en minúscula y sin acento (`DIAS_SEMANA`), `rest` en segundos y `position` ordena dentro del día; la UI agrupa lunes→domingo porque SQL ordena `day` alfabéticamente. El detalle lee el `exercise` anidado de `GET /routines/{id}` (no pide `GET /exercises/{id}` por renglón). La cabecera nace activa (`state: true` fijo en el alta) y se activa/desactiva con `PATCH /routines/{id}` desde el listado o el detalle; el cliente ve las inactivas en una sección “Historial”. El 409 (ejercicio repetido o posición ocupada) se muestra inline en el formulario. El alta de rutina solo ofrece socios `habilitado_entrenar` y, para admin, con perfil deportivo (`GET /sport-profiles`); el 409 “El usuario no tiene un perfil deportivo” se muestra inline en `RoutineFormDialog`.
- URL base: `VITE_API_BASE_URL` > `http://127.0.0.1:8000`. Se define al compilar; no hay override en runtime ni se expone la URL en la UI.
- Profesor con rutina propia: la API no tiene escritura self-service de perfiles deportivos (`POST|PATCH|DELETE /sport-profiles` son admin-only; solo `GET /sport-profiles/me` acepta a cualquier autenticado). Un admin habilita al profesor (`PATCH /users/{id}/habilitar` → `state: habilitado_entrenar`) y le crea el perfil; después el profesor aparece en el select de `RoutineFormDialog` y arma su rutina (`POST /routines` solo exige que el socio tenga perfil). `/mi-perfil` y `/mi-perfil-deportivo` están habilitados para `profesor` en `nav.ts` y `router.tsx`; `habilitar` no tiene vuelta a `activo`.

## Testing y estilos

- Vitest + Testing Library + MSW. `src/test/msw/server.ts` no tiene handlers por defecto; `src/test/setup.ts` trata las requests no manejadas como error. Agregar handlers por test con `server.use(...)`; se resetean después de cada test.
- Los tests de API verifican método/path/body exactos contra `http://127.0.0.1:8000`. Un `VITE_API_BASE_URL` no default los rompe.
- No hay `tailwind.config.*`: los tokens y el tema de Tailwind v4 viven en `src/index.css`. Preferir utilidades/tokens semánticos antes que colores crudos. Reusar las primitivas de `src/components/ui` (shadcn "new-york") antes de crear nuevas.

## Convenciones del repo

- `plan.md` pide tests para lógica nueva y no commitear salvo pedido explícito. Cumplir ambas reglas.
- `README.md`, `MEMORY.md`, `plan.md` y `STUDY.md` se actualizaron el 2026-11-09. Aun así, ante dudas de rutas o contrato, confiar en `src/app/router.tsx`, `src/config/nav.ts` y el código actual.
- `STUDY.md` son notas de presentación ignoradas por git. `MEMORY.md` tiene historial útil de API/backend, pero verificar sus afirmaciones contra el código antes de confiar en ellas.
