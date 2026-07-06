# AGENTS.md — Reglas Globales del Proyecto GGTS

Estas reglas aplican a **todos los agentes** que trabajen en cualquier proyecto dentro del workspace GGTS PROYECTO.

---

## 🌐 Idioma y Comunicación

- **Código:** siempre en inglés (`camelCase`, `kebab-case`, nombres de variables, comentarios técnicos de una línea)
- **Labels, mensajes de usuario, textos de UI:** siempre en **español** (es-MX / es-LA)
- **Respuestas del agente:** en español, conciso y directo
- **Comentarios JSDoc / docstrings:** en español para que el equipo los entienda
- **Logs y errores de consola:** en español para depuración, con el contexto del servicio entre corchetes: `[NombreServicio]`

---

## 🏗️ Contexto del Ecosistema GGTS

Este workspace contiene múltiples proyectos que comparten el mismo backend:

| Proyecto | Descripción | Stack |
|---|---|---|
| `SECUREX/` | Panel de administración de seguridad empresarial | Angular 21, Standalone, Signals |
| `GGTS-ADMIN/` | Panel administrativo principal | Angular (mismo stack) |
| `PADEL/` | App de gestión de canchas de pádel | Angular (mismo stack) |
| `MICROSERVICE-REPO/` | Microservicios del backend | PHP / Laravel |

### APIs compartidas entre proyectos

| Servicio | URL base |
|---|---|
| API principal (Security) | `https://secureapi.jennerorozcoa.dev/v1` |
| Notificaciones | `https://notificationapi.jennerorozcoa.dev/v1` |
| Finanzas | `https://financial.jennerorozcoa.dev/v1` |
| CRM | `https://crm.jennerorozcoa.dev/v1` |
| Reportes | `https://reportapi.jennerorozcoa.dev/v1` |

---

## 🚫 Prohibiciones Universales (todos los proyectos)

### TypeScript / Angular
- **PROHIBIDO** `any` sin comentario `// TODO: tipar correctamente`
- **PROHIBIDO** `NgModules` nuevos (usa Standalone Components)
- **PROHIBIDO** `BehaviorSubject` para estado local de componente (usa `signal()`)
- **PROHIBIDO** Apollo Client u otra librería GraphQL — usar `GraphqlService` propio
- **PROHIBIDO** acceder a `localStorage` / `sessionStorage` directamente — usar `StorageService`
- **PROHIBIDO** `MessageService` de PrimeNG directamente — usar `NotificationService`
- **PROHIBIDO** rutas relativas entre features — usar path aliases (`@core/`, `@shared/`)
- **PROHIBIDO** colapsar componente + template + estilos en un solo archivo

### Calidad
- **PROHIBIDO** comentar código muerto — elimínalo directamente
- **PROHIBIDO** dejar `console.log()` en producción sin usar `LoggerService`
- **PROHIBIDO** hacer merge a main con `debugger` statements

---

## ✅ Convenciones Universales

### Nombrado
| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes Angular | `PascalCase` + `Component` | `DashboardComponent` |
| Servicios Angular | `PascalCase` + `Service` | `UserService` |
| Interfaces TypeScript | `PascalCase` sin prefijo `I` | `User`, `Company` |
| Constantes exportadas | `UPPER_SNAKE_CASE` | `SECUREX_QUERIES` |
| Variables / funciones | `camelCase` | `currentUser`, `getUserById` |
| Archivos | `kebab-case.tipo.ts` | `user.service.ts`, `auth.guard.ts` |
| Selectores CSS | `app-nombre-componente` | `app-metric-card` |
| Rutas Angular | `kebab-case` | `/security/user-roles` |
| Queries GraphQL | Operación en `PascalCase` | `query Users(...)`, `mutation CreateUser(...)` |

### Estructura de archivos
- Agrupa **por dominio/feature**, nunca por tipo de archivo
- Cada feature = su propia carpeta con `routes.ts`, componentes y `*.config.ts`
- Servicios de dominio → `src/app/core/services/`
- Componentes reutilizables → `src/app/shared/components/`

### Control de cambios
- Commits en español e imperativo: `feat: agrega módulo de facturación`
- Un commit por feature o fix, no acumular cambios no relacionados
- Siempre actualizar el grafo `nodesify-graphify update src` después de modificar código

---

## 🔧 Herramientas y comandos

### Desarrollo
```bash
npm start          # ng serve con proxy configurado
npm run lint       # ESLint sobre src/
npm run build:prod # Build de producción
npm run analyze    # Bundle analyzer (webpack-bundle-analyzer)
```

### Graphify (knowledge graph — LEER PRIMERO)
```bash
nodesify-graphify status          # verificar frescura del grafo
nodesify-graphify query "<preg>"  # localizar archivos y relaciones
nodesify-graphify explain "<concepto>"
nodesify-graphify update src      # después de modificar código
nodesify-graphify export --format html --out graph-viz.html
```

**Regla**: Usa graphify **antes** de usar Grep o exploración de archivos. El grafo es más rápido y conoce las relaciones entre módulos.

---

## 📋 Checklist antes de entregar un cambio

- [ ] No hay `any` sin justificación
- [ ] No hay `console.log` sin usar `LoggerService`
- [ ] Se usó path alias (`@core/`, `@shared/`) en todos los imports
- [ ] El componente tiene `ChangeDetectionStrategy.OnPush` si usa solo Signals
- [ ] Se corrió `nodesify-graphify update src` si se modificaron archivos `.ts`
- [ ] El template HTML está en archivo `.html` separado (no inline en el decorador)
- [ ] Los mensajes de usuario están en español
- [ ] No se rompió la cadena de interceptores en `app.config.ts`

---

## 🎨 Principios de Diseño UI

- Diseño **oscuro / dark-first** (tema Aura de PrimeNG en modo dark)
- Componentes **shared primero**: revisa `src/app/shared/components/` antes de crear uno nuevo
- **Mobile-first** con Tailwind: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`
- Micro-animaciones sutiles: `transition-all duration-200 ease-out`
- Iconos: **Lucide Angular** para UI funcional, **PrimeIcons** solo dentro de PrimeNG components
- **NUNCA** hardcodees colores hex en CSS; usa tokens de PrimeNG (`var(--p-primary-color)`)

---

## 🔒 Seguridad

- **NUNCA** expongas tokens, API keys ni credenciales en el código fuente
- Usa `ConfigService` para leer URLs y configuración — nunca hardcodees URLs de producción
- El `xsrfInterceptor` ya maneja CSRF automáticamente — no implementes CSRF manual
- Para endpoints públicos (login, reset-password), están en `PUBLIC_ENDPOINT_PATTERNS` del `authInterceptor`

---

## 📖 Cómo aprender del proyecto

1. Lee el `CLAUDE.md` del proyecto activo
2. Lee `.agents/rules/*.md` del proyecto activo
3. Verifica skills relevantes en `.agents/skills/`
4. Usa `nodesify-graphify query` para navegar el código
5. Usa `/learn` cuando resuelvas algo complejo para persistirlo como Knowledge Item
