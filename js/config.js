/**
 * GymSasS - Configuración Global del Frontend
 * Rol: Eros (Frontend Developer)
 */

const CONFIG = {
  // URL base de la API externa (FastAPI en http://127.0.0.1:8000 o configurable desde localStorage)
  API_BASE_URL: localStorage.getItem('gymsass_api_url') || 'http://127.0.0.1:8000',

  // Claves de almacenamiento en localStorage
  STORAGE_KEYS: {
    TOKEN: 'gymsass_token',
    USER: 'gymsass_user'
  },

  // Endpoints de la API FastAPI
  ENDPOINTS: {
    // Autenticación (Semana 2)
    LOGIN: '/auth/login',

    REGISTER: '/auth/register',

    // Usuarios y Registro (Semanas 1 y 2)
    USUARIOS: '/us',
    PERFIL_ME: '/users/me',

    // Healthcheck
    HEALTH: '/'
  },

  // Tiempo límite para requests en milisegundos
  TIMEOUT_MS: 10000
};

// Exponer en window para acceso global
window.CONFIG = CONFIG;
