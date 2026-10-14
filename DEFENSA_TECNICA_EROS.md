# Guía de Defensa Técnica - Rol: Eros (Frontend Developer)
**Proyecto:** GymSasS (MVP) • ISFT 194  
**Objetivo:** Aprobación del TP Final y Defensa Oral

---

## 1. Preguntas Clave del Simulacro de Examen (Semana 6)

### Pregunta 1: "¿Cómo viaja la petición HTTP desde el `fetch()` en tu Frontend hasta la Base de Datos?"
**Respuesta técnica de Eros:**
1. **Disparo en el Frontend:**
   - El usuario hace clic en un botón (ej: "Confirmar Cobro" o "Registrar").
   - El event listener en JavaScript captura el evento (`e.preventDefault()`) para evitar que la página se recargue.
   - Se obtienen y validan los valores de los inputs en el DOM.
2. **Construcción de la Petición HTTP (`fetch`):**
   - Invocamos la función `API.request()` que llama a `window.fetch(url, options)`.
   - Configuramos:
     - **Método HTTP:** `POST`, `GET`, o `PATCH`.
     - **Headers:** `'Content-Type': 'application/json'` y `'Authorization': 'Bearer ' + token` (el token JWT guardado en `localStorage`).
     - **Body:** Los datos serializados con `JSON.stringify(payload)`.
3. **Recepción en Backend (FastAPI):**
   - Llega al **Controller / Router** de Chelo y Hugo (ej: `@router.post("/pagos")`).
   - El Controller utiliza las dependencias de seguridad (`OAuth2PasswordBearer`) para verificar el JWT en el header.
   - Los datos del body son validados automáticamente por **Pydantic** según el schema (`PagoCreate`). Si fallan los tipos, FastAPI rechaza con un código **422 Unprocessable Entity**.
4. **Capa de Servicios y Base de Datos:**
   - Si la validación pasa, el Controller llama al **Service** (lógica de negocio).
   - El Service invoca al **Modelo SQLAlchemy** y ejecuta la consulta SQL hacia la base de datos relacional (ej: `INSERT INTO pago ...`).
5. **Retorno y Actualización de la Vista:**
   - FastAPI responde con código `201 Created` o `200 OK` y el objeto JSON.
   - En mi código de Frontend (`api.js`), la promesa del `fetch()` se resuelve con `await response.json()`.
   - El frontend actualiza el DOM de forma reactiva (cierra el modal, agrega la fila a la tabla y muestra un toast visual de éxito sin recargar la pantalla).

---

### Pregunta 2: "¿Qué hace Pydantic acá y por qué usamos el código 422?"
**Respuesta de Eros:**
- **Pydantic** es la biblioteca de validación de datos y tipado estático que usan Chelo y Hugo en el backend. Define esquemas estrictos (ej: `UsuarioCreate`: Nombre, Apellido, DNI, Email obligatorio).
- Si el frontend envía un campo con tipo incorrecto (ej: DNI con letras, email sin `@`, o campo obligatorio ausente), FastAPI y Pydantic devuelven el código estándar de la especificación HTTP: **422 Unprocessable Entity**.
- **Mi trabajo como Frontend (Eros):**
  - En `api.js`, capturo específicamente el estado `response.status === 422`.
  - Parseo el array de errores `detail` de Pydantic y muestro una alerta amigable en la pantalla (no en la consola), indicándole al usuario exactamente qué campo debe corregir.

---

### Pregunta 3: "¿Cómo funciona la Autenticación con JWT en el Frontend?"
**Respuesta de Eros:**
1. Cuando el usuario envía el formulario de Login, se hace un `POST /auth/login` con email y contraseña.
2. Si las credenciales coinciden con el hash bcrypt de la BD, el backend genera y devuelve un token **JWT** (`access_token`).
3. El frontend recibe el token y lo almacena en `localStorage` mediante `localStorage.setItem('gymsass_token', token)`.
4. En cada petición posterior protegida (como listar socios o asentar pagos), el interceptor en `api.js` agrega automáticamente:
   ```javascript
   headers['Authorization'] = `Bearer ${token}`;
   ```
