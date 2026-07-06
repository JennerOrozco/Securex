---
name: securex-pwa-config
description: >
  Skill para trabajar con la configuración PWA de SECUREX: Service Worker,
  ngsw-config.json, cache de APIs, UpdatePromptComponent. Actívate cuando el
  usuario pida "PWA", "service worker", "cache", "offline", "ngsw", "actualización
  automática", "update prompt", "instalar app", "agregar ruta al cache",
  "configurar cache de API", "manifest", o cuando necesite entender cómo
  funciona la estrategia de cache de este proyecto.
---

# SECUREX — Configuración PWA y Service Worker

---

## ⚠️ Archivo protegido

```
ngsw-config.json   ← NO modificar sin leer este skill completo primero
```

Un error aquí puede hacer que los usuarios queden con versiones cacheadas viejas sin posibilidad de actualizar, o que la app deje de funcionar offline.

---

## Estructura actual de `ngsw-config.json`

```json
{
  "assetGroups": [...],   // Archivos estáticos (JS, CSS, HTML, imágenes)
  "dataGroups":  [...],   // APIs dinámicas (fetch con estrategia de cache)
  "navigationUrls": [...] // Qué URLs maneja el SW como SPA
}
```

---

## Sección `assetGroups` — Archivos estáticos

### Grupos actuales

| Grupo | `installMode` | `updateMode` | Contenido |
|---|---|---|---|
| `app-shell` | `prefetch` | *(default: prefetch)* | `/index.html`, `/*.css`, `/*.js`, `manifest.webmanifest` |
| `static-assets` | `lazy` | `prefetch` | Imágenes, fuentes (svg, png, jpg, webp, woff2, ttf...) |

### Cuándo usar `prefetch` vs `lazy`

| Modo | Significado | Usar para |
|---|---|---|
| `prefetch` | Se descarga **al instalar** el SW, antes de que se necesite | Archivos críticos para el primer render (shell, CSS, JS) |
| `lazy` | Se descarga la **primera vez que se necesita** | Assets de baja prioridad (imágenes, fuentes opcionales) |

### Cómo agregar nuevos archivos estáticos al cache

**Para un archivo específico** (ej: nuevo favicon o asset de branding):
```json
{
  "name": "app-shell",
  "installMode": "prefetch",
  "resources": {
    "files": [
      "/favicon.ico",
      "/index.html",
      "/manifest.webmanifest",
      "/icons/icon-192.png",    ← agregar aquí
      "/*.css",
      "/*.js"
    ]
  }
}
```

**Para nuevas extensiones de assets** (ej: archivos `.lottie`):
```json
{
  "name": "static-assets",
  "installMode": "lazy",
  "updateMode": "prefetch",
  "resources": {
    "files": [
      "/**/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2|lottie)",
      "!/screenshots/**"
    ]
  }
}
```

> [!WARNING]
> El grupo `app-shell` descarga **todos** los archivos que coincidan con el patrón `/*.js` en el directorio raíz del build (`dist/`). No listes manualmente los chunk hashes — el patrón glob los captura automáticamente.

---

## Sección `dataGroups` — APIs en cache

### Grupos actuales del proyecto

| Grupo | URL | Estrategia | maxSize | maxAge |
|---|---|---|---|---|
| `api-main` | `secureapi.jennerorozcoa.dev/v1/**` | `freshness` | 100 | 1h |
| `api-notifications` | `notificationapi.jennerorozcoa.dev/v1/**` | `freshness` | — | — |
| `api-finance` | `financial.jennerorozcoa.dev/v1/**` | `freshness` | 50 | 30min |
| `api-crm` | `crm.jennerorozcoa.dev/v1/**` | `freshness` | 50 | 30min |
| `api-reports` | `reportapi.jennerorozcoa.dev/v1/**` | `performance` | — | — |

### Estrategias de cache de API

| Estrategia | Comportamiento | Usar cuando |
|---|---|---|
| `freshness` | Intenta red primero; si falla (timeout/offline), devuelve cache | **Datos que cambian frecuentemente** (usuarios, configuraciones). Es la default aquí |
| `performance` | Sirve desde cache primero; actualiza en background | **Datos que cambian poco** (catálogos, reportes históricos) |

### Timeouts configurados (en `freshness`)

```json
"timeout": {
  "idle": 10000,    // ms sin actividad antes de caer a cache
  "network": 30000  // ms de espera de red antes de caer a cache
}
```

