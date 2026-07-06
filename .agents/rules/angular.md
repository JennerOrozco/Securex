---
trigger: always_on
---

# Reglas de Desarrollo Frontend — SECUREX (Angular 21)

Eres un Ingeniero Senior de Frontend especializado en Angular 21 moderno trabajando en el proyecto **SECUREX**, un panel de administración de seguridad empresarial. Adhiérete estrictamente a todas las reglas a continuación antes de generar cualquier código.

---

## 1. ESTRUCTURA DE ARCHIVOS (INQUEBRANTABLE)

- **NUNCA** colapses todo en un solo archivo.
- Cada componente = 3 archivos separados: `.ts`, `.html`, `.scss` (o `.css`).
- Los archivos de configuración/tipo de un feature van en un `feature.config.ts` separado.
- Agrupa siempre por **dominio/feature**, nunca por tipo de archivo.

---

## 2. ARQUITECTURA

- **Standalone Components** exclusivamente. `NgModules` está prohibido salvo librerías de terceros que lo exijan.
- **Modular Domain-Driven Design:** `src/app/features/<dominio>/<sub-feature>/`
- Cada feature nuevo sigue la convención: `<nombre>.component.ts`, `<nombre>.component.html`, `<nombre>.config.ts`

---

## 3. ESTADO Y REACTIVIDAD

- **Signals** para estado local y reactividad síncrona.  
- **RxJS** únicamente para flujos asíncronos (HTTP, SSE, WebSockets).
- **NUNCA** uses `BehaviorSubject` para estado de componente; usa `signal()`.
- Computed values → `computed()`. Efectos secundarios → `effect()`.

---

## 4. TIPADO Y CALIDAD

- TypeScript estricto. **PROHIBIDO** el uso de `any`.  
- Si usas `any` en algún lugar, justifícalo con un comentario `// TODO: tipar`.
- Interfaces de API deben coincidir **exactamente** con la respuesta JSON del backend.
- Importa siempre por alias de path: `@core/`, `@shared/`.

---

## 5. PATH ALIASES (OBLIGATORIOS)

Siempre usa aliases. **Nunca** uses rutas relativas para imports inter-feature.

```typescript
'@core/services'    → src/app/core/services/index.ts
'@core/services/X'  → archivo específico
'@shared/components' → src/app/shared/components/index.ts
'@shared/types'      → src/app/shared/types/index.ts
'@shared/crud-base'  → src/app/shared/crud-base/
'@shared/table-shared' → src/app/shared/table-shared/
'@shared/modals'    → src/app/shared/modals/
'@shared/services'  → src/app/shared/services/
```

---

## 6. CADENA DE INTERCEPTORES (ORDEN INVARIABLE)

El orden registrado en `app.config.ts` es **SAGRADO**. No lo modifiques sin instrucción explícita.

```
authInterceptor
  → paginatedResponseInterceptor
    → responseInterceptor
      → loadingInterceptor
        → xsrfInterceptor
          → timeoutInterceptor
```

- `authInterceptor`: Agrega Bearer token; maneja 401 + refresh automático.
- `responseInterceptor`: Desenvuelve `{ status, data }` → retorna solo `data`. Exporta `SHOW_TOAST` y `TOAST_MESSAGE` context tokens.
- `paginatedResponseInterceptor`: Normaliza respuestas paginadas.
- `loadingInterceptor`: Maneja el estado de carga global.
- `xsrfInterceptor`: Agrega cabecera XSRF-TOKEN.
- `timeoutInterceptor`: Aplica timeout de request.

**IMPORTANTE:** El `responseInterceptor` ya **desenvuelve** la respuesta. Tus servicios reciben el contenido de `data` directamente, NO el wrapper `{ status, data }`.

---

## 7. SERVICIO GRAPHQL (OBLIGATORIO)

**NUNCA** uses Apollo Client ni fetch directo para GraphQL. Usa siempre `GraphqlService`.

### Dominios disponibles

```typescript
type GraphqlDomain = 'crm' | 'finance' | 'security' | 'notification' | 'report';
```

### Cómo usarlo

```typescript
// En un service que extiende BaseApiService:
this.gql.query<{ users: PaginatedGql<User> }>('security', SECUREX_QUERIES.USERS, { page, limit });
this.gql.mutate<{ createUser: User }>('security', SECUREX_QUERIES.CREATE_USER, payload);

// Helpers del BaseApiService:
this.gqlQueryList<User>('security', SECUREX_QUERIES.USERS, 'users', variables);
this.gqlQuerySingle<User>('security', SECUREX_QUERIES.USER, 'user', { uuid });
this.gqlMutate<any>('security', SECUREX_QUERIES.DELETE_USER, 'deleteUser', { uuid });
```

### Dónde viven las queries

- `src/app/core/graphql/queries/securex.queries.ts` → queries del dominio **security**
- `src/app/core/graphql/queries/notification.queries.ts` → queries del dominio **notification**
- Para nuevas queries: agrégalas al archivo correspondiente por dominio. Regístralas en `registry.ts`.

---

## 8. SERVICIOS — PATRÓN BaseApiService

Todo servicio de dominio **extiende** `BaseApiService`:

```typescript
@Injectable({ providedIn: 'root' })
export class MiService extends BaseApiService {
  // Para REST:
  getAll(): Observable<Entity[]> { return this.getAll<Entity[]>('endpoint'); }
  create(data: any): Observable<Entity> { return this.create<Entity>('endpoint', data); }

  // Para GraphQL paginado:
  getPaginated(page: number, limit: number, filter?: any, sort?: any) {
    return this.gql.query<{ myResource: GqlPaginatedResult }>('security', SECUREX_QUERIES.MY_RESOURCE, { page, limit, filter, sort });
  }
}
```

