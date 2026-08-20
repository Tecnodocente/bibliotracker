/**
 * ==============================================================================
 * BIBLIOTRACKER IES - Lógica de Cliente PWA (v3.1.0 Producción)
 * ==============================================================================
 * Sistema de inventario, topografía real y catalogación de biblioteca escolar.
 * Autenticación estricta por PIN individual, 17 zonas temáticas y Google Sheets.
 */

// URL real oficial del backend Google Apps Script del centro escolar
const HARDCODED_GAS_URL = "https://script.google.com/macros/s/AKfycbwD4WmoyAnepRpu4Ei0gyAHw-HkEPzjOqmZKZxBu5L1Ex8hKN95IERz7tPqs--1_SJC/exec";

// ==============================================================================
// 1. TOPOGRAFÍA REAL DEL CENTRO EDUCATIVO (17 ZONAS TEMÁTICAS + DINÁMICAS)
// ==============================================================================
const DEFAULT_CENTER_ZONES = [
  { Codigo_Zona: "RV",  Nombre_Zona: "RV — Rincón Violeta (Igualdad y Feminismo)", Color_Hex: "#9d174d", Descripcion: "Lecturas sobre igualdad, feminismo y coeducación" },
  { Codigo_Zona: "CL",  Nombre_Zona: "CL — Canon Lector (Lecturas Recomendadas)", Color_Hex: "#c2410c", Descripcion: "Selección de lecturas recomendadas por niveles" },
  { Codigo_Zona: "1",   Nombre_Zona: "1 — Psicología y Filosofía", Color_Hex: "#6d28d9", Descripcion: "Filosofía, psicología, ética y pensamiento crítico" },
  { Codigo_Zona: "2",   Nombre_Zona: "2 — Religión y Mitología", Color_Hex: "#a21caf", Descripcion: "Historia de las religiones y mitologías" },
  { Codigo_Zona: "3",   Nombre_Zona: "3 — Ciencias Sociales y Derecho", Color_Hex: "#1d4ed8", Descripcion: "Sociología, política, economía y derecho" },
  { Codigo_Zona: "5",   Nombre_Zona: "5 — Ciencias Exactas y Naturales", Color_Hex: "#047857", Descripcion: "Matemáticas, física, química, biología y geología" },
  { Codigo_Zona: "6",   Nombre_Zona: "6 — Ciencias Aplicadas y Tecnología", Color_Hex: "#b45309", Descripcion: "Medicina, ingeniería, informática y robótica" },
  { Codigo_Zona: "7",   Nombre_Zona: "7 — Arte, Música, Juegos y Deportes", Color_Hex: "#0e7490", Descripcion: "Pintura, escultura, cine, música y educación física" },
  { Codigo_Zona: "8",   Nombre_Zona: "8 — Literatura y Lingüística", Color_Hex: "#b91c1c", Descripcion: "Novela, poesía, teatro, cómic y teoría literaria" },
  { Codigo_Zona: "820", Nombre_Zona: "820 — Lengua Inglesa / English Library", Color_Hex: "#4338ca", Descripcion: "Lecturas graduadas y literatura en lengua inglesa" },
  { Codigo_Zona: "840", Nombre_Zona: "840 — Lengua Francesa / Bibliothèque Française", Color_Hex: "#0f766e", Descripcion: "Lecturas graduadas y literatura en lengua francesa" },
  { Codigo_Zona: "9",   Nombre_Zona: "9 — Geografía e Historia", Color_Hex: "#4d7c0f", Descripcion: "Historia universal, de España, geografía y biografías" },
  { Codigo_Zona: "A",   Nombre_Zona: "A — Diccionarios y Enciclopedias", Color_Hex: "#334155", Descripcion: "Obras de consulta general y referencia" },
  { Codigo_Zona: "B",   Nombre_Zona: "B — Escritorio de Ordenadores", Color_Hex: "#0f172a", Descripcion: "Puestos de consulta digital para alumnado" },
  { Codigo_Zona: "C",   Nombre_Zona: "C — Préstamos y Devoluciones", Color_Hex: "#854d0e", Descripcion: "Mostrador principal de circulación bibliotecaria" },
  { Codigo_Zona: "D",   Nombre_Zona: "D — Rincón Lector / Zona Puff", Color_Hex: "#166534", Descripcion: "Espacio informal de lectura relajada" },
  { Codigo_Zona: "E",   Nombre_Zona: "E — Carro de Portátiles", Color_Hex: "#475569", Descripcion: "Armario de carga de dispositivos portátiles" },
  { Codigo_Zona: "FL",  Nombre_Zona: "FL — Fondo Local y Regional", Color_Hex: "#86198f", Descripcion: "Publicaciones sobre el municipio y la comunidad" }
];

const DEFAULT_DEMO_DATA = {
  users: [
    { PIN_Acceso: "1234", Nombre_Profesor: "D. Manuel García (Coordinador)", Rol: "Admin", Email_Contacto: "mgarcia@iescentro.es" },
    { PIN_Acceso: "5678", Nombre_Profesor: "Dña. Carmen López (Dpto. Lengua)", Rol: "Admin", Email_Contacto: "clopez@iescentro.es" },
    { PIN_Acceso: "0000", Nombre_Profesor: "Prof. Ayudante de Guardia", Rol: "Ayudante", Email_Contacto: "guardia@iescentro.es" }
  ],
  zones: [...DEFAULT_CENTER_ZONES],
  spaces: [
    { ID_Espacio: "ESP-08-B1", Zona_CDU: "8 — Literatura y Lingüística", Modulo_Numero: "Módulo 8", Balda_Numero: "Balda 1", Codigo_Barras_Balda: "LOC-08-01" },
    { ID_Espacio: "ESP-08-B2", Zona_CDU: "8 — Literatura y Lingüística", Modulo_Numero: "Módulo 8", Balda_Numero: "Balda 2", Codigo_Barras_Balda: "LOC-08-02" },
    { ID_Espacio: "ESP-RV-B1", Zona_CDU: "RV — Rincón Violeta (Igualdad y Feminismo)", Modulo_Numero: "Módulo RV", Balda_Numero: "Balda 1", Codigo_Barras_Balda: "LOC-RV-01" },
    { ID_Espacio: "ESP-CL-B1", Zona_CDU: "CL — Canon Lector (Lecturas Recomendadas)", Modulo_Numero: "Módulo CL", Balda_Numero: "Balda 1", Codigo_Barras_Balda: "LOC-CL-01" },
    { ID_Espacio: "ESP-01-B1", Zona_CDU: "1 — Psicología y Filosofía", Modulo_Numero: "Módulo 1", Balda_Numero: "Balda 1", Codigo_Barras_Balda: "LOC-01-01" },
    { ID_Espacio: "ESP-05-B1", Zona_CDU: "5 — Ciencias Exactas y Naturales", Modulo_Numero: "Módulo 5", Balda_Numero: "Balda 1", Codigo_Barras_Balda: "LOC-05-01" }
  ],
  books: [
    {
      Codigo_Interno: "SEN-00101",
      ISBN: "9788437604947",
      Titulo: "Don Quijote de la Mancha",
      Autor: "Miguel de Cervantes Saavedra",
      Editorial: "Cátedra",
      Ano: "2015",
      URL_Portada: "https://covers.openlibrary.org/b/isbn/9788437604947-L.jpg",
      ID_Espacio_Actual: "ESP-08-B1",
      Fecha_Ultimo_Inventario: "2026-08-19 10:30:00",
      Estado: "Disponible - Bueno",
      Registrado_Por: "D. Manuel García (Coordinador)"
    },
    {
      Codigo_Interno: "SEN-00102",
      ISBN: "9788466338141",
      Titulo: "Cien años de soledad",
      Autor: "Gabriel García Márquez",
      Editorial: "Debolsillo",
      Ano: "2017",
      URL_Portada: "https://covers.openlibrary.org/b/isbn/9788466338141-L.jpg",
      ID_Espacio_Actual: "ESP-08-B1",
      Fecha_Ultimo_Inventario: "2026-08-19 10:32:00",
      Estado: "Disponible - Excelente",
      Registrado_Por: "D. Manuel García (Coordinador)"
    },
    {
      Codigo_Interno: "SEN-00103",
      ISBN: "9788420674209",
      Titulo: "El banquete",
      Autor: "Platón",
      Editorial: "Alianza Editorial",
      Ano: "2013",
      URL_Portada: "https://covers.openlibrary.org/b/isbn/9788420674209-L.jpg",
      ID_Espacio_Actual: "ESP-01-B1",
      Fecha_Ultimo_Inventario: "2026-08-18 12:10:00",
      Estado: "Disponible - Bueno",
      Registrado_Por: "Dña. Carmen López (Dpto. Lengua)"
    },
    {
      Codigo_Interno: "SEN-00104",
      ISBN: "9788497592208",
      Titulo: "Una habitación propia",
      Autor: "Virginia Woolf",
      Editorial: "Austral",
      Ano: "2016",
      URL_Portada: "https://covers.openlibrary.org/b/isbn/9788497592208-L.jpg",
      ID_Espacio_Actual: "ESP-RV-B1",
      Fecha_Ultimo_Inventario: "2026-08-18 11:00:00",
      Estado: "Disponible - Excelente",
      Registrado_Por: "D. Manuel García (Coordinador)"
    }
  ]
};

