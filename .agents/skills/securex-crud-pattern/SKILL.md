---
name: securex-crud-pattern
description: >
  Skill para crear pantallas CRUD en el proyecto SECUREX usando el patrón
  UnifiedCrudService + CrudPageComponent. Actívate cuando el usuario pida
  "nueva pantalla", "nuevo listado", "nueva tabla", "crear feature crud",
  "agregar vista de gestión" o cualquier variante que implique listar,
  crear, editar o eliminar registros en el panel de administración.
---

# SECUREX — Patrón CRUD Estándar

Este proyecto usa una arquitectura CRUD unificada. **Nunca implementes lógica CRUD ad-hoc** en un componente. Siempre sigue este patrón exacto.

---

## 📁 Ejemplos reales (leer antes de implementar un CRUD complejo)

Estos archivos son copias reales del proyecto con comentarios inline detallados:

- `examples/user-crud-advanced.ts` — Componente completo: catálogos encadenados con `switchMap`, `computed()`, `effect()`, modal extra, `mappingConfig.pick`
- `examples/user-config-annotated.ts` — Config de columnas y formulario: tipo `user`, `badge` con `filterMulti`, `select-grid` con `columns`, `dataPath`, campos `disabled`
- `examples/user-template-annotated.html` — Template HTML: todos los `[inputs]` y `(outputs)` de `CrudPageComponent` comentados

---

## Archivos que componen un CRUD

Cada feature CRUD genera **3 archivos** dentro de `src/app/features/<dominio>/<nombre>/`:

```
src/app/features/<dominio>/<nombre>/
├── <nombre>.component.ts     ← Lógica del componente
├── <nombre>.component.html   ← Template (casi siempre 1 línea)
└── <nombre>.config.ts        ← Columnas de tabla + campos de formulario
```

---

## Paso 1 — Crear el servicio de dominio (si no existe)

Extiende **siempre** de `BaseApiService`. Ubica el archivo en `src/app/core/services/`.

```typescript
// src/app/core/services/producto.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class ProductoService extends BaseApiService {

  // Para REST:
  getPaginated(page: number, limit: number, filter?: any, sort?: any): Observable<any> {
    return this.gql.query<any>('security', SECUREX_QUERIES.PRODUCTOS, { page, limit, filter, sort });
  }

  create(data: any): Observable<any> {
    return this.gql.mutate<any>('security', SECUREX_QUERIES.CREATE_PRODUCTO, data);
  }

  update(uuid: string, data: any): Observable<any> {
    return this.gql.mutate<any>('security', SECUREX_QUERIES.UPDATE_PRODUCTO, { uuid, ...data });
  }

  delete(uuid: string): Observable<any> {
    return this.gql.mutate<any>('security', SECUREX_QUERIES.DELETE_PRODUCTO, { uuid });
  }
}
```

---

## Paso 2 — Crear el archivo de configuración

```typescript
// src/app/features/<dominio>/<nombre>/<nombre>.config.ts
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

// ─── Columnas de la tabla ─────────────────────────────────────────────────────
export const PRODUCTO_COLS: TableColumn[] = [
  {
    field: 'name',
    header: 'Nombre',
    type: 'text',     // 'text' | 'badge' | 'user' | 'date' | 'actions' | 'role' | 'boolean' | 'number'
    sortable: true
  },
  {
    field: 'status',
    header: 'Estado',
    type: 'badge',
    sortable: true,
    filterOptions: [
      { label: 'Activo', value: 'ACTIVE' },
      { label: 'Inactivo', value: 'INACTIVE' }
    ],
    filterOptionLabel: 'label',
    filterMulti: true,
    render: (row) => ({ ACTIVE: 'Activo', INACTIVE: 'Inactivo' }[row.status as string] || row.status)
  },
  {
    field: 'user.full_name',           // paths anidados: navega automáticamente por el objeto
    header: 'Responsable',
    type: 'user',
    subField: 'user.email',            // segunda línea del cell tipo "user"
    avatarField: 'user.profile_picture'
  },
  { field: 'created_at', header: 'Creado', type: 'date', sortable: true },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

// ─── Campos del formulario ────────────────────────────────────────────────────
export const createProductoForm = (catalogs: any): FormField[] => [
  {
    name: 'name',
    label: 'Nombre',
    type: 'text',    // 'text' | 'select' | 'select-grid' | 'textarea' | 'file' | 'date' | 'number' | 'toggle' | 'password'
    required: true,
    icon: 'pi pi-tag',
    placeholder: 'Nombre del producto'
  },
  {
    name: 'category_uuid',
    label: 'Categoría',
    type: 'select',
    required: true,
    icon: 'pi pi-list',
    options: (catalogs['categories'] || []).map((c: any) => ({ label: c.name, value: c.uuid })),
    placeholder: '- Seleccionar categoría -'
  },
  {
    name: 'status',
    label: 'Estado',
    type: 'select',
    required: true,
    icon: 'pi pi-check-circle',
    options: [
      { label: 'Activo', value: 'ACTIVE' },
      { label: 'Inactivo', value: 'INACTIVE' }
    ]
  }
];
```

