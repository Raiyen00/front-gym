# GymSasS — Frontend

Sistema de gestión deportiva y control de socios para centros de entrenamiento.  
**Proyecto Final Integrador — ISFT 194**

SPA en **React + TypeScript** integrada contra la API FastAPI (`GymApi`).

---

## 🚀 Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind v4** + **shadcn/ui** (tema oscuro, primary `#10b981`)
- **React Router** · **TanStack Query** · **Context API** (auth)
- **react-hook-form** + **Zod**
- **Vitest** + **Testing Library** + **MSW**

---

## ⚙️ Puesta en marcha

```bash
npm install
cp .env.example .env      # ajustar VITE_API_BASE_URL si hace falta
npm run dev
```

### Variables de entorno

| Variable            | Descripción              | Default                 |
| ------------------- | ------------------------ | ----------------------- |
| `VITE_API_BASE_URL` | URL base de la API       | `http://127.0.0.1:8000` |

La URL se define al compilar con `VITE_API_BASE_URL`; no se muestra ni se edita desde la interfaz.

### Scripts

| Comando             | Acción                                   |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                   |
| `npm run build`     | Typecheck + build de producción          |
| `npm run preview`   | Sirve el build de producción             |
| `npm run typecheck` | `tsc --noEmit` (app + config)            |
| `npm run test`      | Tests (Vitest, una pasada)               |
| `npm run test:watch`| Tests en modo watch                      |
| `npm run lint`      | ESLint                                   |

---

## 📁 Estructura

```text
src/
├── app/                     # Composición de la app
│   ├── layouts/             # AuthLayout, DashboardLayout
│   ├── providers.tsx        # QueryClient + Auth + Router + Toaster
│   └── router.tsx           # Definición de rutas
├── components/
│   ├── ui/                  # Primitivos shadcn/ui
│   └── Brand.tsx
├── config/
│   └── nav.ts               # Items de navegación con allowedRoles
├── features/
│   ├── auth/                # login, registro, sesión
│   ├── users/               # socios, perfil propio y roles
│   ├── exercises/           # catálogo de ejercicios
│   ├── routines/            # rutinas y renglones por día
│   ├── sportProfiles/       # perfiles deportivos
│   └── payments/            # pagos y membresía
├── lib/
│   ├── api/                 # client (request<T>, ApiError), config, queryKeys
│   ├── formatters.ts        # Moneda / fecha / fecha-hora
│   ├── storage.ts           # Token y usuario (gymsass_token / gymsass_user)
│   └── utils.ts             # cn()
├── routes/                  # Páginas y guards (RequireAuth, RequireRole)
├── test/                    # setup de Vitest + server MSW
├── types/                   # Tipos espejo de los schemas de la API
├── index.css                # Design system (Tailwind + tokens shadcn)
└── main.tsx                 # Punto de entrada
```

---

## 🔌 Integración con la API

El contrato completo vive en el Swagger de `GymApi` (`/docs`). Endpoints que consume este front:

- **Auth:** `POST /auth/register` (JSON) · `POST /auth/login` (`application/x-www-form-urlencoded`, devuelve **solo** el token) · `PATCH /auth/password`
- **Usuarios:** `GET /users` · `GET /users/me` · `GET /users/{id}` · `PATCH /users/me` (perfil propio) · `PATCH /users/{id}` (admin) · `PATCH /users/{id}/rol` (admin) · `PATCH /users/{id}/habilitar` (admin) · `DELETE /users/{id}` (admin)
- **Ejercicios:** `GET/POST /exercises` · `GET/PATCH/DELETE /exercises/{id}` · filtro `?muscular_group=`
- **Perfiles deportivos:** `GET/POST /sport-profiles` · `GET /sport-profiles/me` · `GET/PATCH/DELETE /sport-profiles/{id}`
- **Rutinas:** `GET/POST /routines` · `GET /routines/me` · `GET/PATCH/DELETE /routines/{id}` · `GET/POST /routines/{id}/exercises` · `PATCH/DELETE /routines/{id}/exercises/{re_id}`
- **Pagos:** `GET/POST /payment` (**singular**) · `GET /payment/me` · `GET /payment/{id}` · la API no expone PATCH ni DELETE
- **Health:** `GET /`

El usuario se hidrata con `GET /users/me` después del login.

**Roles:** `admin`, `profesor`, `cliente`. Las rutas se protegen con `RequireAuth`
y `RequireRole`; el menú se filtra por rol (`config/nav.ts`). El RBAC del front es
solo UX: la autoridad real es el backend.

**Manejo de errores:** 401 (sesión expirada → logout global), 403 (acceso denegado),
404, 409 y 422 se traducen a mensajes en español.

---

## 🖥️ Rutas

| Ruta                     | Acceso                     |
| ------------------------ | -------------------------- |
| `/`                      | Público (login / registro) |
| `/login`                 | Público (login / registro) |
| `/dashboard`             | Autenticado                |
| `/usuarios`              | admin, profesor            |
| `/ejercicios`            | admin, profesor            |
| `/rutinas`               | admin, profesor, cliente   |
| `/rutinas/:id`           | admin, profesor, cliente   |
| `/perfiles-deportivos`   | admin                      |
| `/pagos`                 | admin                      |
| `/mi-perfil`             | cliente                    |
| `/mi-perfil-deportivo`   | cliente                    |
| `/mi-membresia`          | cliente                    |
| `*`                      | 404                        |

---

## 🚧 Estado y despliegue

**Al 2026-11-09 el proyecto no está desplegado:** la API y el front corren solo en local.

- Funcionalidad del MVP: fases 0–11 completas (auth, socios, ejercicios, rutinas, perfiles deportivos, pagos y membresía) para los roles admin, profesor y cliente.
- Verificación local: `npm run lint`, `npm run typecheck`, `npm test` (175 tests en 35 archivos) y `npm run build` en verde. El bundle ronda los 793 kB (229 kB gzip) y Vite avisa por tamaño; no hay code-splitting todavía.
- Pendiente antes de publicar:
  - [ ] Desplegar `GymApi` y configurar `CORS` con el origen real del front.
  - [ ] Compilar el front con `VITE_API_BASE_URL` apuntando a la API publicada y servirlo con fallback de SPA a `index.html` (se usa `BrowserRouter`).
  - [ ] Smoke test de los tres roles contra la API real: login, mi perfil, asignar rol, alta de pago, rutina y membresía.
  - [ ] Fase 12: paginación, orden y búsqueda server-side; toasts de mutación y optimistic updates.
  - [ ] Commitear el trabajo de la auditoría 2026-11-04 (etapas A–D).
- Limitaciones conocidas: sin CI ni hooks pre-commit, sin ErrorBoundary global, sin refresh token y con el token en `localStorage`.

---

## 🧪 Testing

Configuración en `vite.config.ts` (entorno `jsdom`, setup `src/test/setup.ts`).
MSW (`src/test/msw/server.ts`) intercepta las llamadas a la API **solo en tests**;
las peticiones no cubiertas por un handler se reportan como error.