5. Si el token caduca o es inválido, el backend responde **401 Unauthorized**. Mi código atrapa este código, limpia el `localStorage` y redirige a `index.html` con una alerta clara: *"Sesión expirada o no autorizada"*.

---

### Pregunta 4: "¿Por qué capturás el código 409 Conflict?"
**Respuesta de Eros:**
- Cuando un cliente intenta registrarse con un email o DNI que ya existe en la base de datos, el backend responde con un código **409 Conflict** (RF-04 de Hugo).
- En `auth.js` y `api.js`, atrapo el 409 y muestro una alerta visual: *"El correo electrónico o DNI ya se encuentra registrado en el sistema."* Cumpliendo la pauta de la cátedra de no dejar que la app se rompa ni mostrar errores crudos en consola.

---

## 2. Mapa de Tareas de Eros en el Código

| Requisito | Descripción | Archivo en Frontend |
|---|---|---|
| **RF-01 / RF-02** | Pantalla exclusiva de Bienvenida y Registro de Clientes con DNI, Mail, Teléfono | `frontend/index.html`<br>`frontend/js/auth.js` |
| **Semana 2** | Integración HTTP Login (POST /auth/login), JWT en localStorage, captura de 401 | `frontend/js/api.js`<br>`frontend/js/auth.js` |
| **RF-03** | Dashboard Admin: Listado de socios y Habilitar/Deshabilitar con PATCH | `frontend/admin.html`<br>`frontend/js/admin.js` |
| **RF-08 / RF-12** | Formulario/Modal para registrar pago de socio (Efectivo/MP/Transferencia) con Bearer token | `frontend/admin.html`<br>`frontend/js/admin.js` |
| **RF-09** | Modal y vista de Historial de Pagos de un socio específico (GET /pagos/{id}) | `frontend/admin.html`<br>`frontend/cliente.html` |
| **RF-10** | Banner dinámico de advertencia para el cliente (Al día: verde, Por vencer: amarillo, Vencido: rojo) | `frontend/cliente.html`<br>`frontend/js/cliente.js` |
| **RF-13** | Alertas de vencimientos próximos en el Dashboard del Admin | `frontend/admin.html`<br>`frontend/js/admin.js` |
| **Semana 4** | Captura y renderizado de errores 4xx (401, 409, 422) en pantalla (no en consola) | `frontend/js/api.js`<br>`frontend/js/ui.js` |

---

## 3. Demostración del Flujo End-to-End (Semana 5)

Para demostrar el sistema completo al profesor o a tus compañeros:
1. **Paso 1 (Registro Cliente):** Ingresar a `index.html`, ir a la pestaña "Registrarse", ingresar los datos de un nuevo cliente (Nombre, Apellido, DNI, Email, Password). Al enviar, se muestra confirmación de registro y queda en estado *Pendiente de Aprobación*.
2. **Paso 2 (Admin Inicia Sesión):** Iniciar sesión con `admin@gymsass.com` / `admin123`.
3. **Paso 3 (Admin Habilita Cliente):** En la tabla de socios, ubicar al cliente recién creado y presionar el botón **"Habilitar"** (ejecuta `PATCH /usuarios/{id}/habilitar`).
4. **Paso 4 (Admin Registra Cobro):** Presionar el botón **"Cobrar"** en la fila del cliente. Seleccionar el método (Mercado Pago, Efectivo o Transferencia) y monto. Al confirmar, se asienta el pago y se renueva automáticamente el vencimiento por 30 días.
5. **Paso 5 (Cliente Inicia Sesión):** Cerrar sesión e ingresar con la cuenta del cliente. El cliente verá su **Banner de Membresía Al Día (RF-10)**, su fecha de vencimiento calculada y su comprobante en el **Historial de Pagos**.
