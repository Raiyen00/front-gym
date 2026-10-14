# GymSasS — Frontend (Login & Registro)

Sistema de gestión deportiva y control de socios para centros de entrenamiento.  
**Proyecto Final Integrador — ISFT 194**  
**Rol:** Frontend Developer (Eros)

---

## 📌 Alcance Actual (Semanas 1 y 2)

* **Inicio de Sesión (`POST /auth/login`)**:
  * Autenticación con correo y contraseña.
  * Captura de token **JWT (Bearer)** y guardado en `localStorage`.
  * Captura y manejo amigable del código `401 Unauthorized`.
  * Vista de sesión activa con opción de cerrar sesión.

* **Registro de Socios (`POST /usuarios`)**:
  * Formulario de alta: Nombre, Apellido, DNI, Teléfono, Email, Objetivo de entrenamiento y Contraseña.
  * Validación estricta previa en cliente (longitud de contraseña mínima de 8 caracteres según esquema Pydantic, formato de DNI numérico).
  * Captura amigable de errores HTTP `409 Conflict` (duplicados) y `422 Unprocessable Entity` (validación de backend).

---

## 🚀 Cómo Ejecutar el Frontend

1. **Abrir directamente:**
   * Hacé doble clic en [`index.html`](index.html) para abrirlo en el navegador.

2. **O mediante un servidor web local:**
   * Con extensión **Live Server** en VS Code.
   * O con Python:
     ```bash
     python -m http.server 5500
     ```

---

## ⚙️ Conexión con la API Exterior (FastAPI)

* **URL base por defecto:** `http://127.0.0.1:8000`
* El cliente HTTP ([`js/api.js`](js/api.js)) consume directamente los endpoints expuestos por la API exterior:
  * `POST /auth/login` (admite JSON y OAuth2 form-urlencoded)
  * `POST /usuarios` (compatible con esquemas Pydantic `UserCreate`)
* **Cambio dinámico de URL:** En el pie de página de la aplicación podés hacer clic sobre el badge de la API para cambiar la dirección hacia cualquier host o puerto sin editar el código fuente.

> **Importante para el Backend (CORS):**  
> Asegurarse de que el servidor FastAPI incluya `CORSMiddleware` con `allow_origins=["*"]` o el origen del frontend para permitir las peticiones HTTP del navegador.

---

## 📁 Estructura del Repositorio

```text
front-gym/
├── index.html                 # Interfaz de Login y Registro centrado
├── README.md                  # Documentación del proyecto
├── DEFENSA_TECNICA_EROS.md    # Guía técnica de defensa oral
├── Plan_de_Proyecto_GymSasS.pdf
├── css/
│   └── styles.css             # Sistema de diseño y estilos visuales
└── js/
    ├── config.js              # Configuración global y URL de la API
    ├── ui.js                  # Manejo de alertas y toasts visuales
    ├── api.js                 # Consumo HTTP Fetch sin mocks
    └── auth.js                # Controlador de Login, Registro y Sesión
```