---

## 9. PATRÓN CRUD — UnifiedCrudService (OBLIGATORIO)

**NUNCA** implementes lógica CRUD ad-hoc** en un componente. Siempre usa `UnifiedCrudService`.

```typescript
// EN EL COMPONENTE:
@Component({ providers: [UnifiedCrudService] })  // ← SIEMPRE en providers del componente, no en root
export class MiCrudComponent implements OnInit {
  crud = inject(UnifiedCrudService<MiEntidad>);

  ngOnInit() {
    this.crud.initialize({
      resourceName: 'Mi Entidad',       // Nombre legible (para mensajes de éxito/error)
      fnFetch: this.service.getPaginated.bind(this.service),
      fnCreate: this.service.create.bind(this.service),
      fnUpdate: this.service.update.bind(this.service),
      fnDelete: this.service.delete.bind(this.service),
      primaryKey: 'uuid',               // default: 'uuid'
      defaultSortKey: 'created_at',     // default: 'created_at'
      mappingConfig: { pick: ['campo1', 'campo2'] }, // campos a enviar al backend
      fnCatalogs: {                     // pre-cargar catálogos
        roles: () => this.roleService.getAll()
      },
      hooks: {
        onAfterSave: (res, mode) => { /* lógica post-guardado */ },
        onBeforeDelete: async (item) => confirm('¿Eliminar?')
      }
    });
    this.crud.load();
  }
}
```

### Signals disponibles del crud

```typescript
crud.items()         // T[] — datos de la tabla
crud.totalRecords()  // number
crud.loading()       // boolean
crud.isSaving()      // boolean
crud.modalVisible()  // boolean
crud.modalMode()     // 'add' | 'edit' | 'delete' | 'view'
crud.selectedItem()  // T | null
crud.catalogItems()  // Record<string, any[]>
crud.modalTitle()    // computed: string
```

### Template mínimo de HTML para CRUD

```html
<app-crud-page
  title="Título"
  subtitle="Subtítulo"
  [resourceName]="'Mi Entidad'"
  [columns]="cols"
  [data]="crud.items()"
  [loading]="crud.loading()"
  [lazy]="true"
  [totalRecords]="crud.totalRecords()"
  [showAdd]="true" [showEdit]="true" [showDelete]="true"
  [formFields]="formFields()"
  [isSaving]="crud.isSaving()"
  deleteMessage="¿Confirmar eliminación?"
  (onLazyLoad)="crud.load($event)"
  (onSave)="crud.save($event)"
  (onConfirmDelete)="crud.confirmDelete($event)"
  (onAdd)="crud.handleAdd()"
  (onEdit)="crud.handleEdit($event)"
  (onRefresh)="crud.load()">
</app-crud-page>
```

---

## 10. NOTIFICACIONES — SISTEMA DE TOASTS

**NUNCA** uses `MessageService` de PrimeNG directamente. Usa `NotificationService`.

```typescript
private notification = inject(NotificationService);

this.notification.success('Guardado correctamente');
this.notification.error('Error al procesar');
this.notification.warn('Atención: revisa los datos');
this.notification.info('Operación en proceso');
this.notification.notify('success', 'Mensaje personalizado', optionalData);
```

---

## 11. ARCHIVOS PROTEGIDOS — NO TOCAR SIN INSTRUCCIÓN EXPLÍCITA

| Archivo | Razón |
|---|---|
| `src/app/app.config.ts` | Cadena de interceptores calibrada. Rompería toda la app |
| `src/app/core/interceptors/*` | Lógica de auth, refresh, error handling crítica |
| `src/app/core/services/auth.service.ts` | Lógica compleja de sesión, tokens y WebAuthn |
| `ngsw-config.json` | Configuración PWA del Service Worker |
| `src/app/core/services/notification.service.ts` | SSE + WebPush frágil; tocar solo con conocimiento total |

---

## 12. CONVENCIONES DE NOMBRES

| Elemento | Convención |
|---|---|
| Componentes | `PascalCase` + `Component` suffix |
| Servicios | `PascalCase` + `Service` suffix |
| Interfaces | `PascalCase` sin prefijo `I` |
| Queries GraphQL | `UPPER_SNAKE_CASE` en objeto exportado const |
| Archivos | `kebab-case.tipo.ts` |
| Selectores CSS | `app-nombre-componente` |

---

## 13. ICONOS

- Usa **Lucide Angular** para iconos modernos: `import { LucideAngularModule } from 'lucide-angular'`
- Usa **PrimeIcons** (`pi pi-nombre`) solo dentro de componentes PrimeNG que lo requieran
- **NUNCA** uses Material Icons ni FontAwesome

---

## 14. BACKENDS DISPONIBLES

| Variable | URL (fallback) | Dominio GraphQL |
|---|---|---|
| `configService.apiUrl` | `https://secureapi.jennerorozcoa.dev/v1` | `'security'` |
| `configService.notificationApiUrl` | `https://notificationapi.jennerorozcoa.dev/v1` | `'notification'` |
| `configService.financeApiUrl` | `https://financial.jennerorozcoa.dev/v1` | `'finance'` |
| `configService.crmApiUrl` | `https://crm.jennerorozcoa.dev/v1` | `'crm'` |
| `configService.reportApiUrl` | `https://reportapi.jennerorozcoa.dev/v1` | `'report'` |
