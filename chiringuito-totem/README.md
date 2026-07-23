# Totem Chiringuito Lounge

Reemplazo propio de lacarta-totem.vercel.app. Vos administrás todo desde `/dashboard`
(agregar/editar/eliminar productos, subir fotos sin límite) y la pantalla del local
muestra `/totem` (slideshow automático + botón para ver la carta completa).

## Qué incluye

- **`/dashboard`** — login con usuario/contraseña, alta/baja/edición de productos,
  subida de fotos, orden y visibilidad.
- **`/totem`** — pantalla fullscreen para el local: rota los productos marcados como
  visibles (foto + precio + nombre + descripción), con un banner fijo arriba que dice
  "Tocá aquí para ver el menú". Al tocarlo se abre embebida la carta completa
  (grupochiringuito.com.ar/carta/lounge/) y vuelve sola al slideshow a los 45 segundos.

## Paso a paso para publicarlo (una sola vez)

### 1. Subir el código a GitHub
1. Creá un repo nuevo en GitHub (puede ser privado), por ejemplo `chiringuito-totem`.
2. Subí esta carpeta completa (sin `node_modules` ni `.next`, ya están en `.gitignore`).

### 2. Crear el proyecto en Vercel
1. Entrá a vercel.com con tu cuenta (la misma que usás para MAESTRO APP / chiringuito-web).
2. **Add New → Project** → elegí el repo que acabás de subir → **Deploy**.
   (La primera vez va a fallar o va a levantar sin datos porque todavía no configuramos
   la base de datos ni las variables de entorno — es esperable, seguí con el paso 3.)

### 3. Crear la base de datos y el storage de fotos
1. Dentro del proyecto en Vercel, andá a la pestaña **Storage**.
2. **Create Database → Postgres** (podés dejar el nombre por default) → conectala al proyecto.
3. **Create Store → Blob** → conectala al proyecto también.
4. Esto agrega automáticamente las variables `POSTGRES_URL` y `BLOB_READ_WRITE_TOKEN` —
   no hace falta que las cargues a mano.

### 4. Variables de entorno
En **Settings → Environment Variables** agregá:

| Variable | Valor |
|---|---|
| `DASHBOARD_USER` | el usuario que quieras para entrar al dashboard |
| `DASHBOARD_PASSWORD` | la contraseña que quieras |
| `DASHBOARD_SESSION_SECRET` | cualquier texto largo random (ej. generá uno en https://1password.com/es/password-generator) |

### 5. Redeploy
En la pestaña **Deployments**, tres puntitos del último deploy → **Redeploy**. Ahora sí
debería levantar bien.

### 6. Cargar los productos iniciales
1. Entrá a `tu-proyecto.vercel.app/dashboard` con el usuario/contraseña que configuraste.
2. Vas a ver un botón **"Cargar los 12 productos iniciales"** — tocalo una vez. Carga los
   platos que ya tenía el totem viejo (nombre, descripción, precio). Las fotos no se
   pudieron migrar del sistema anterior, así que quedan sin foto: entrá a "Editar" en
   cada uno y subí la foto correspondiente.
3. De ahí en más, cargá/editá/borrá lo que quieras desde el mismo dashboard.

### 7. Poner la pantalla del totem en modo kiosco
En la compu/pantalla del local, abrí Chrome apuntando a `tu-proyecto.vercel.app/totem`
en modo kiosco (pantalla completa, sin barra de navegación). En Windows, por ejemplo:

```
chrome.exe --kiosk https://tu-proyecto.vercel.app/totem
```

En un Smart TV o Fire Stick con navegador, simplemente abrí esa URL y ponela en pantalla
completa.

## Notas técnicas

- El auto-retorno del menú completo (45 segundos) es un tiempo fijo, no detecta
  actividad real dentro de la carta embebida — es una limitación técnica de los iframes
  entre distintos dominios (el navegador no deja "ver" los toques que pasan adentro de un
  sitio de otro dominio). Si 45 segundos queda corto o largo, decime y lo ajustamos
  (está en `app/totem/page.tsx`, constante `MENU_AUTO_CLOSE_MS`).
- El tiempo por foto del slideshow es de 8 segundos (constante `SLIDE_SECONDS` en el
  mismo archivo).
- La pantalla `/totem` vuelve a pedir la lista de productos cada 5 minutos sola, así que
  si cargás algo nuevo desde el dashboard, no hace falta reiniciar la pantalla del local.