### Cómo agregar cache para un nuevo microservicio

```json
{
  "name": "api-nuevo-servicio",
  "urls": [
    "https://nuevo-servicio.jennerorozcoa.dev/v1/**"
  ],
  "cacheConfig": {
    "strategy": "freshness",
    "timeout": {
      "idle": 10000,
      "network": 30000
    },
    "maxSize": 50,       // número máximo de respuestas cacheadas
    "maxAge": 1800000    // tiempo máximo en cache en ms (1800000 = 30 min)
  }
}
```

> [!IMPORTANT]
> El Service Worker **NO cachea** el endpoint SSE (`/notifications/stream`). `EventSource` usa HTTP streaming, que el SW no puede interceptar de forma útil. El SSE siempre va a la red directamente.

> [!CAUTION]
> **Nunca** uses `strategy: "performance"` para endpoints de autenticación (`/auth/**`) o escritura (`POST`, `PUT`, `DELETE`). Solo aplica para lecturas de datos estables.

---

## Sección `navigationUrls` — Rutas SPA

La configuración actual:
```json
"navigationUrls": [
  "/**",         // ← captura todas las rutas SPA
  "!/**/*.*",    // ← excluye URLs con extensión (archivos estáticos)
  "!/**/*__*",   // ← excluye __webpack_hmr y similares
  "!/assets/**"  // ← excluye el directorio assets
]
```

**No necesitas tocar esto** a menos que:
- Agregues rutas del servidor (API) que colisionen con rutas SPA del mismo dominio
- Agregues un subpath diferente para la app (ej: `/app/**`)

---

## UpdatePromptComponent — Actualización de versión

Ubicación: `src/app/shared/components/update-prompt/update-prompt.component.ts`

### Cómo funciona

```
Build nuevo en producción
  → Angular genera nuevo hash en los JS chunks
  → Service Worker detecta diferencia al hacer background check
  → swUpdate.versionUpdates emite tipo 'VERSION_READY'
  → UpdatePromptComponent muestra el banner "Actualización disponible"
  → Usuario hace click en "Actualizar ahora"
  → swUpdate.activateUpdate() → window.location.reload()
```

### Cuándo aparece automáticamente

- Solo en producción (el SW está deshabilitado en `devMode`)
- Solo cuando se lanza un nuevo build al servidor
- El componente ya está incluido en `MainLayoutComponent`; no necesitas agregarlo manualmente

### Cómo usarlo en un componente si necesitas lógica personalizada

```typescript
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

const swUpdate = inject(SwUpdate);
const destroyRef = inject(DestroyRef);

// Escuchar actualizaciones:
swUpdate.versionUpdates.pipe(
  takeUntilDestroyed(destroyRef),
  filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
).subscribe(evt => {
  console.log('Versión actual:', evt.currentVersion);
  console.log('Nueva versión:', evt.latestVersion);
  // Tu lógica aquí
});

// Forzar activación:
await swUpdate.activateUpdate();
window.location.reload();
```

### Verificar si el SW está activo

```typescript
const swUpdate = inject(SwUpdate);
if (swUpdate.isEnabled) {
  // SW activo (producción)
} else {
  // Desarrollo o navegador sin soporte
}
```

---

## Flujo de deploy — para evitar que los usuarios queden con versión vieja

1. `ng build --configuration production` → genera nuevo hash en los chunks
2. Sube el build al servidor (reemplaza los archivos en `dist/`)
3. El SW detecta el cambio en el próximo `check` (o cuando el usuario abre la app)
4. `UpdatePromptComponent` muestra el banner
5. El usuario hace click → `window.location.reload()` → carga la nueva versión

> [!TIP]
> Si un usuario reporta que "la app no actualiza", probablemente tiene el SW con cache viejo. Solución: en DevTools → Application → Service Workers → Unregister, luego hard reload.

---

## Comandos útiles para PWA

```bash
# Generar íconos PWA (script ya configurado en package.json):
npm run pwa:icons

# Build de producción (activa el SW):
npm run build:prod

# Servir el build de producción localmente (para testear SW):
npx http-server dist/securex-app -p 8080 --proxy http://localhost:8080?
```

> [!NOTE]
> El Service Worker se registra con estrategia `registerWhenStable:30000` (en `app.config.ts`). Esto significa que espera 30 segundos de inactividad de la app antes de registrarse, para no competir con el first-paint.