// ==============================================================================
// 2. ESTADO GLOBAL DE LA APLICACIÓN
// ==============================================================================
const AppState = {
  currentUser: null,
  users: [],
  zones: [],
  spaces: [],
  books: [],
  activeShelf: null,
  sessionScannedBooks: [],
  gasUrl: "",
  selectedSpacesForPdf: new Set(),
  currentScannerContext: null,
  html5QrCodeScanner: null,
  isTorchOn: false,
  lastScannedCode: null,
  lastScannedTime: 0
};

// ==============================================================================
// 3. UTILIDADES DE ESCAPADO Y RENDERIZADO SEGURO
// ==============================================================================
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderBookCoverMarkup(url, title, author) {
  const cleanTitle = escapeHtml(title || "Libro");
  const initials = escapeHtml(((title || "LB").substring(0, 2)).toUpperCase());

  if (url && url.trim()) {
    const cleanUrl = escapeHtml(url.trim());
    return `
      <div class="relative w-full h-full">
        <img src="${cleanUrl}" alt="Portada" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');" />
        <div class="hidden book-cover-placeholder w-full h-full absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-sm mb-1 text-white">${initials}</div>
          <span class="text-[10px] font-bold leading-tight line-clamp-2 px-1 text-white">${cleanTitle}</span>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="book-cover-placeholder w-full h-full flex flex-col items-center justify-center p-2 text-center">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-sm mb-1 text-white">${initials}</div>
        <span class="text-[10px] font-bold leading-tight line-clamp-2 px-1 text-white">${cleanTitle}</span>
      </div>
    `;
  }
}

// ==============================================================================
// 4. MOTOR DE AUDIO Y FEEDBACK HÁPTICO
// ==============================================================================
class FeedbackEngine {
  constructor() {
    this.ctx = null;
  }

  initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  vibrate(pattern = [35]) {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  beepSuccess() {
    this.vibrate([35]);
    try {
      this.initAudio();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  doubleChime() {
    this.vibrate([40, 50, 40]);
    try {
      this.initAudio();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.frequency.setValueAtTime(987.77, now + 0.1);
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.28);
    } catch (e) {}
  }

  beepShelfSelected() {
    this.vibrate([50]);
    try {
      this.initAudio();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  beepError() {
    this.vibrate([120, 60, 120]);
    try {
      this.initAudio();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  celebrateFanfare() {
    this.vibrate([50, 40, 50, 40, 100]);
    if (window.confetti) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
    this.doubleChime();
  }
}

const feedback = new FeedbackEngine();

// ==============================================================================
// 5. PERSISTENCIA Y CLIENTE GOOGLE APPS SCRIPT
// ==============================================================================
function loadLocalState() {
  const savedUrl = localStorage.getItem("bibliotracker_gas_url");
  if (!savedUrl || savedUrl.trim() === "" || savedUrl.includes("AKfyc...") || savedUrl.includes("AKfycbz_TU_URL_AQUI")) {
    AppState.gasUrl = HARDCODED_GAS_URL;
    localStorage.setItem("bibliotracker_gas_url", HARDCODED_GAS_URL);
  } else {
    AppState.gasUrl = savedUrl.trim();
  }

  const savedUsers = localStorage.getItem("bibliotracker_users");
  AppState.users = savedUsers ? JSON.parse(savedUsers) : [...DEFAULT_DEMO_DATA.users];

  const savedZones = localStorage.getItem("bibliotracker_zones");
  AppState.zones = savedZones ? JSON.parse(savedZones) : [...DEFAULT_DEMO_DATA.zones];

  const savedSpaces = localStorage.getItem("bibliotracker_spaces");
  AppState.spaces = savedSpaces ? JSON.parse(savedSpaces) : [...DEFAULT_DEMO_DATA.spaces];

  const savedBooks = localStorage.getItem("bibliotracker_books");
  AppState.books = savedBooks ? JSON.parse(savedBooks) : [...DEFAULT_DEMO_DATA.books];

  const savedUser = localStorage.getItem("bibliotracker_session_user");
  if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser);
  }

  AppState.spaces.forEach(s => AppState.selectedSpacesForPdf.add(s.ID_Espacio));
}

function saveLocalState() {
  localStorage.setItem("bibliotracker_users", JSON.stringify(AppState.users));
  localStorage.setItem("bibliotracker_zones", JSON.stringify(AppState.zones));
  localStorage.setItem("bibliotracker_spaces", JSON.stringify(AppState.spaces));
  localStorage.setItem("bibliotracker_books", JSON.stringify(AppState.books));
  if (AppState.currentUser) {
    localStorage.setItem("bibliotracker_session_user", JSON.stringify(AppState.currentUser));
  }
}

async function callGAS(action, payload = {}) {
  if (!AppState.gasUrl || AppState.gasUrl.trim() === "") {
    return null;
  }

  const url = AppState.gasUrl.trim();
  const callerName = AppState.currentUser ? AppState.currentUser.Nombre_Profesor : "";
  const callerPin = AppState.currentUser ? AppState.currentUser.PIN_Acceso : "";
  const bodyData = JSON.stringify({ action, callerName, callerPin, ...payload });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: bodyData
    });

    if (!response.ok) {
      throw new Error(`Error en servidor GAS: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn("Fallo en petición GAS, manteniendo modo local:", err);
    throw err;
  }
}

async function syncAllDataFromGAS() {
  if (!AppState.gasUrl) return;
  updateConnectionStatusIndicator("syncing");

  try {
    const res = await callGAS("getAllData");
    if (res && res.status === "success" && res.data) {
      if (res.data.users && res.data.users.length > 0) AppState.users = res.data.users;
      if (res.data.zones && res.data.zones.length > 0) AppState.zones = res.data.zones;
      if (res.data.spaces && res.data.spaces.length > 0) AppState.spaces = res.data.spaces;
      if (res.data.books && res.data.books.length > 0) AppState.books = res.data.books;
      saveLocalState();
      updateConnectionStatusIndicator("connected");
      renderStats();
      renderSpacesList();
      populateZoneSelectors();
      populateShelfDropdowns();
      populateLoginUserSelect();
      feedback.doubleChime();
      showToast("Base de datos sincronizada con Google Sheets", "success");
    } else {
      updateConnectionStatusIndicator("error");
      showToast("Error al procesar la respuesta del servidor", "error");
    }
  } catch (e) {
    updateConnectionStatusIndicator("offline");
    showToast("Sin conexión con Google Sheets. Usando datos locales.", "warning");
  }
}

function updateConnectionStatusIndicator(status) {
  const dot = document.getElementById("status-dot");
  const label = document.getElementById("status-label");
  if (!dot || !label) return;

  if (status === "connected") {
    dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40 flex-shrink-0";
    label.textContent = "Google Sheets";
  } else if (status === "syncing") {
    dot.className = "w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping ring-2 ring-amber-400/40 flex-shrink-0";
    label.textContent = "Sincronizando...";
  } else if (status === "offline" || status === "demo") {
    dot.className = "w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-blue-400/40 flex-shrink-0";
    label.textContent = "Modo Local";
  } else {
    dot.className = "w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-rose-400/40 flex-shrink-0";
    label.textContent = "Error Servidor";
  }
}

// ==============================================================================
// 6. AUTENTICACIÓN ESTRICTA POR PIN INDIVIDUAL
// ==============================================================================
function initAuth() {
  if (AppState.currentUser) {
    applyUserSession(AppState.currentUser);
  } else {
    showLoginModal();
  }
}

function populateLoginUserSelect() {
  const select = document.getElementById("login-user-select");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Selecciona tu nombre en la lista --</option>';

  AppState.users.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.Nombre_Profesor;
    opt.textContent = `${u.Nombre_Profesor} (${u.Rol})`;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

function showLoginModal() {
  const modal = document.getElementById("modal-login");
  const pinInput = document.getElementById("login-pin-input");

  if (!modal) return;
  populateLoginUserSelect();

  if (pinInput) {
    pinInput.value = "";
    pinInput.type = "password";
  }

  modal.classList.remove("hidden");
}

function togglePinVisibility() {
  const pinInput = document.getElementById("login-pin-input");
  const btn = document.getElementById("btn-toggle-pin-visibility");
  if (!pinInput || !btn) return;

  if (pinInput.type === "password") {
    pinInput.type = "text";
    btn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
  } else {
    pinInput.type = "password";
    btn.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
  }
  if (window.lucide) lucide.createIcons();
}

function handleLoginSubmit() {
  const select = document.getElementById("login-user-select");
  const pinInput = document.getElementById("login-pin-input");

  const selectedName = (select ? select.value : "").trim();
  const enteredPin = (pinInput ? pinInput.value : "").trim();

  if (!selectedName) {
    showToast("Por favor, selecciona tu nombre de profesor", "warning");
    feedback.beepError();
    return;
  }

  if (!enteredPin) {
    showToast("Por favor, introduce tu PIN personal", "warning");
    feedback.beepError();
    return;
  }

  // Validar coincidencia exacta de Nombre_Profesor y PIN_Acceso
  const matchedUser = AppState.users.find(u => {
    const uName = String(u.Nombre_Profesor || "").trim().toLowerCase();
    const uPin = String(u.PIN_Acceso || "").trim();
    return uName === selectedName.toLowerCase() && uPin === enteredPin;
  });

  if (matchedUser) {
    AppState.currentUser = matchedUser;
    localStorage.setItem("bibliotracker_session_user", JSON.stringify(matchedUser));
    document.getElementById("modal-login").classList.add("hidden");
    applyUserSession(matchedUser);
    feedback.doubleChime();
    showToast(`Bienvenido/a, ${matchedUser.Nombre_Profesor}`, "success");
  } else {
    showToast("PIN incorrecto para el usuario seleccionado", "error");
    feedback.beepError();
    if (pinInput) {
      pinInput.value = "";
      pinInput.focus();
    }
  }
}

function applyUserSession(user) {
  const nameEl = document.getElementById("user-display-name");
  const roleEl = document.getElementById("user-role-badge");
  const avatarEl = document.getElementById("user-avatar");
  const registeredByLabel = document.getElementById("add-book-registered-by-label");

  if (nameEl) nameEl.textContent = user.Nombre_Profesor;
  if (roleEl) {
    roleEl.textContent = user.Rol;
    roleEl.className = user.Rol === "Admin"
      ? "text-[9px] font-black leading-tight uppercase text-indigo-300"
      : "text-[9px] font-black leading-tight uppercase text-amber-300";
  }
  if (avatarEl) {
    avatarEl.textContent = user.Nombre_Profesor.charAt(0).toUpperCase();
  }
  if (registeredByLabel) {
    registeredByLabel.textContent = user.Nombre_Profesor;
  }

  // Control de Roles: Ocultar o mostrar pestañas de Admin (móvil y desktop)
  const navAdd = document.getElementById("nav-btn-add-book");
  const navSpaces = document.getElementById("nav-btn-spaces");
  const navDesktopAdd = document.getElementById("nav-desktop-btn-add-book");
  const navDesktopSpaces = document.getElementById("nav-desktop-btn-spaces");

  if (user.Rol === "Ayudante") {
    if (navAdd) navAdd.classList.add("hidden");
    if (navSpaces) navSpaces.classList.add("hidden");
    if (navDesktopAdd) navDesktopAdd.classList.add("hidden");
    if (navDesktopSpaces) navDesktopSpaces.classList.add("hidden");
    const navContainer = document.querySelector("nav.lg\\:hidden > div");
    if (navContainer) {
      navContainer.className = "max-w-md mx-auto grid grid-cols-2 gap-2";
    }
    switchTab("locator");
  } else {
    if (navAdd) navAdd.classList.remove("hidden");
    if (navSpaces) navSpaces.classList.remove("hidden");
    if (navDesktopAdd) navDesktopAdd.classList.remove("hidden");
    if (navDesktopSpaces) navDesktopSpaces.classList.remove("hidden");
    const navContainer = document.querySelector("nav.lg\\:hidden > div");
    if (navContainer) {
      navContainer.className = "max-w-md mx-auto grid grid-cols-4 gap-1.5";
    }
  }

  renderStats();
}

function confirmLogout() {
  if (confirm("¿Deseas cerrar la sesión de profesor actual?")) {
    AppState.currentUser = null;
    localStorage.removeItem("bibliotracker_session_user");
    showToast("Sesión cerrada", "info");
    showLoginModal();
  }
}

// ==============================================================================
// 7. NAVEGACIÓN POR PESTAÑAS (TABS RESPONSIVE)
// ==============================================================================
function switchTab(tabId) {
  const tabs = ["locator", "inventory", "add-book", "spaces"];
  const navIds = {
    locator: "nav-btn-locator",
    inventory: "nav-btn-inventory",
    "add-book": "nav-btn-add-book",
    spaces: "nav-btn-spaces"
  };
  const navDesktopIds = {
    locator: "nav-desktop-btn-locator",
    inventory: "nav-desktop-btn-inventory",
    "add-book": "nav-desktop-btn-add-book",
    spaces: "nav-desktop-btn-spaces"
  };

  if (AppState.currentUser && AppState.currentUser.Rol === "Ayudante") {
    if (tabId === "add-book" || tabId === "spaces") {
      showToast("Acceso restringido al profesorado Administrador", "error");
      feedback.beepError();
      return;
    }
  }

  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(navIds[t]);
    const navDesktopBtn = document.getElementById(navDesktopIds[t]);

    if (el) {
      if (t === tabId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
    if (navBtn) {
      if (t === tabId) {
        navBtn.className = "nav-tab-active flex flex-col items-center justify-center py-2 px-1 rounded-xl text-brand-700 transition active:scale-95";
      } else {
        navBtn.className = "flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-500 hover:text-slate-800 font-semibold transition active:scale-95";
      }
    }
    if (navDesktopBtn) {
      if (t === tabId) {
        navDesktopBtn.className = "nav-desktop-btn nav-desktop-active";
      } else {
        navDesktopBtn.className = "nav-desktop-btn";
      }
    }
  });

  if (tabId === "spaces") {
    renderSpacesList();
  } else if (tabId === "add-book") {
    populateZoneSelectors();
    populateShelfDropdowns();
  } else if (tabId === "locator") {
    renderStats();
  }

  if (window.lucide) lucide.createIcons();
}

// ==============================================================================
// 8. CÁMARA Y ESCÁNER DE CÓDIGOS DE BARRAS
// ==============================================================================
function startScanner(context) {
  AppState.currentScannerContext = context;
  const modal = document.getElementById("modal-scanner");
  const titleEl = document.getElementById("scanner-title");
  const manualInput = document.getElementById("scanner-manual-input");

  if (!modal) return;

  const titles = {
    locator: "Localizador: Escanear Libro o ISBN",
    shelf: "Paso 1: Escanear Código de Balda (LOC-...)",
    "inventory-continuous": "Inventario Ráfaga: Escanea Libros",
    "add-isbn": "Alta Libro: Escanear ISBN",
    "add-internal": "Alta Libro: Escanear Código Séneca"
  };

  if (titleEl) titleEl.textContent = titles[context] || "Escaneando código...";
  if (manualInput) {
    manualInput.value = "";
    manualInput.placeholder = context === "shelf" ? "ej. LOC-08-01" : "ej. SEN-00101 o 97884...";
  }

  modal.classList.remove("hidden");
  feedback.initAudio();

  try {
    if (AppState.html5QrCodeScanner) {
      AppState.html5QrCodeScanner.stop().catch(() => {}).finally(() => {
        initHtml5QrCodeReader();
      });
    } else {
      initHtml5QrCodeReader();
    }
  } catch (err) {
    console.error("Error iniciando cámara:", err);
    showToast("No se pudo iniciar la cámara. Usa la entrada manual.", "warning");
  }

  if (window.lucide) lucide.createIcons();
}

function initHtml5QrCodeReader() {
  const qrCodeSuccessCallback = (decodedText) => {
    handleBarcodeScanned(decodedText.trim());
  };

  const config = {
    fps: 15,
    qrbox: { width: 280, height: 160 },
    aspectRatio: 1.0,
    formatsToSupport: [
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.QR_CODE
    ]
  };

  AppState.html5QrCodeScanner = new Html5Qrcode("reader");
  AppState.html5QrCodeScanner.start(
    { facingMode: "environment" },
    config,
    qrCodeSuccessCallback,
    () => {}
  ).then(() => {
    checkTorchSupport();
  }).catch(() => {
    AppState.html5QrCodeScanner.start(
      {},
      config,
      qrCodeSuccessCallback,
      () => {}
    ).catch(e => {
      console.error("Error definitivo en cámara:", e);
      showToast("Cámara no disponible. Usa la entrada manual abajo.", "error");
    });
  });
}

function checkTorchSupport() {
  const torchBtn = document.getElementById("btn-toggle-torch");
  if (!torchBtn || !AppState.html5QrCodeScanner) return;

  try {
    const capabilities = AppState.html5QrCodeScanner.getRunningTrackCapabilities();
    if (capabilities && capabilities.torch) {
      torchBtn.classList.remove("hidden");
    } else {
      torchBtn.classList.add("hidden");
    }
  } catch (e) {
    torchBtn.classList.add("hidden");
  }
}

function toggleScannerTorch() {
  if (!AppState.html5QrCodeScanner) return;
  AppState.isTorchOn = !AppState.isTorchOn;
  AppState.html5QrCodeScanner.applyVideoConstraints({
    advanced: [{ torch: AppState.isTorchOn }]
  }).catch(() => {
    showToast("Linterna no soportada en este dispositivo", "warning");
  });
}

function stopScanner() {
  const modal = document.getElementById("modal-scanner");
  if (modal) modal.classList.add("hidden");

  if (AppState.html5QrCodeScanner) {
    AppState.html5QrCodeScanner.stop().then(() => {
      AppState.html5QrCodeScanner.clear();
      AppState.html5QrCodeScanner = null;
    }).catch(() => {
      AppState.html5QrCodeScanner = null;
    });
  }
}

function submitScannerManualInput() {
  const input = document.getElementById("scanner-manual-input");
  const code = (input ? input.value : "").trim();
  if (!code) {
    showToast("Escribe un código primero", "warning");
    return;
  }
  handleBarcodeScanned(code);
}

function handleBarcodeScanned(code) {
  const now = Date.now();
  if (AppState.lastScannedCode === code && (now - AppState.lastScannedTime < 2200)) {
    return;
  }
  AppState.lastScannedCode = code;
  AppState.lastScannedTime = now;

  const ctx = AppState.currentScannerContext;

  if (ctx === "locator") {
    stopScanner();
    feedback.beepSuccess();
    const input = document.getElementById("locator-search-input");
    if (input) input.value = code;
    handleLocatorSearch(code);
  } else if (ctx === "shelf") {
    stopScanner();
    selectActiveShelfByCode(code);
  } else if (ctx === "inventory-continuous") {
    processBookInventoryScan(code);
  } else if (ctx === "add-isbn") {
    stopScanner();
    feedback.beepSuccess();
    const input = document.getElementById("add-book-isbn");
    if (input) {
      input.value = code;
      fetchMetadataByISBN(code);
    }
  } else if (ctx === "add-internal") {
    stopScanner();
    feedback.beepSuccess();
    const input = document.getElementById("add-book-internal-code");
    if (input) input.value = code;
    showToast(`Código asignado: ${code}`, "success");
  }
}

// ==============================================================================
// 9. MÓDULO 1: LOCALIZADOR DE LIBROS
// ==============================================================================
function handleLocatorSearch(customQuery = null) {
  const input = document.getElementById("locator-search-input");
  const clearBtn = document.getElementById("btn-clear-locator-input");
  const query = (customQuery !== null ? customQuery : (input ? input.value : "")).trim();

  if (clearBtn) {
    clearBtn.className = query ? "absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600" : "hidden";
  }

  if (!query) {
    showToast("Introduce o escanea un código para buscar", "info");
    return;
  }

  const cleanQuery = query.toLowerCase().replace(/[-\s]/g, "");

  const matchedBook = AppState.books.find(b => {
    const bCode = String(b.Codigo_Interno || "").toLowerCase().replace(/[-\s]/g, "");
    const bIsbn = String(b.ISBN || "").toLowerCase().replace(/[-\s]/g, "");
    const bTitle = String(b.Titulo || "").toLowerCase();
    return bCode === cleanQuery || bIsbn === cleanQuery || bTitle.includes(query.toLowerCase());
  });

  const resultCard = document.getElementById("locator-result-card");
  const emptyState = document.getElementById("locator-empty-state");

  if (matchedBook) {
    feedback.beepSuccess();
    renderBookResult(matchedBook);
    if (resultCard) resultCard.classList.remove("hidden");
    if (emptyState) emptyState.classList.add("hidden");
  } else {
    feedback.beepError();
    showToast(`No se encontró ningún ejemplar con '${query}'`, "warning");
    if (resultCard) resultCard.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
  }
}

function clearLocatorInput() {
  const input = document.getElementById("locator-search-input");
  const clearBtn = document.getElementById("btn-clear-locator-input");
  const resultCard = document.getElementById("locator-result-card");
  const emptyState = document.getElementById("locator-empty-state");

  if (input) input.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  if (resultCard) resultCard.classList.add("hidden");
  if (emptyState) emptyState.classList.remove("hidden");
}

function renderBookResult(book) {
  const container = document.getElementById("locator-result-card");
  if (!container) return;

  const space = AppState.spaces.find(s => s.ID_Espacio === book.ID_Espacio_Actual);
  const cduZone = space ? space.Zona_CDU : "Zona no asignada";
  const moduleNum = space ? space.Modulo_Numero : "Sin módulo";
  const shelfNum = space ? space.Balda_Numero : "Sin balda";
  const shelfBarcode = space ? space.Codigo_Barras_Balda : "LOC-00-00";

  const zoneCode = cduZone.split("—")[0].trim().split(" ")[0].trim();
  const zoneClass = `zone-badge-${zoneCode}`;

  const coverHtml = renderBookCoverMarkup(book.URL_Portada, book.Titulo, book.Autor);

  container.innerHTML = `
    <div class="card-saas p-5 sm:p-6 scan-success-pulse space-y-4 shadow-xl border-slate-200">
      
      <!-- Topografía Física Destacada en Gradiente Cobalto / Índigo -->
      <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg shadow-blue-900/30 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] sm:text-xs uppercase font-black tracking-wider px-3 py-1 rounded-full ${zoneClass} shadow-xs font-mono">
            ${escapeHtml(cduZone)}
          </span>
          <span class="text-xs sm:text-sm font-mono font-black text-slate-900 bg-white/95 px-3 py-1 rounded-lg border border-white/40 shadow-sm">
            ${escapeHtml(shelfBarcode)}
          </span>
        </div>

        <div class="flex items-center gap-4 pt-1">
          <div class="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center font-black text-2xl shadow-inner border border-white/20 flex-shrink-0">
            <i data-lucide="map-pin" class="w-7 h-7 text-amber-300"></i>
          </div>
          <div>
            <p class="text-[10px] sm:text-xs text-indigo-200 font-black uppercase tracking-widest">Ubicación Física en Biblioteca:</p>
            <h3 class="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">
              ${escapeHtml(moduleNum)} — <span class="text-amber-300 underline decoration-amber-400/50 underline-offset-4">${escapeHtml(shelfNum)}</span>
            </h3>
          </div>
        </div>
      </div>

      <!-- Ficha Bibliográfica con Portada en Relieve 3D -->
      <div class="flex flex-col sm:flex-row gap-5 items-start pt-2">
        <div class="w-28 sm:w-32 h-40 sm:h-44 book-cover-3d bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 relative cursor-pointer mx-auto sm:mx-0">
          ${coverHtml}
        </div>

        <div class="flex-1 min-w-0 space-y-2 text-center sm:text-left">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span class="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono border border-emerald-200">
              ${escapeHtml(book.Codigo_Interno)}
            </span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono border border-slate-200">
              ISBN: ${escapeHtml(book.ISBN || "Sin ISBN")}
            </span>
          </div>

          <h3 class="text-lg font-black text-slate-900 leading-snug">${escapeHtml(book.Titulo)}</h3>
          <p class="text-sm text-slate-700 font-semibold">${escapeHtml(book.Autor)}</p>
          <p class="text-xs text-slate-400">
            ${escapeHtml(book.Editorial || "Editorial no especificada")} ${book.Ano ? `(${escapeHtml(book.Ano)})` : ""}
          </p>

          <div class="pt-2 text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 border-t border-slate-100">
            <span>Último inventario: <strong class="text-slate-700 font-bold">${formatDate(book.Fecha_Ultimo_Inventario)}</strong></span>
            <span>Estado: <strong class="text-emerald-700 font-bold">${escapeHtml(book.Estado || "Bueno")}</strong></span>
          </div>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
        <button
          onclick="openReassignShelfModal('${escapeHtml(book.Codigo_Interno)}')"
          class="text-xs font-black text-brand-600 hover:text-brand-700 flex items-center gap-1.5 hover:underline active:scale-95 transition"
        >
          <i data-lucide="shuffle" class="w-4 h-4"></i>
          Reubicar ejemplar en otra balda
        </button>
        <span class="text-[11px] text-slate-400 font-medium">Registrado por: ${escapeHtml(book.Registrado_Por || "Admin")}</span>
      </div>

    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// ==============================================================================
// 10. REUBICACIÓN VISUAL DE BALDA (MODAL MODERNO)
// ==============================================================================
function openReassignShelfModal(codigoInterno) {
  const book = AppState.books.find(b => b.Codigo_Interno === codigoInterno);
  if (!book) {
    showToast("Ejemplar no encontrado", "error");
    return;
  }

  const modal = document.getElementById("modal-reassign-shelf");
  const titleEl = document.getElementById("reassign-book-title");
  const codeEl = document.getElementById("reassign-book-code");
  const currentLocEl = document.getElementById("reassign-current-location");
  const hiddenCodeInput = document.getElementById("reassign-book-internal-code");
  const selectEl = document.getElementById("reassign-shelf-select");

  if (!modal || !selectEl) return;

  const currentSpace = AppState.spaces.find(s => s.ID_Espacio === book.ID_Espacio_Actual);
  const currentDesc = currentSpace ? `${currentSpace.Modulo_Numero} - ${currentSpace.Balda_Numero} (${currentSpace.Zona_CDU})` : "Sin balda asignada";

  if (titleEl) titleEl.textContent = book.Titulo;
  if (codeEl) codeEl.textContent = book.Codigo_Interno;
  if (currentLocEl) currentLocEl.textContent = `Actual: ${currentDesc}`;
  if (hiddenCodeInput) hiddenCodeInput.value = book.Codigo_Interno;

  // Poblar select agrupado por las 17 zonas CDU
  selectEl.innerHTML = "";
  const grouped = {};
  AppState.spaces.forEach(s => {
    if (!grouped[s.Zona_CDU]) grouped[s.Zona_CDU] = [];
    grouped[s.Zona_CDU].push(s);
  });

  Object.keys(grouped).forEach(cdu => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = cdu;
    grouped[cdu].forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.ID_Espacio;
      opt.textContent = `${s.Modulo_Numero} — ${s.Balda_Numero} (${s.Codigo_Barras_Balda})`;
      if (book.ID_Espacio_Actual === s.ID_Espacio) {
        opt.selected = true;
      }
      optGroup.appendChild(opt);
    });
    selectEl.appendChild(optGroup);
  });

  modal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeReassignShelfModal() {
  const modal = document.getElementById("modal-reassign-shelf");
  if (modal) modal.classList.add("hidden");
}

async function handleSaveReassignShelf() {
  const hiddenCodeInput = document.getElementById("reassign-book-internal-code");
  const selectEl = document.getElementById("reassign-shelf-select");

  const codigoInterno = (hiddenCodeInput ? hiddenCodeInput.value : "").trim();
  const newSpaceId = (selectEl ? selectEl.value : "").trim();

  if (!codigoInterno || !newSpaceId) {
    showToast("Por favor selecciona una balda válida", "warning");
    return;
  }

  const book = AppState.books.find(b => b.Codigo_Interno === codigoInterno);
  const matchedSpace = AppState.spaces.find(s => s.ID_Espacio === newSpaceId);

  if (!book || !matchedSpace) {
    showToast("Error al identificar el libro o la balda", "error");
    return;
  }

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
  book.ID_Espacio_Actual = matchedSpace.ID_Espacio;
  book.Fecha_Ultimo_Inventario = nowStr;
  saveLocalState();
  feedback.doubleChime();

  closeReassignShelfModal();
  renderBookResult(book);
  renderStats();
  showToast(`✓ '${book.Titulo.substring(0, 20)}...' reubicado en ${matchedSpace.Modulo_Numero} - ${matchedSpace.Balda_Numero}`, "success");

  callGAS("updateBookLocation", {
    codigoInterno: book.Codigo_Interno,
    idEspacio: matchedSpace.ID_Espacio,
    fechaInventario: nowStr,
    profesor: AppState.currentUser ? AppState.currentUser.Nombre_Profesor : "Admin"
  }).catch(() => {});
}

// ==============================================================================
// 11. MÓDULO 2: MODO INVENTARIO MASIVO CON PROGRESO Y CELEBRACIÓN
// ==============================================================================
function selectActiveShelfByCode(barcode) {
  const cleanCode = barcode.trim().toUpperCase();
  const space = AppState.spaces.find(
    s => s.Codigo_Barras_Balda.toUpperCase() === cleanCode || s.ID_Espacio.toUpperCase() === cleanCode
  );

  if (space) {
    AppState.activeShelf = space;
    feedback.beepShelfSelected();
    updateActiveShelfUI();
    showToast(`Balda activa: ${space.Modulo_Numero} - ${space.Balda_Numero}`, "success");
  } else {
    feedback.beepError();
    showToast(`No existe ninguna balda con código '${barcode}'`, "error");
  }
}

function updateActiveShelfUI() {
  const unselectedBox = document.getElementById("shelf-unselected-box");
  const selectedBox = document.getElementById("shelf-selected-box");
  const scanSection = document.getElementById("inventory-scan-section");
  const statusPill = document.getElementById("inventory-shelf-status-pill");

  if (!AppState.activeShelf) {
    if (unselectedBox) unselectedBox.classList.remove("hidden");
    if (selectedBox) selectedBox.classList.add("hidden");
    if (scanSection) scanSection.classList.add("opacity-60", "pointer-events-none");
    if (statusPill) {
      statusPill.className = "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200";
      statusPill.textContent = "Sin balda fijada";
    }
    return;
  }

  if (unselectedBox) unselectedBox.classList.add("hidden");
  if (selectedBox) selectedBox.classList.remove("hidden");
  if (scanSection) scanSection.classList.remove("opacity-60", "pointer-events-none");
  if (statusPill) {
    statusPill.className = "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200";
    statusPill.textContent = "Balda Fijada";
  }

  const titleEl = document.getElementById("active-shelf-title");
  const codeEl = document.getElementById("active-shelf-code");
  const zoneEl = document.getElementById("active-shelf-zone");

  if (titleEl) titleEl.textContent = `${AppState.activeShelf.Modulo_Numero} - ${AppState.activeShelf.Balda_Numero}`;
  if (codeEl) codeEl.textContent = AppState.activeShelf.Codigo_Barras_Balda;
  if (zoneEl) zoneEl.textContent = `Zona: ${AppState.activeShelf.Zona_CDU}`;

  updateShelfProgressBar();
  if (window.lucide) lucide.createIcons();
}

function updateShelfProgressBar() {
  if (!AppState.activeShelf) return;

  const totalRegistered = AppState.books.filter(b => b.ID_Espacio_Actual === AppState.activeShelf.ID_Espacio).length;
  const auditedInSession = AppState.sessionScannedBooks.filter(item => item.book && item.book.ID_Espacio_Actual === AppState.activeShelf.ID_Espacio).length;

  const targetCount = Math.max(totalRegistered, auditedInSession, 1);
  const percentage = Math.min(Math.round((auditedInSession / targetCount) * 100), 100);

  const textEl = document.getElementById("shelf-progress-text");
  const barEl = document.getElementById("shelf-progress-bar");

  if (textEl) {
    textEl.textContent = `${auditedInSession} / ${totalRegistered} verificados (${percentage}%)`;
  }
  if (barEl) {
    barEl.style.width = `${percentage}%`;
    if (percentage >= 100 && totalRegistered > 0) {
      barEl.className = "progress-bar-fill h-full bg-emerald-500 rounded-full animate-pulse";
    }
  }

  if (percentage === 100 && totalRegistered > 0 && auditedInSession === totalRegistered) {
    feedback.celebrateFanfare();
  }
}

function resetActiveShelf() {
  AppState.activeShelf = null;
  updateActiveShelfUI();
  showToast("Balda liberada. Escanea otra balda.", "info");
}

function openSelectShelfModal() {
  const modal = document.getElementById("modal-select-shelf");
  const container = document.getElementById("modal-shelves-list");
  if (!modal || !container) return;

  container.innerHTML = "";
  AppState.spaces.forEach(s => {
    const item = document.createElement("button");
    item.className = "w-full p-3.5 bg-slate-50/80 hover:bg-brand-50/80 border border-slate-200 hover:border-brand-300 rounded-xl flex items-center justify-between text-left transition active:scale-98 shadow-2xs";
    item.innerHTML = `
      <div>
        <p class="font-black text-xs text-slate-800">${escapeHtml(s.Modulo_Numero)} — ${escapeHtml(s.Balda_Numero)}</p>
        <p class="text-[11px] text-slate-500 font-medium">${escapeHtml(s.Zona_CDU)}</p>
      </div>
      <code class="text-xs font-mono font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-brand-700 shadow-xs">
        ${escapeHtml(s.Codigo_Barras_Balda)}
      </code>
    `;
    item.onclick = () => {
      AppState.activeShelf = s;
      updateActiveShelfUI();
      modal.classList.add("hidden");
      feedback.beepShelfSelected();
      showToast(`Balda activa: ${s.Modulo_Numero} - ${s.Balda_Numero}`, "success");
    };
    container.appendChild(item);
  });

  modal.classList.remove("hidden");
}

function closeSelectShelfModal() {
  const modal = document.getElementById("modal-select-shelf");
  if (modal) modal.classList.add("hidden");
}

function startContinuousScanner() {
  if (!AppState.activeShelf) {
    showToast("Fija primero una balda activa (Paso 1)", "warning");
    feedback.beepError();
    return;
  }
  startScanner("inventory-continuous");
}

function handleInventoryBookScan() {
  const input = document.getElementById("inventory-book-input");
  const code = (input ? input.value : "").trim();
  if (!code) {
    showToast("Introduce el código del libro", "warning");
    return;
  }
  processBookInventoryScan(code);
  if (input) input.value = "";
}

async function processBookInventoryScan(barcode) {
  if (!AppState.activeShelf) {
    showToast("Debes fijar una balda activa primero", "warning");
    feedback.beepError();
    return;
  }

  const cleanCode = barcode.trim().toLowerCase().replace(/[-\s]/g, "");
  let book = AppState.books.find(b => {
    const bCode = String(b.Codigo_Interno || "").toLowerCase().replace(/[-\s]/g, "");
    const bIsbn = String(b.ISBN || "").toLowerCase().replace(/[-\s]/g, "");
    return bCode === cleanCode || bIsbn === cleanCode;
  });

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

  if (book) {
    book.ID_Espacio_Actual = AppState.activeShelf.ID_Espacio;
    book.Fecha_Ultimo_Inventario = nowStr;
    saveLocalState();
    feedback.beepSuccess();

    AppState.sessionScannedBooks.unshift({
      book,
      timestamp: nowStr,
      status: "synced"
    });

    showToast(`✓ ${book.Titulo.substring(0, 22)}... reubicado`, "success");

    callGAS("updateBookLocation", {
      codigoInterno: book.Codigo_Interno,
      idEspacio: AppState.activeShelf.ID_Espacio,
      fechaInventario: nowStr,
      profesor: AppState.currentUser ? AppState.currentUser.Nombre_Profesor : "Admin"
    }).catch(() => {});
  } else {
    feedback.beepError();
    showToast(`Código '${barcode}' no registrado en la biblioteca`, "warning");
    AppState.sessionScannedBooks.unshift({
      unregisteredCode: barcode,
      timestamp: nowStr,
      status: "unregistered"
    });
  }

  renderSessionAuditList();
  updateShelfProgressBar();
  renderStats();
}

function renderSessionAuditList() {
  const container = document.getElementById("session-audit-list");
  const counter = document.getElementById("session-scan-counter");
  if (!container) return;

  if (counter) {
    const validCount = AppState.sessionScannedBooks.filter(item => item.book).length;
    counter.textContent = `${validCount} escaneados`;
  }

  if (AppState.sessionScannedBooks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-xs">
        Aún no has escaneado libros en esta sesión de auditoría.
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  AppState.sessionScannedBooks.forEach(item => {
    const card = document.createElement("div");
    card.className = "p-3 rounded-xl border flex items-center justify-between text-xs transition shadow-2xs " +
      (item.status === "synced" ? "bg-white/95 border-slate-200" : "bg-rose-50/90 border-rose-200");

    if (item.book) {
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
            <i data-lucide="check" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <p class="font-bold text-slate-900 truncate">${escapeHtml(item.book.Titulo)}</p>
            <p class="text-[11px] text-slate-500 font-mono">${escapeHtml(item.book.Codigo_Interno)} • ${escapeHtml(item.book.Autor)}</p>
          </div>
        </div>
        <span class="text-[10px] text-slate-400 font-mono font-bold flex-shrink-0">${escapeHtml(item.timestamp.substring(11, 19))}</span>
      `;
    } else {
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0">
            <p class="font-bold text-rose-900 truncate">No registrado: ${escapeHtml(item.unregisteredCode)}</p>
            <p class="text-[10px] text-rose-600">Requiere alta previa por Administrador</p>
          </div>
        </div>
        <span class="text-[10px] text-rose-400 font-mono font-bold flex-shrink-0">${escapeHtml(item.timestamp.substring(11, 19))}</span>
      `;
    }

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function clearSessionAuditHistory() {
  AppState.sessionScannedBooks = [];
  renderSessionAuditList();
  updateShelfProgressBar();
  showToast("Historial de auditoría en vivo limpiado", "info");
}

// ==============================================================================
// 12. MÓDULO 3: ALTA RÁPIDA Y MOTOR ESTRICTO DE CARÁTULAS
// ==============================================================================
async function fetchMetadataByISBN(isbnQuery = null) {
  const isbnInput = document.getElementById("add-book-isbn");
  const statusEl = document.getElementById("isbn-enrich-status");
  const isbn = (isbnQuery !== null ? isbnQuery : (isbnInput ? isbnInput.value : "")).trim().replace(/[-\s]/g, "");

  if (!isbn) {
    showToast("Introduce el ISBN a consultar", "warning");
    return;
  }

  if (statusEl) {
    statusEl.innerHTML = '<span class="text-brand-600 font-semibold flex items-center gap-1.5"><i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Consultando OpenLibrary y Google Books...</span>';
    if (window.lucide) lucide.createIcons();
  }

  let finalCoverUrl = "";
  let finalTitle = "";
  let finalAuthors = "";
  let finalPublisher = "";
  let finalYear = "";
  let source = "";

  const olCoverCandidate = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
  const olCoverValid = await testImageUrl(olCoverCandidate);
  if (olCoverValid) {
    finalCoverUrl = olCoverCandidate;
  }

  try {
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const googleData = await googleRes.json();

    if (googleData.totalItems > 0 && googleData.items && googleData.items.length > 0) {
      const info = googleData.items[0].volumeInfo;
      finalTitle = info.title || "";
      finalAuthors = (info.authors || []).join(", ");
      finalPublisher = info.publisher || "";
      finalYear = (info.publishedDate || "").substring(0, 4);

      if (!finalCoverUrl && info.imageLinks) {
        let gCover = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || "";
        gCover = gCover.replace("http://", "https://");
        if (!gCover.includes("zoom=")) gCover += "&zoom=1";
        finalCoverUrl = gCover;
      }
      source = "Google Books";
    }
  } catch (e) {
    console.warn("Google Books lookup error:", e);
  }

  if (!finalTitle) {
    try {
      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const olData = await olRes.json();
      const olKey = `ISBN:${isbn}`;

      if (olData[olKey]) {
        const bData = olData[olKey];
        finalTitle = bData.title || "";
        finalAuthors = (bData.authors || []).map(a => a.name).join(", ");
        finalPublisher = (bData.publishers || []).map(p => p.name).join(", ");
        finalYear = (bData.publish_date || "").substring(0, 4);
        if (!finalCoverUrl && bData.cover) {
          finalCoverUrl = bData.cover.large || bData.cover.medium || "";
        }
        source = "OpenLibrary";
      }
    } catch (e) {
      console.warn("OpenLibrary data error:", e);
    }
  }

  if (finalTitle) {
    populateAddBookForm({
      title: finalTitle,
      authors: finalAuthors,
      publisher: finalPublisher,
      year: finalYear,
      coverUrl: finalCoverUrl,
      source: source || "Bases de datos abiertas"
    });
    feedback.doubleChime();
  } else {
    if (statusEl) {
      statusEl.innerHTML = '<span class="text-amber-600 font-semibold">No se encontraron metadatos en línea. Rellena los datos manualmente o sube una foto.</span>';
    }
    showToast("ISBN no encontrado. Introduce los datos manualmente.", "info");
  }
}

function testImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 1 && img.naturalHeight > 1) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function populateAddBookForm(data) {
  const titleInput = document.getElementById("add-book-title");
  const authorInput = document.getElementById("add-book-author");
  const publisherInput = document.getElementById("add-book-publisher");
  const yearInput = document.getElementById("add-book-year");
  const coverPreview = document.getElementById("add-book-cover-preview");
  const coverUrlInput = document.getElementById("add-book-cover-url");
  const statusEl = document.getElementById("isbn-enrich-status");

  if (titleInput) titleInput.value = data.title;
  if (authorInput) authorInput.value = data.authors;
  if (publisherInput) publisherInput.value = data.publisher;
  if (yearInput) yearInput.value = data.year;
  if (coverUrlInput) coverUrlInput.value = data.coverUrl;

  if (coverPreview) {
    coverPreview.innerHTML = renderBookCoverMarkup(data.coverUrl, data.title, data.authors);
  }

  if (statusEl) {
    statusEl.innerHTML = `<span class="text-emerald-600 font-black flex items-center gap-1.5">✓ Metadatos recuperados de ${escapeHtml(data.source)}</span>`;
  }

  const internalInput = document.getElementById("add-book-internal-code");
  if (internalInput && !internalInput.value) {
    const nextNum = AppState.books.length + 101;
    internalInput.value = `SEN-00${nextNum}`;
  }

  if (window.lucide) lucide.createIcons();
}

function handleCustomCoverUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Url = e.target.result;
    document.getElementById("add-book-cover-url").value = base64Url;
    const coverPreview = document.getElementById("add-book-cover-preview");
    if (coverPreview) {
      coverPreview.innerHTML = `<img src="${base64Url}" alt="Portada" class="w-full h-full object-cover" />`;
    }
    showToast("Foto de portada adjuntada", "success");
  };
  reader.readAsDataURL(file);
}

function promptCustomCover() {
  const current = document.getElementById("add-book-cover-url").value;
  const url = prompt("Introduce la URL directa de la imagen de portada:", current.startsWith("data:") ? "" : current);
  if (url !== null) {
    document.getElementById("add-book-cover-url").value = url;
    const coverPreview = document.getElementById("add-book-cover-preview");
    if (coverPreview) {
      coverPreview.innerHTML = renderBookCoverMarkup(url, document.getElementById("add-book-title").value, document.getElementById("add-book-author").value);
    }
  }
}

async function handleCreateBook(event) {
  event.preventDefault();

  if (!AppState.currentUser || AppState.currentUser.Rol !== "Admin") {
    showToast("Solo el profesorado Administrador puede dar de alta libros", "error");
    return;
  }

  const isbn = document.getElementById("add-book-isbn").value.trim();
  const title = document.getElementById("add-book-title").value.trim();
  const author = document.getElementById("add-book-author").value.trim();
  const publisher = document.getElementById("add-book-publisher").value.trim();
  const year = document.getElementById("add-book-year").value.trim();
  const state = document.getElementById("add-book-state").value;
  const internalCode = document.getElementById("add-book-internal-code").value.trim();
  const spaceId = document.getElementById("add-book-space-id").value;
  const coverUrl = document.getElementById("add-book-cover-url").value.trim();

  if (!internalCode || !spaceId || !title || !author) {
    showToast("Por favor, completa los campos obligatorios (*)", "warning");
    return;
  }

  if (AppState.books.some(b => b.Codigo_Interno.toUpperCase() === internalCode.toUpperCase())) {
    showToast(`El código interno '${internalCode}' ya existe`, "error");
    feedback.beepError();
    return;
  }

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);

  const newBook = {
    Codigo_Interno: internalCode,
    ISBN: isbn,
    Titulo: title,
    Autor: author,
    Editorial: publisher,
    Ano: year,
    URL_Portada: coverUrl,
    ID_Espacio_Actual: spaceId,
    Fecha_Ultimo_Inventario: nowStr,
    Estado: state,
    Registrado_Por: AppState.currentUser.Nombre_Profesor
  };

  AppState.books.push(newBook);
  saveLocalState();
  feedback.celebrateFanfare();
  showToast(`¡Ejemplar '${title}' guardado con éxito!`, "success");

  callGAS("createBook", { book: newBook }).catch(() => {});

  document.getElementById("form-add-book").reset();
  const coverPreview = document.getElementById("add-book-cover-preview");
  if (coverPreview) {
    coverPreview.innerHTML = `
      <i data-lucide="image" class="w-10 h-10"></i>
      <span class="text-xs mt-1.5 font-semibold">Sin portada</span>
    `;
  }
  const statusEl = document.getElementById("isbn-enrich-status");
  if (statusEl) statusEl.innerHTML = "";

  renderStats();
  if (window.lucide) lucide.createIcons();
}

// ==============================================================================
// 13. MÓDULO 4: TOPOGRAFÍA REAL Y GENERADOR DE ETIQUETAS PDF
// ==============================================================================
function populateZoneSelectors() {
  const filterSelect = document.getElementById("spaces-filter-cdu");
  const newSpaceSelect = document.getElementById("new-space-cdu");

  if (filterSelect) {
    filterSelect.innerHTML = '<option value="ALL">Todas las zonas del centro</option>';
    AppState.zones.forEach(z => {
      const opt = document.createElement("option");
      opt.value = z.Codigo_Zona;
      opt.textContent = z.Nombre_Zona;
      filterSelect.appendChild(opt);
    });
  }

  if (newSpaceSelect) {
    newSpaceSelect.innerHTML = "";
    AppState.zones.forEach(z => {
      const opt = document.createElement("option");
      opt.value = z.Nombre_Zona;
      opt.textContent = z.Nombre_Zona;
      newSpaceSelect.appendChild(opt);
    });
  }
}

function renderSpacesList() {
  const container = document.getElementById("spaces-container");
  const filterSelect = document.getElementById("spaces-filter-cdu");
  const filterVal = filterSelect ? filterSelect.value : "ALL";
  const countBadge = document.getElementById("selected-shelves-count");

  if (!container) return;

  if (countBadge) {
    countBadge.textContent = AppState.selectedSpacesForPdf.size;
  }

  const filtered = AppState.spaces.filter(s => {
    if (filterVal === "ALL") return true;
    return s.Zona_CDU.startsWith(filterVal) || s.Zona_CDU.includes(filterVal);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-slate-400 text-xs border border-dashed rounded-2xl bg-white/60">
        No hay baldas en esta zona. Pulsa "+ Balda" arriba para registrar una.
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(space => {
    const isSelected = AppState.selectedSpacesForPdf.has(space.ID_Espacio);
    const booksInSpace = AppState.books.filter(b => b.ID_Espacio_Actual === space.ID_Espacio).length;
    const zoneCode = space.Zona_CDU.split("—")[0].trim().split(" ")[0].trim();
    const zoneClass = `zone-badge-${zoneCode}`;

    const card = document.createElement("div");
    card.className = `p-4 bg-white hover:bg-slate-50/80 rounded-2xl border ${isSelected ? 'border-brand-500 ring-2 ring-brand-200/70 shadow-xs' : 'border-slate-200'} flex items-center justify-between transition gap-3 shadow-2xs`;

    card.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          ${isSelected ? "checked" : ""}
          onchange="toggleSpaceSelection('${escapeHtml(space.ID_Espacio)}', this.checked)"
          class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
        />
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h4 class="font-black text-sm text-slate-900">${escapeHtml(space.Modulo_Numero)} — ${escapeHtml(space.Balda_Numero)}</h4>
            <span class="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-bold">${escapeHtml(space.ID_Espacio)}</span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] px-2 py-0.5 rounded ${zoneClass} font-bold shadow-2xs">${escapeHtml(space.Zona_CDU)}</span>
            <span class="text-[11px] text-slate-500 font-bold">${booksInSpace} libros</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <code class="text-xs font-mono font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200 shadow-2xs">
          ${escapeHtml(space.Codigo_Barras_Balda)}
        </code>
        <button
          onclick="deleteSpace('${escapeHtml(space.ID_Espacio)}')"
          class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
          title="Eliminar balda"
        >
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function toggleSpaceSelection(spaceId, isChecked) {
  if (isChecked) {
    AppState.selectedSpacesForPdf.add(spaceId);
  } else {
    AppState.selectedSpacesForPdf.delete(spaceId);
  }
  const countBadge = document.getElementById("selected-shelves-count");
  if (countBadge) countBadge.textContent = AppState.selectedSpacesForPdf.size;
  renderSpacesList();
}

function toggleSelectAllShelves(selectAll) {
  if (selectAll) {
    AppState.spaces.forEach(s => AppState.selectedSpacesForPdf.add(s.ID_Espacio));
  } else {
    AppState.selectedSpacesForPdf.clear();
  }
  renderSpacesList();
}

function openCreateSpaceModal() {
  const modal = document.getElementById("modal-create-space");
  if (modal) {
    populateZoneSelectors();
    modal.classList.remove("hidden");
    autoGenerateSpaceCodes();
  }
}

function closeCreateSpaceModal() {
  const modal = document.getElementById("modal-create-space");
  if (modal) modal.classList.add("hidden");
}

function autoGenerateSpaceCodes() {
  const cduVal = document.getElementById("new-space-cdu").value;
  const moduleVal = document.getElementById("new-space-module").value.trim() || "Módulo 1";
  const shelfVal = document.getElementById("new-space-shelf").value.trim() || "Balda 1";

  const zoneCode = cduVal.split("—")[0].trim().split(" ")[0].trim();
  const modNumMatch = moduleVal.match(/\d+/);
  const modCode = modNumMatch ? modNumMatch[0].padStart(2, "0") : zoneCode;

  const shelfNumMatch = shelfVal.match(/\d+/);
  const shelfNum = shelfNumMatch ? shelfNumMatch[0] : "1";
  const shelfNumPadded = shelfNumMatch ? shelfNumMatch[0].padStart(2, "0") : "01";

  document.getElementById("new-space-id").value = `ESP-${modCode}-B${shelfNum}`;
  document.getElementById("new-space-barcode").value = `LOC-${modCode}-${shelfNumPadded}`;
}

function handleCreateSpace(e) {
  e.preventDefault();
  const cdu = document.getElementById("new-space-cdu").value;
  const moduleVal = document.getElementById("new-space-module").value.trim();
  const shelfVal = document.getElementById("new-space-shelf").value.trim();
  const idSpace = document.getElementById("new-space-id").value.trim();
  const barcode = document.getElementById("new-space-barcode").value.trim();

  if (AppState.spaces.some(s => s.ID_Espacio === idSpace)) {
    showToast(`El ID '${idSpace}' ya existe`, "error");
    feedback.beepError();
    return;
  }

  const newSpace = {
    ID_Espacio: idSpace,
    Zona_CDU: cdu,
    Modulo_Numero: moduleVal,
    Balda_Numero: shelfVal,
    Codigo_Barras_Balda: barcode
  };

  AppState.spaces.push(newSpace);
  AppState.selectedSpacesForPdf.add(idSpace);
  saveLocalState();
  feedback.doubleChime();
  showToast("Balda creada correctamente", "success");

  callGAS("createSpace", { space: newSpace }).catch(() => {});

  closeCreateSpaceModal();
  renderSpacesList();
  populateShelfDropdowns();
  renderStats();
}

function deleteSpace(spaceId) {
  const booksInSpace = AppState.books.filter(b => b.ID_Espacio_Actual === spaceId).length;
  if (booksInSpace > 0) {
    if (!confirm(`Esta balda tiene ${booksInSpace} libros asignados. ¿Eliminarla?`)) return;
  } else if (!confirm(`¿Eliminar la balda '${spaceId}'?`)) {
    return;
  }

  AppState.spaces = AppState.spaces.filter(s => s.ID_Espacio !== spaceId);
  AppState.selectedSpacesForPdf.delete(spaceId);
  saveLocalState();
  showToast("Balda eliminada", "info");

  callGAS("deleteSpace", { idEspacio: spaceId }).catch(() => {});

  renderSpacesList();
  populateShelfDropdowns();
  renderStats();
}

function openCreateZoneModal() {
  const modal = document.getElementById("modal-create-zone");
  if (modal) modal.classList.remove("hidden");
}

function closeCreateZoneModal() {
  const modal = document.getElementById("modal-create-zone");
  if (modal) modal.classList.add("hidden");
}

function handleCreateZone(e) {
  e.preventDefault();
  const code = document.getElementById("new-zone-code").value.trim().toUpperCase();
  const name = document.getElementById("new-zone-name").value.trim();
  const color = document.getElementById("new-zone-color").value.trim();
  const desc = document.getElementById("new-zone-desc").value.trim();

  if (AppState.zones.some(z => z.Codigo_Zona === code)) {
    showToast(`La zona con código '${code}' ya existe`, "error");
    feedback.beepError();
    return;
  }

  const fullName = `${code} — ${name}`;
  const newZone = {
    Codigo_Zona: code,
    Nombre_Zona: fullName,
    Color_Hex: color || "#3b82f6",
    Descripcion: desc
  };

  AppState.zones.push(newZone);
  saveLocalState();
  populateZoneSelectors();
  feedback.doubleChime();
  showToast(`Zona '${fullName}' añadida`, "success");

  callGAS("createZone", { zone: newZone }).catch(() => {});
  closeCreateZoneModal();
}

function populateShelfDropdowns() {
  const select = document.getElementById("add-book-space-id");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Selecciona una balda --</option>';

  const grouped = {};
  AppState.spaces.forEach(s => {
    if (!grouped[s.Zona_CDU]) grouped[s.Zona_CDU] = [];
    grouped[s.Zona_CDU].push(s);
  });

  Object.keys(grouped).forEach(cdu => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = cdu;
    grouped[cdu].forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.ID_Espacio;
      opt.textContent = `${s.Modulo_Numero} — ${s.Balda_Numero} (${s.Codigo_Barras_Balda})`;
      optGroup.appendChild(opt);
    });
    select.appendChild(optGroup);
  });

  if (currentVal) select.value = currentVal;
}

function generateSelectedShelvesPDF() {
  if (AppState.selectedSpacesForPdf.size === 0) {
    showToast("Selecciona al menos una balda para imprimir", "warning");
    feedback.beepError();
    return;
  }

  const selectedSpaces = AppState.spaces.filter(s => AppState.selectedSpacesForPdf.has(s.ID_Espacio));

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const stripWidth = pageWidth - (margin * 2);
    const stripHeight = 32;
    const gap = 3;

    let yOffset = margin;
    let pageCount = 1;

    const addPageHeader = (pageNumber) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`BIBLIOTRACKER IES — Etiquetas Topográficas para Filo de Estantería (Code 128)`, margin, margin - 3);
      doc.text(`Página ${pageNumber}`, pageWidth - margin - 15, margin - 3);
    };

    addPageHeader(pageCount);

    selectedSpaces.forEach((space) => {
      if (yOffset + stripHeight > pageHeight - margin) {
        doc.addPage();
        pageCount++;
        yOffset = margin;
        addPageHeader(pageCount);
      }

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect(margin, yOffset, stripWidth, stripHeight);
      doc.setLineDashPattern([], 0);

      doc.setFillColor(30, 58, 138);
      doc.rect(margin, yOffset, 6, stripHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`ZONA: ${space.Zona_CDU.toUpperCase()}`, margin + 10, yOffset + 7);

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(`${space.Modulo_Numero.toUpperCase()}  —  ${space.Balda_Numero.toUpperCase()}`, margin + 10, yOffset + 16);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`ID Espacio: ${space.ID_Espacio}`, margin + 10, yOffset + 24);

      const canvas = document.createElement("canvas");
      JsBarcode(canvas, space.Codigo_Barras_Balda, {
        format: "CODE128",
        width: 2,
        height: 48,
        displayValue: true,
        fontSize: 14,
        textMargin: 3,
        fontOptions: "bold",
        margin: 2
      });

      const barcodeImgData = canvas.toDataURL("image/png");
      const barcodeWidth = 65;
      const barcodeHeight = 26;
      doc.addImage(barcodeImgData, "PNG", pageWidth - margin - barcodeWidth - 4, yOffset + 3, barcodeWidth, barcodeHeight);

      yOffset += stripHeight + gap;
    });

