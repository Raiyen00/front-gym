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

La URL también es editable en runtime desde el badge `ApiUrlBadge` (`setApiBaseUrl`).

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
│   ├── Brand.tsx
│   └── ApiUrlBadge.tsx
├── config/
│   └── nav.ts               # Items de navegación con allowedRoles
├── features/
│   └── auth/                # api, schema, context, componentes y tests
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

Endpoints documentados en el `plan.md` de `GymApi`:

- `POST /auth/register` — JSON (`email, password, name, lastname, dni, phone`)
- `POST /auth/login` — `application/x-www-form-urlencoded` (`username`, `password`)
  → devuelve **solo** el token; el usuario se hidrata con `GET /users/me`
- `GET /users/me` — perfil de la sesión activa
- `GET /` — health check

**Roles:** `admin`, `profesor`, `cliente`. Las rutas se protegen con `RequireAuth`
y `RequireRole`; el menú se filtra por rol (`config/nav.ts`).

**Manejo de errores:** 401 (sesión expirada → logout global), 403 (acceso denegado),
404, 409 y 422 se traducen a mensajes en español.

---

## 🖥️ Rutas

| Ruta          | Acceso                          |
| ------------- | ------------------------------- |
| `/`           | Público (login / registro)      |
| `/login`      | Público (login / registro)      |
| `/dashboard`  | Autenticado                     |
| `/usuarios`   | admin, profesor                 |
| `/ejercicios` | admin, profesor                 |
| `/rutinas`    | admin, profesor, cliente        |
| `/mi-perfil`  | cliente                         |
| `/pagos`      | admin                           |
| `*`           | 404                             |

---

## 🧪 Testing

Configuración en `vite.config.ts` (entorno `jsdom`, setup `src/test/setup.ts`).
MSW (`src/test/msw/server.ts`) intercepta las llamadas a la API **solo en tests**;
las peticiones no cubiertas por un handler se reportan como error.
