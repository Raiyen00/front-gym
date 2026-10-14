/**
 * GymSasS - Controlador de Autenticación y Registro (Auth)
 * Rol: Eros (Frontend Developer)
 * 
 * Cumplimiento del Plan (Semanas 1 y 2):
 * - Semana 1: Formulario y maquetado de Registro de Socios (RF-01, RF-02)
 * - Semana 2: Integración HTTP (Auth). Conexión de Login y Registro.
 *             Almacenamiento de token JWT en localStorage.
 *             Captura de 401 Unauthorized y mensajes amigables en pantalla.
 * - Semana 4: Captura de códigos de error 4xx (409 Mail duplicado, 422 validaciones Pydantic).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar pestañas de cambio entre Login y Registro
  setupAuthTabs();

  // Inicializar formularios
  setupLoginForm();
  setupRegisterForm();

  // Inicializar botón de cerrar sesión
  setupLogoutButton();

  // Verificar estado de sesión actual en localStorage
  checkSessionState();

  // Mostrar y permitir configurar la URL del backend exterior
  const apiBadge = document.getElementById('api-url-badge');
  if (apiBadge) {
    apiBadge.textContent = CONFIG.API_BASE_URL;
    apiBadge.title = 'Clic para cambiar la URL de la API';
    apiBadge.style.cursor = 'pointer';
    apiBadge.addEventListener('click', () => {
      const nuevaUrl = prompt('Configurar URL de la API externa:', CONFIG.API_BASE_URL);
      if (nuevaUrl && nuevaUrl.trim()) {
        localStorage.setItem('gymsass_api_url', nuevaUrl.trim());
        location.reload();
      }
    });
  }
});

/**
 * Control de cambio entre pestañas "Iniciar sesión" y "Registrar socio"
 */
function setupAuthTabs() {
  const tabBtns = document.querySelectorAll('.segmented-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.dataset.tab;
      const targetPane = document.getElementById(target);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // Limpiar alertas previas al cambiar de pestaña
      UI.clearAlert('login-alert');
      UI.clearAlert('register-alert');
    });
  });
}

/**
 * Formulario de Login (POST /auth/login - Semana 2)
 */
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    UI.clearAlert('login-alert');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!email || !password) {
      UI.showAlert('login-alert', 'Por favor ingresá tu correo y contraseña.', 'warning');
      return;
    }

    UI.setLoading(submitBtn, true);

    try {
      const res = await API.login(email, password);

      if (res.success) {
        UI.showToast(`¡Bienvenido/a, ${res.user.nombre || 'Socio'}!`, 'success');
        
        // Mostrar vista de sesión activa
        renderSessionView(res.user, res.token);
      } else {
        // Captura amigable del 401 Unauthorized o 403 Forbidden
        UI.showAlert('login-alert', res.error, 'error');
        UI.showToast(res.error, 'error');
      }
    } catch (err) {
      UI.showAlert('login-alert', 'Ocurrió un problema de comunicación con el servidor.', 'error');
    } finally {
      UI.setLoading(submitBtn, false, 'Ingresar al sistema');
    }
  });
}

/**
 * Formulario de Registro de Socios (POST /usuarios - RF-01, RF-02)
 */