    doc.save(`etiquetas_baldas_bibliotracker_${Date.now()}.pdf`);
    feedback.celebrateFanfare();
    showToast(`PDF con ${selectedSpaces.length} etiquetas generado`, "success");
  } catch (err) {
    console.error("Error generando PDF:", err);
    showToast("Error al generar PDF", "error");
  }
}

// ==============================================================================
// 14. AJUSTES, ESTADÍSTICAS Y UTILIDADES
// ==============================================================================
function renderStats() {
  const totalBooksEl = document.getElementById("stat-total-books");
  const totalShelvesEl = document.getElementById("stat-total-shelves");
  const auditedTodayEl = document.getElementById("stat-audited-today");

  if (totalBooksEl) totalBooksEl.textContent = AppState.books.length;
  if (totalShelvesEl) totalShelvesEl.textContent = AppState.spaces.length;

  const todayDatePrefix = new Date().toISOString().substring(0, 10);
  const auditedCount = AppState.books.filter(b => (b.Fecha_Ultimo_Inventario || "").startsWith(todayDatePrefix)).length;
  if (auditedTodayEl) auditedTodayEl.textContent = auditedCount;
}

function formatDate(dateStr) {
  if (!dateStr) return "Nunca";
  try {
    const d = new Date(dateStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return dateStr;
  }
}

function openSettingsModal() {
  const modal = document.getElementById("modal-settings");
  const input = document.getElementById("setting-gas-url");
  if (input) input.value = AppState.gasUrl || HARDCODED_GAS_URL;
  if (modal) modal.classList.remove("hidden");
}

function closeSettingsModal() {
  const modal = document.getElementById("modal-settings");
  if (modal) modal.classList.add("hidden");
}

function saveGasUrlOnly() {
  const input = document.getElementById("setting-gas-url");
  const url = (input ? input.value : "").trim() || HARDCODED_GAS_URL;
  AppState.gasUrl = url;
  localStorage.setItem("bibliotracker_gas_url", url);
  showToast("URL del servidor guardada", "success");
  updateConnectionStatusIndicator(url ? "connected" : "demo");
  closeSettingsModal();
}

async function testBackendConnection() {
  const input = document.getElementById("setting-gas-url");
  const resultDiv = document.getElementById("connection-test-result");
  const url = (input ? input.value : "").trim() || HARDCODED_GAS_URL;

  AppState.gasUrl = url;
  localStorage.setItem("bibliotracker_gas_url", url);

  if (resultDiv) {
    resultDiv.classList.remove("hidden", "bg-rose-50", "text-rose-800", "bg-emerald-50", "text-emerald-800");
    resultDiv.className = "text-[11px] p-2.5 rounded-xl bg-amber-50 text-amber-800 flex items-center gap-2";
    resultDiv.innerHTML = '<span class="animate-spin">⌛</span> Probando conexión con Google Apps Script...';
  }

  try {
    const res = await callGAS("getAllData");
    if (res && res.status === "success") {
      resultDiv.className = "text-[11px] p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold";
      resultDiv.innerHTML = `✓ Conexión exitosa. Base de datos con ${res.data.books.length} libros, ${res.data.spaces.length} baldas y ${res.data.users.length} profesores.`;
      feedback.celebrateFanfare();
      syncAllDataFromGAS();
    } else {
      throw new Error(res ? res.message : "Respuesta inesperada");
    }
  } catch (err) {
    if (resultDiv) {
      resultDiv.className = "text-[11px] p-2.5 rounded-xl bg-rose-50 text-rose-800";
      resultDiv.innerHTML = `✗ Error de conexión: ${err.message}. Asegúrate de haber desplegado la Web App con acceso para 'Cualquier usuario'.`;
    }
    feedback.beepError();
  }
}

function resetToDemoData() {
  if (confirm("¿Restablecer todos los datos a la demostración inicial del centro?")) {
    AppState.users = [...DEFAULT_DEMO_DATA.users];
    AppState.zones = [...DEFAULT_DEMO_DATA.zones];
    AppState.spaces = [...DEFAULT_DEMO_DATA.spaces];
    AppState.books = [...DEFAULT_DEMO_DATA.books];
    saveLocalState();
    renderStats();
    populateZoneSelectors();
    renderSpacesList();
    populateShelfDropdowns();
    populateLoginUserSelect();
    showToast("Datos demo restaurados", "info");
    closeSettingsModal();
  }
}

function exportBackupJSON() {
  const data = {
    users: AppState.users,
    zones: AppState.zones,
    spaces: AppState.spaces,
    books: AppState.books,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bibliotracker_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia de seguridad descargada", "success");
}

// ==============================================================================
// 15. NOTIFICACIONES TOAST
// ==============================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgStyles = {
    success: "bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-900/20",
    error: "bg-rose-950/95 text-white border-rose-500/50 shadow-rose-900/20",
    warning: "bg-amber-950/95 text-white border-amber-500/50 shadow-amber-900/20",
    info: "bg-slate-900/95 text-white border-slate-700 shadow-slate-900/20"
  };

  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ"
  };

  toast.className = `toast-animate px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 pointer-events-auto backdrop-blur-md ${bgStyles[type] || bgStyles.info}`;
  toast.innerHTML = `
    <span class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">${icons[type] || "•"}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==============================================================================
// 16. INICIALIZACIÓN
// ==============================================================================
window.addEventListener("DOMContentLoaded", () => {
  loadLocalState();
  initAuth();
  populateZoneSelectors();
  populateShelfDropdowns();
  renderStats();
  renderSpacesList();

  if (AppState.gasUrl) {
    syncAllDataFromGAS();
  } else {
    updateConnectionStatusIndicator("demo");
  }

  document.body.addEventListener("touchmove", (e) => {
    if (e.target.closest(".overflow-y-auto")) return;
  }, { passive: false });
});
