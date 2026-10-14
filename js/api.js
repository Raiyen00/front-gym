/**
 * GymSasS - Cliente HTTP y Consumo de API REST Externa
 * Rol: Eros (Frontend Developer)
 * 
 * Este módulo realiza peticiones HTTP reales (vía Fetch API) contra
 * el backend FastAPI corriendo en CONFIG.API_BASE_URL (http://127.0.0.1:8000).
 * 
 * Manejo de respuestas y códigos HTTP:
 * - 200 OK / 201 Created: Respuesta exitosa y almacenamiento de JWT en localStorage
 * - 401 Unauthorized: Captura de credenciales erróneas o token expirado
 * - 409 Conflict: Email o DNI ya registrado en la base de datos
 * - 422 Unprocessable Entity: Parseo detallado de errores de validación de Pydantic
 * - NetworkError: Error claro si la API externa está apagada o bloqueada por CORS
 */

const API = {
  // Obtener token JWT almacenado
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  },

  // Guardar sesión (token y usuario)
  setSession(token, user) {
    if (token) localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    if (user) localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Obtener datos del usuario en sesión
  getCurrentUser() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Limpiar sesión al cerrar
  clearSession() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
  },

  // Verificar si hay sesión activa
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Petición HTTP base con fetch() hacia la API externa
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Inyectar Token Bearer JWT si existe
    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // 1. Manejo de 401 Unauthorized
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Email o contraseña incorrectos. Verificá tus credenciales.';
        return { success: false, error: message, status: 401 };
      }

      // 2. Manejo de 409 Conflict (ej. Email o DNI ya registrado)
      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'El correo electrónico o DNI ya se encuentra registrado.';
        return { success: false, error: message, status: 409 };
      }

      // 3. Manejo de 422 Unprocessable Entity (Validaciones de esquemas Pydantic)
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        let message = 'Datos inválidos enviados al servidor.';

        if (Array.isArray(errorData.detail)) {
          // Parsear lista de errores de Pydantic
          const errores = errorData.detail.map(d => {
            const campo = d.loc ? d.loc[d.loc.length - 1] : 'campo';
            return `${campo}: ${d.msg}`;
          }).join(' | ');
          message = `Error de validación: ${errores}`;
        } else if (typeof errorData.detail === 'string') {
          message = errorData.detail;
        }

        return { success: false, error: message, status: 422, detail: errorData.detail };
      }

      // 4. Manejo de 403 Forbidden
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Acceso denegado o tu cuenta no está habilitada.';
        return { success: false, error: message, status: 403 };
      }

      // 5. Otros errores 4xx o 5xx
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || `Error en el servidor backend (Código HTTP: ${response.status})`;
        return { success: false, error: message, status: response.status };
      }

      // 204 No Content
      if (response.status === 204) {
        return { success: true, data: null, status: 204 };
      }

      // 200 / 201 Exitoso
      const data = await response.json();
      return { success: true, data, status: response.status };

    } catch (networkError) {
      console.error('Error de red al conectar con la API externa:', networkError);
      return {
        success: false,
        error: `No se pudo conectar con la API en ${CONFIG.API_BASE_URL}. Asegurate de que el servidor FastAPI esté levantado y tenga CORS habilitado.`,
        isNetworkError: true
      };
    }
  },

  /**
   * Healthcheck: Verifica si la API externa responde
   */
  async checkHealth() {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.HEALTH}`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Iniciar Sesión (POST /auth/login)
   * Compatible con payloads JSON y OAuth2 de FastAPI
   */
  async login(email, password) {
  // FastAPI con OAuth2PasswordRequestForm requiere x-www-form-urlencoded
  // y los campos DEBEN llamarse 'username' y 'password'
  const formBody = new URLSearchParams();
  formBody.append('username', email); // Aunque pidas el email al usuario, a FastAPI se lo mandas como 'username'
  formBody.append('password', password);

  const res = await this.request(CONFIG.ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody.toString()
  });

  if (res.success && res.data) {
    const token = res.data.access_token || res.data.token;
    const user = res.data.usuario || res.data.user || {
      email,
      nombre: res.data.nombre || res.data.full_name || email.split('@')[0],
      rol: res.data.rol || 'cliente',
      activo: res.data.active ?? true
    };

    this.setSession(token, user);
    return { success: true, user, token };
  }

  return { success: false, error: res.error || 'Error al iniciar sesión' };
},

  /**
   * Registro de Nuevo Socio (POST /usuarios)
   * Envía los datos compatibles con los esquemas Pydantic del backend
   */
  async register(clienteData) {
    const fullName = `${clienteData.nombre} ${clienteData.apellido}`.trim();

    // Payload que satisface esquemas tanto estrictos (full_name) como ampliados
    const payload = {
      email: clienteData.email,
      password: clienteData.password,
      name: clienteData.nombre,
      lastname: clienteData.apellido,
      // full_name: fullName,
      dni: clienteData.dni,
      phone : clienteData.telefono,
      // objetivo: clienteData.objetivo,
      // rol: clienteData.rol || 'cliente'
    };

    const res = await this.request(CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      return { success: true, data: res.data };
    }

    return { success: false, error: res.error || 'No se pudo completar el registro en el servidor' };
  }
};

window.API = API;
