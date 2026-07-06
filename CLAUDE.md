
## SECUREX — Contexto del Proyecto

**SECUREX** es el frontend Angular 21 de la plataforma GGTS. Es un panel de administración de seguridad empresarial que gestiona usuarios, roles, permisos, notificaciones en tiempo real, configuración global del sistema y monitoreo de logs.

---

### Stack técnico

- Angular 21 (Standalone Components, Signals, RxJS)
- PrimeNG 21 con tema Aura + Tailwind CSS v3
- Lucide Angular (iconos)
- GraphQL custom (NO Apollo) vía `GraphqlService`
- PWA con Service Worker + Web Push (VAPID)
- SSE (Server-Sent Events) para notificaciones en tiempo real
- WebAuthn / Passkeys

---

### Dominios / Features

| Ruta | Feature |
|---|---|
| `/home` | Dashboard principal |
| `/security` | Usuarios, roles, permisos |
| `/config` | Configuración global, catálogos |
| `/system-logs` | Logs y monitoreo |
| `/notification` | Panel y config de notificaciones |

---

### Herramienta de grafo de conocimiento: Graphify

- Siempre corre `nodesify-graphify status` antes de explorar el código.
- Usa `nodesify-graphify query "<pregunta>"` para ubicar archivos y relaciones.
- Usa `nodesify-graphify path "<A>" "<B>"` para entender dependencias entre módulos.
- Usa `nodesify-graphify explain "<concepto>"` para entender patrones del proyecto.
- Lee `.graphify/graph_report.md` antes de cualquier exploración de archivos.
- TARGETS siempre en `src/` (nunca `.` ni `dist/`).
- Después de modificar código: `nodesify-graphify update src` → `nodesify-graphify export --format html --out graph-viz.html`.

---

### Archivos protegidos — NO modificar sin instrucción explícita

- `src/app/app.config.ts` — Cadena de interceptores calibrada
- `src/app/core/interceptors/*` — Lógica crítica de auth/error
- `src/app/core/services/auth.service.ts` — Sesión, tokens, WebAuthn
- `src/app/core/services/notification.service.ts` — SSE + WebPush frágil
- `ngsw-config.json` — Service Worker PWA

---

### Convenciones clave

- Path aliases obligatorios: `@core/`, `@shared/`, nunca rutas relativas entre features
- `UnifiedCrudService` en providers del componente (nunca `providedIn: 'root'`)
- `NotificationService` para todos los toasts (nunca `MessageService` directo)
- GraphQL siempre vía `GraphqlService.query()` / `.mutate()`
- Reglas completas en `.agents/rules/angular.md`