---

## Paso 3 — Componente TypeScript

```typescript
// src/app/features/<dominio>/<nombre>/<nombre>.component.ts
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '@core/services/producto.service';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { PRODUCTO_COLS, createProductoForm } from './<nombre>.config';

@Component({
  selector: 'app-producto-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './<nombre>.component.html',
  providers: [UnifiedCrudService]   // ← CRÍTICO: siempre en providers del componente, nunca root
})
export class ProductoCrudComponent implements OnInit {
  private productoService = inject(ProductoService);
  crud = inject(UnifiedCrudService);

  cols = PRODUCTO_COLS;

  formFields = computed(() => createProductoForm(this.crud.catalogItems()));

  ngOnInit(): void {
    this.crud.initialize({
      resourceName: 'Producto',
      fnFetch: this.productoService.getPaginated.bind(this.productoService),
      fnCreate: this.productoService.create.bind(this.productoService),
      fnUpdate: this.productoService.update.bind(this.productoService),
      fnDelete: this.productoService.delete.bind(this.productoService),
      primaryKey: 'uuid',              // default: 'uuid'. Cambia si el backend usa 'id'
      defaultSortKey: 'created_at',
      mappingConfig: {
        pick: ['name', 'category_uuid', 'status']  // campos que se envían al backend
      },
      fnCatalogs: {
        categories: () => this.productoService.getCategories()
      }
      // hooks opcionales:
      // hooks: {
      //   onBeforeSave: async (data, mode) => ({ ...data, extra: 'valor' }),
      //   onAfterSave: (res, mode) => { this.doSomething(); },
      //   onBeforeDelete: async (item) => { return confirm('¿Eliminar?'); }
      // }
    });

    this.crud.load();
  }
}
```

---

## Paso 4 — Template HTML (casi siempre es exactamente esto)

```html
<!-- src/app/features/<dominio>/<nombre>/<nombre>.component.html -->
<app-crud-page
  title="Productos"
  subtitle="Gestión del catálogo de productos"
  [resourceName]="'Producto'"
  [columns]="cols"
  [data]="crud.items()"
  [loading]="crud.loading()"
  [lazy]="true"
  [totalRecords]="crud.totalRecords()"
  [showAdd]="true"
  [showEdit]="true"
  [showDelete]="true"
  [formFields]="formFields()"
  [isSaving]="crud.isSaving()"
  deleteMessage="¿Estás seguro de eliminar este producto?"
  (onLazyLoad)="crud.load($event)"
  (onSave)="crud.save($event)"
  (onConfirmDelete)="crud.confirmDelete($event)"
  (onAdd)="crud.handleAdd()"
  (onEdit)="crud.handleEdit($event)"
  (onRefresh)="crud.load()">
</app-crud-page>
```

---

## Variante: CRUD en modo árbol (TreeTable)

Para recursos jerárquicos (categorías, permisos, etc.):

```typescript
this.crud.initialize({
  resourceName: 'Categoría',
  isTreeMode: true,                                          // ← activa modo árbol
  fnFetchTree: () => this.categoriaService.getTree(),        // retorna array plano
  mapTreeFn: (items) => this.buildTreeNodes(items),          // convierte a TreeNode[]
  fnCreate: ...,
  fnUpdate: ...,
  fnDelete: ...,
  resourceName: 'Categoría'
});
```

---

## Señales de alerta — Cuándo NO usar este patrón

- Si la pantalla es de **solo lectura** (sin create/edit/delete): usa signals simples en el componente + tabla PrimeNG directa.
- Si la pantalla es un **formulario de configuración** único (no lista): usa un form reactivo con Angular Signals.
- Si necesitas **múltiples tablas relacionadas** en la misma pantalla: considera usar múltiples instancias de `UnifiedCrudService` en `providers`.

---

## Agregar la ruta al módulo de features

```typescript
// En el routes file del feature:
{
  path: 'productos',
  title: 'Productos',
  loadComponent: () => import('./producto/producto.component').then(m => m.ProductoCrudComponent)
}
```

---

## Referencia de tipos de columna (TableColumn.type)

| Tipo | Descripción |
|---|---|
| `text` | Texto plano |
| `badge` | Chip de color con label |
| `boolean` | Ícono check/x |
| `user` | Avatar + nombre + email (usa `subField` y `avatarField`) |
| `role` | Badge de rol |
| `date` | Fecha formateada |
| `number` | Número formateado |
| `actions` | Columna con botones Editar/Eliminar |

## Referencia de tipos de campo de formulario (FormField.type)

| Tipo | Descripción |
|---|---|
| `text` | Input de texto |
| `number` | Input numérico |
| `textarea` | Área de texto |
| `select` | Dropdown de opciones |
| `select-grid` | Dropdown con tabla de búsqueda (para listas largas de usuarios/items) |
| `date` | DatePicker |
| `toggle` | Switch booleano |
| `password` | Input de contraseña |
| `file` | Input de archivo/imagen |
| `color` | Input de color |
