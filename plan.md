# plan.md — Migración del frontend a React + Tailwind

## Contexto

Migrar la SPA vanilla (`index.html`, `css/styles.css`, `js/*.js`) a **React + TypeScript**
con arquitectura escalable por dominios, integrada contra la API FastAPI
(`C:\Users\chela\PycharmProjects\GymApi`).

- **Stack:** Vite · React · TypeScript · Tailwind v4 · React Router · shadcn/ui ·
  TanStack Query · Context API (auth) · react-hook-form + Zod ·
  Vitest + Testing Library + MSW.
- **API actual:** `POST /auth/register`, `POST /auth/login`, `GET /users/me`, `GET /`.
- **Roles:** `admin`, `profesor`, `cliente`.
  **Login devuelve solo token** → hidratar el usuario con `GET /users/me`.
- **Estrategia:** código listo contra los endpoints del `plan.md` de la API; se integra
  a medida que existan (sin mocks en runtime; MSW solo en tests).

## Reglas transversales

- Preservar claves de storage `gymsass_token` / `gymsass_user`.
- Conservar mensajes en español y manejo de códigos 401/403/404/409/422.
- Fidelidad visual al design system actual (tema oscuro, primary `#10b981`).
  `AuthLayout` idéntico al actual.
- Cada feature = `src/features/<dominio>/` con `api.ts`, `queries.ts`, `schema.ts`,
  `components/`.
- Tests obligatorios para lógica nueva (componentes con interacción, hooks, cliente API).
- Sin commits hasta que se pidan explícitamente.

---

## Fase 0 — Scaffold, tooling y testing

- Proyecto Vite + React + TypeScript.
- `tsconfig` con alias `@/*`; `vite.config.ts` con alias.
- `.env.example` → `VITE_API_BASE_URL=http://127.0.0.1:8000`.
- Tailwind v4 (`@tailwindcss/postcss`) + `postcss.config.js`.
- **Testing:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `jsdom`, `msw`.
  - `vitest.config.ts` (environment `jsdom`, setup `src/test/setup.ts` con `jest-dom`).
  - `src/test/msw/server.ts` (server de MSW para handlers por dominio).
  - Scripts: `test`, `test:watch`, `typecheck` (`tsc --noEmit`), `build`.
- **Entregable:** proyecto levanta y corre tests de humo.
- **Criterio:** `npm run dev`, `npm run build`, `npm run typecheck` y `npm test` pasan.

## Fase 1 — Design system

- `src/index.css`: `@import "tailwindcss"` + `@theme` (colores, radios, sombras,
  tipografía) y variables shadcn (`--background`, `--primary`, `--border`…).
- Conservar `color-scheme: dark`, `font-size: 14px`, `--font-family`.
- Init shadcn (`components.json`) y generar `button`, `input`, `card`, `form`, `alert`,
  `label`, `select`, `skeleton`, `sonner`, `badge`, `dialog`, `table`, `dropdown-menu`.
- **Entregable:** primitivos UI con el look actual.
- **Criterio:** render correcto de paleta; test de `Button` variantes.

## Fase 2 — Núcleo (infra)

- `lib/api/config.ts`: `API_BASE_URL`, `ENDPOINTS`, `STORAGE_KEYS`, `TIMEOUT_MS`.
- `lib/api/client.ts`: `request<T>` con Bearer, `AbortController`, `ApiError`,
  manejo 401/403/404/409/422/red.
- `lib/api/queryKeys.ts`: claves por dominio.
- `lib/formatters.ts`: port de `formatCurrency/Date/DateTime`.
- `lib/utils.ts`: `cn()`.
- `types/`: `enums.ts`, `api.ts`, `user.ts`, `exercise.ts`, `routine.ts`,
  `sportProfile.ts`, `payment.ts`.
- **Entregable:** capa de datos tipada.
- **Criterio:** tests de `client.ts` (éxito, 401, 409, 422, timeout, red) con MSW.

## Fase 3 — Providers y shell

- `app/providers.tsx`: `QueryClientProvider` + `AuthProvider` + `BrowserRouter` +
  `<Toaster/>`.
- `app/router.tsx`: rutas base (`/`, `/login`, `*`).
- `app/layouts/AuthLayout.tsx`: réplica exacta de la pantalla centrada actual
  (marca + card + footer).
- **Entregable:** esqueleto navegable.
- **Criterio:** `/` y `*` (404) renderizan.

## Fase 4 — Feature Auth (real)

- `features/auth/api.ts`: `login` (form-urlencoded `username`/`password`), `me`,
  `register` (payload exacto `email, password, name, lastname, dni, phone`).
- `features/auth/schema.ts`: Zod (email, password ≥8, DNI 7-8, match).
- `features/auth/AuthContext.tsx` + `useAuth.ts`: `{ user, token, status, login, logout }`;
  boot valida con `/users/me`.
- Componentes: `AuthTabs`, `LoginForm`, `RegisterForm`, `SessionView`.
- `routes/AuthPage.tsx`: alterna sesión/formularios.
- **Entregable:** login, registro, sesión y logout reales.
- **Criterio:** login hidrata usuario vía `/users/me`; registro con auto-switch a login;
  401/404/409/422 visibles; tests con MSW.

## Fase 5 — RBAC, layout y navegación

- `routes/guards/RequireAuth.tsx`, `RequireRole.tsx`.
- `app/layouts/DashboardLayout.tsx`: sidebar + topbar.
- `config/nav.ts`: items con `allowedRoles`.
- Rutas protegidas por rol.
- **Entregable:** dashboard vacío solo para autenticados; menú por rol.
- **Criterio:** sin sesión → `/login`; rol sin permiso → 403; tests de guards.

## Fase 6 — Limpieza y docs

- Eliminar `css/`, `js/` legacy e `index.html` antiguo.
- Actualizar `README.md` (estructura, comandos, variables).
- **Criterio:** repo sin restos vanilla; build + tests limpios.

## Fase 7+ — Features por dominio (según etapas de API)

| Fase | API | Feature frontend |
|---|---|---|
| 7 | Etapa 1 · Users | Gestión de socios, `PATCH /users/me`, detalle/edición admin |
| 8 | Etapa 2 · Exercises | Catálogo CRUD + filtro `?muscular_group=` |
| 9 | Etapa 3 · Sport profiles | "Mi perfil deportivo" + vista admin |
| 10 | Etapa 4 · Routines | Editor de rutinas (profesor/admin) + visor read-only (cliente) |
| 11 | Etapa 5 · Payments | Registro de pagos (admin) + "Mi membresía" (cliente) |
| 12 | Etapa 6 · Transversal | Paginación, orden, búsqueda, toasts de mutación |
