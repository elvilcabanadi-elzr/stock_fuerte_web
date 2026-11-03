# StockFuerte · Ferretería Casa Fuerte
Sistema web de gestión y control de almacén (curso Ingeniería de Software, UCV).

## Publicar en GitHub Pages (gratis, sin dominio)
1. Crea un repositorio público y sube todo el contenido de esta carpeta a la raíz (`index.html`, `css/`, `js/`).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. En 1–2 minutos queda en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Usuarios de prueba (clave `1234`)
`propietario@casafuerte.pe` · `encargado@casafuerte.pe` · `vendedor@casafuerte.pe`

## Datos
Se guardan en el navegador (localStorage) de cada equipo. Aún no hay base de datos: cuando la tengan, solo hay que cambiar `load()` y `save()` en `js/app.js` por llamadas a la BD/API. Las contraseñas de esta versión son de demostración (sin cifrado).