function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    UI.clearAlert('register-alert');

    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido = document.getElementById('reg-apellido').value.trim();
    const dni = document.getElementById('reg-dni').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const telefono = document.getElementById('reg-telefono').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const objetivo = document.getElementById('reg-objetivo')?.value || 'Salud general';

    const submitBtn = form.querySelector('button[type="submit"]');

    // Validaciones en Frontend antes del envío
    if (!nombre || !apellido || !dni || !email || !password) {
      UI.showAlert('register-alert', 'Todos los campos obligatorios deben estar completos.', 'warning');
      return;
    }

    if (password.length < 8) {
      UI.showAlert('register-alert', 'La contraseña debe tener al menos 8 caracteres (requerido por el backend).', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      UI.showAlert('register-alert', 'Las contraseñas no coinciden. Por favor verificalas.', 'warning');
      return;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      UI.showAlert('register-alert', 'El DNI debe contener 7 u 8 dígitos numéricos.', 'warning');
      return;
    }

    const clienteData = {
      nombre,
      apellido,
      dni,
      email,
      telefono,
      password,
      objetivo,
      rol: 'cliente'
    };

    UI.setLoading(submitBtn, true);

    try {
      const res = await API.register(clienteData);

      if (res.success) {
        UI.showAlert(
          'register-alert',
          '¡Cuenta creada con éxito! Ya podés iniciar sesión con tus credenciales.',
          'success'
        );
        UI.showToast('Socio registrado correctamente', 'success');
        form.reset();

        // Cambiar automáticamente a la pestaña de login tras 1.5 segundos
        setTimeout(() => {
          const loginTabBtn = document.querySelector('[data-tab="tab-login"]');
          if (loginTabBtn) loginTabBtn.click();
          const emailInput = document.getElementById('login-email');
          if (emailInput) {
            emailInput.value = email;
            document.getElementById('login-password')?.focus();
          }
        }, 1600);
      } else {
        // Captura de códigos 409 (Duplicado) o 422 (Validación Pydantic)
        UI.showAlert('register-alert', res.error, 'error');
        UI.showToast(res.error, 'error');
      }
    } catch (err) {
      UI.showAlert('register-alert', 'Error al conectar con la API de registro.', 'error');
    } finally {
      UI.setLoading(submitBtn, false, 'Crear cuenta de socio');
    }
  });
}

/**
 * Control del botón Cerrar Sesión
 */
function setupLogoutButton() {
  const btnLogout = document.getElementById('btn-logout');
  if (!btnLogout) return;

  btnLogout.addEventListener('click', () => {
    API.clearSession();
    UI.showToast('Sesión cerrada correctamente', 'info');

    // Alternar vistas
    const viewSession = document.getElementById('view-session');
    const viewAuth = document.getElementById('view-auth-forms');

    if (viewSession) viewSession.classList.add('d-none');
    if (viewAuth) viewAuth.classList.remove('d-none');

    // Limpiar input de contraseña
    const passwordInput = document.getElementById('login-password');
    if (passwordInput) passwordInput.value = '';
  });
}

/**
 * Verificar si el usuario ya cuenta con token y sesión activa
 */
function checkSessionState() {
  const currentUser = API.getCurrentUser();
  const token = API.getToken();

  if (API.isAuthenticated() && currentUser) {
    renderSessionView(currentUser, token);
  } else {
    const viewSession = document.getElementById('view-session');
    const viewAuth = document.getElementById('view-auth-forms');

    if (viewSession) viewSession.classList.add('d-none');
    if (viewAuth) viewAuth.classList.remove('d-none');
  }
}

/**
 * Renderizar la vista de usuario autenticado
 */
function renderSessionView(user, token) {
  const viewSession = document.getElementById('view-session');
  const viewAuth = document.getElementById('view-auth-forms');

  if (!viewSession || !viewAuth) return;

  // Ocultar formularios y mostrar sesión
  viewAuth.classList.add('d-none');
  viewSession.classList.remove('d-none');

  // Iniciales para el avatar
  const iniciales = ((user.nombre ? user.nombre[0] : '') + (user.apellido ? user.apellido[0] : '')).toUpperCase() || 'US';
  const avatarEl = document.getElementById('session-avatar');
  if (avatarEl) avatarEl.textContent = iniciales;

  // Textos y datos del usuario
  const greetingEl = document.getElementById('session-greeting');
  if (greetingEl) greetingEl.textContent = `¡Hola, ${user.nombre || 'Socio'}!`;

  const nameEl = document.getElementById('session-user-name');
  if (nameEl) nameEl.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Usuario';

  const emailEl = document.getElementById('session-user-email');
  if (emailEl) emailEl.textContent = user.email || '-';

  const roleEl = document.getElementById('session-user-role');
  if (roleEl) {
    roleEl.textContent = user.rol === 'admin' ? 'Administrador' : 'Socio / Cliente';
  }

  const statusEl = document.getElementById('session-user-status');
  if (statusEl) {
    const activo = user.activo !== false;
    statusEl.textContent = activo ? 'Habilitado' : 'Pendiente de aprobación';
    statusEl.style.color = activo ? 'var(--primary)' : 'var(--warning)';
  }

  const tokenEl = document.getElementById('session-token-preview');
  if (tokenEl) {
    tokenEl.textContent = token || API.getToken() || 'Bearer (sin token)';
  }
}
