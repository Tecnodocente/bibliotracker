# 📚 BiblioTracker IES — Manual de Instalación y Guía de Uso

Sistema PWA de coste **0 €** para auditorías de inventario, mapeo topográfico con las **17 zonas temáticas reales del centro escolar**, autenticación estricta por PIN individual y catalogación rápida mediante códigos de barras lineales.

---

## 🔐 1. Esquema de Datos en Google Sheets

La base de datos sincronizada en Google Sheets consta de 4 pestañas:

1. **`USUARIOS`**:
   - **Columna A:** `PIN_Acceso` *(Formato texto plano `@` para conservar ceros a la izquierda, ej. `'1234`, `'0000'`)*.
   - **Columna B:** `Nombre_Profesor` *(ej. `D. Manuel García (Coordinador)`)*.
   - **Columna C:** `Rol` *(Valores: `Admin` o `Ayudante`)*.
   - **Columna D:** `Email_Contacto` *(Opcional a título informativo)*.

2. **`ZONAS`**:
   - `Codigo_Zona`, `Nombre_Zona`, `Color_Hex`, `Descripcion` *(17 zonas reales predefinidas + zonas dinámicas)*.

3. **`ESPACIOS`**:
   - `ID_Espacio`, `Zona_CDU`, `Modulo_Numero`, `Balda_Numero`, `Codigo_Barras_Balda` *(ej. `LOC-08-01`)*.

4. **`EJEMPLARES`**:
   - `Codigo_Interno` (ID único de Séneca/pegatina), `ISBN`, `Titulo`, `Autor`, `Editorial`, `Ano`, `URL_Portada`, `ID_Espacio_Actual`, `Fecha_Ultimo_Inventario`, `Estado`, `Registrado_Por`.

---

## 🌐 2. Despliegue Frontend en GitHub Pages (Coste 0 €)

1. Crea un repositorio público o privado en tu cuenta de GitHub (ej. `bibliotracker-ies`).
2. Sube todos los archivos de este directorio (`index.html`, `app.js`, `styles.css`, `icon.svg`, `manifest.json`, `sw.js`).
   ```bash
   git init
   git add .
   git commit -m "BiblioTracker IES"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/bibliotracker-ies.git
   git push -u origin main
   ```
3. En GitHub, entra en tu repositorio y ve a **Settings** > **Pages** (menú izquierdo).
4. En **Build and deployment** > **Branch**, selecciona `main` y carpeta `/ (root)`. Pulsa **Save**.
5. En 1-2 minutos tu enlace público HTTPS estará activo:
   `https://TU_USUARIO.github.io/bibliotracker-ies/`

---

## 🗄️ 3. Despliegue Backend en Google Sheets

### A. Crear la Hoja y Pegar `Code.gs`
1. Abre [Google Sheets](https://sheets.new) con tu cuenta de Google del centro.
2. Nombra la hoja: `BIBLIOTECA_INVENTARIO_IES`.
3. Ve a **Extensiones** > **Apps Script**, borra el código existente y pega el contenido completo de [`Code.gs`](./Code.gs). Pulsa **Guardar** (`Ctrl + S`).

### B. Inicializar la Base de Datos
1. En el desplegable superior de Apps Script, selecciona la función `setupDatabase` y pulsa **Ejecutar**.
2. Acepta los permisos de Google.
3. Se generarán las 4 pestañas con formato y datos demo iniciales (incluyendo los usuarios con PIN y las 17 zonas temáticas del centro).

### C. Publicar la Web App
1. Pulsa en el botón azul superior **Implementar** > **Nueva implementación**.
2. Selecciona **Aplicación web** (icono de engranaje ⚙️).
3. Configura:
   - **Descripción:** `BiblioTracker API`
   - **Ejecutar como:** `Yo (tu correo)`
   - **Quién tiene acceso:** `Cualquier usuario` *(Necesario para conectar desde GitHub Pages o móvil).*
4. Pulsa **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).

---

## 🔗 4. Vincular la PWA con Google Sheets

1. Abre la aplicación en tu navegador (o en GitHub Pages).
2. Pulsa en el icono de **Ajustes** (⚙️) arriba a la derecha.
3. Pega la URL de Apps Script en *"URL de la Web App de Google Apps Script"*.
4. Pulsa **Probar y Sincronizar**. El indicador superior se pondrá en verde (*Google Sheets*).

---

## 🔑 5. Flujo de Acceso por PIN Individual

1. Al abrir la app, se mostrará el diálogo de **Identificación de Profesor**.
2. Selecciona tu nombre en el desplegable.
3. Introduce tu **PIN secreto personal** (campo oculto con icono de ojo para mostrar/ocultar).
4. Pulsa **Entrar**. Tu sesión quedará recordada de forma permanente en `localStorage` (sin tener que volver a identificarte al abrir la app desde el móvil, hasta que pulses "Cerrar sesión").

**Usuarios de prueba incluidos en la demostración:**
- **`D. Manuel García (Coordinador)`** — PIN: `1234` (**Admin**: Acceso completo).
- **`Dña. Carmen López (Dpto. Lengua)`** — PIN: `5678` (**Admin**: Acceso completo).
- **`Prof. Ayudante de Guardia`** — PIN: `0000` (**Ayudante**: Solo Localizador e Inventario).

---

## 📱 6. Instalación como PWA en Móvil / Tablet

- **Android (Chrome):** Menú ⋮ > *"Instalar aplicación"* o *"Añadir a la pantalla de inicio"*.
- **iOS (Safari):** Botón Compartir (icono cuadrado con flecha) > *"Añadir a la pantalla de inicio"*.

La aplicación funcionará a pantalla completa con su icono profesional (`icon.svg`), conservando la sesión corporativa y el soporte offline.
