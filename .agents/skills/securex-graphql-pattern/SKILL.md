---
name: securex-graphql-pattern
description: >
  Skill para trabajar con GraphQL en SECUREX. Actívate cuando el usuario pida
  "agregar query", "nueva consulta GraphQL", "agregar mutación", "conectar
  con nuevo endpoint GraphQL", "consultar dato desde el backend", "agregar
  operación GraphQL" o cuando necesite saber cómo se estructura una query
  nueva en este proyecto.
---

# SECUREX — Patrón GraphQL

Este proyecto usa un cliente GraphQL **propio** (sin Apollo). Todo pasa por `GraphqlService`.

---

## ⚠️ Regla absoluta

**NUNCA** instales ni uses Apollo Client, urql, ni ninguna librería GraphQL de terceros. `GraphqlService` ya maneja todo: autenticación (vía interceptores), errores, y multi-dominio.

---

## Dominios GraphQL disponibles

```typescript
type GraphqlDomain = 'crm' | 'finance' | 'security' | 'notification' | 'report';
```

| Dominio | Backend URL (de ConfigService) | Archivo de queries |
|---|---|---|
| `'security'` | `configService.apiUrl/graphql` | `securex.queries.ts` |
| `'notification'` | `configService.notificationApiUrl/graphql` | `notification.queries.ts` |
| `'finance'` | `configService.financeApiUrl/graphql` | *(crear finance.queries.ts)* |
| `'crm'` | `configService.crmApiUrl/graphql` | *(crear crm.queries.ts)* |
| `'report'` | `configService.reportApiUrl/graphql` | *(crear report.queries.ts)* |

---

## Cómo usar GraphqlService

```typescript
import { GraphqlService } from '@core/graphql/graphql.service';
import { SECUREX_QUERIES } from '@core/graphql/queries/securex.queries';

// En cualquier servicio que extienda BaseApiService:
private gql = inject(GraphqlService);

// Query paginada:
this.gql.query<{ products: { data: Product[]; total: number } }>(
  'security',
  SECUREX_QUERIES.PRODUCTS,
  { page: 1, limit: 20, filter: null, sort: null }
)

// Query de elemento único:
this.gql.query<{ product: Product }>(
  'security',
  SECUREX_QUERIES.PRODUCT,
  { uuid: 'some-uuid' }
)

// Mutación:
this.gql.mutate<{ createProduct: Product }>(
  'security',
  SECUREX_QUERIES.CREATE_PRODUCT,
  { name: 'Nuevo', status: 'ACTIVE' }
)
```

## Usando los helpers de BaseApiService (más limpio)

```typescript
// En un service que extiende BaseApiService:

// Lista sin paginar:
this.gqlQueryList<Category>('security', SECUREX_QUERIES.CATEGORIES, 'categories');

// Elemento único:
this.gqlQuerySingle<User>('security', SECUREX_QUERIES.USER, 'user', { uuid });

// Mutación (retorna un campo específico):
this.gqlMutate<any>('security', SECUREX_QUERIES.DELETE_USER, 'deleteUser', { uuid });
```

---

## Cómo agregar una nueva query

### 1. Definir la query en el archivo correspondiente

```typescript
// src/app/core/graphql/queries/securex.queries.ts
export const SECUREX_QUERIES = {
  // ... queries existentes ...

  // ← Agrega al final del objeto:
  PRODUCTS: `
    query Products($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      products(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          uuid name status created_at
          category { uuid name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,

  PRODUCT: `
    query Product($uuid: String!) {
      product(uuid: $uuid) {
        uuid name status created_at
        category { uuid name }
      }
    }
  `,

  CREATE_PRODUCT: `
    mutation CreateProduct($name: String!, $category_uuid: String!, $status: String) {
      createProduct(name: $name, category_uuid: $category_uuid, status: $status) {
        uuid name status
      }
    }
  `,

  UPDATE_PRODUCT: `
    mutation UpdateProduct($uuid: String!, $name: String, $status: String) {
      updateProduct(uuid: $uuid, name: $name, status: $status) {
        uuid name status
      }
    }
  `,

  DELETE_PRODUCT: `
    mutation DeleteProduct($uuid: String!) {
      deleteProduct(uuid: $uuid)
    }
  `
};
```

### 2. Actualizar el registro de queries (registry.ts)

```typescript
// src/app/core/graphql/queries/registry.ts
// Agrega una entrada con comentario de contexto:
export const QUERY_REGISTRY = {
  // ...existing...
  
  // Products
  PRODUCTS: 'security',
  PRODUCT: 'security',
  CREATE_PRODUCT: 'security',
  UPDATE_PRODUCT: 'security',
  DELETE_PRODUCT: 'security',
};
```

---

## Estructura de una query paginada (estándar del backend)

Todas las queries paginadas del proyecto siguen este patrón exacto:

```graphql
query EntityList($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
  entityName(page: $page, limit: $limit, filter: $filter, sort: $sort) {
    data {
      # campos del entity
    }
    total
    currentPage
    perPage
    hasMorePages
  }
}
```

El `UnifiedCrudService` espera exactamente este formato para sus operaciones de paginación.

---

## Tipado correcto de respuestas paginadas

```typescript
// Tipo helper para respuestas GraphQL paginadas:
interface GqlPaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  perPage: number;
  hasMorePages: boolean;
}

// Uso en el servicio:
this.gql.query<{ products: GqlPaginatedResult<Product> }>(
  'security',
  SECUREX_QUERIES.PRODUCTS,
  { page, limit, filter, sort }
)
```

---

## Cómo el servicio conecta con UnifiedCrudService

El `fnFetch` del CRUD debe retornar el Observable **sin desempaquetar** (el `UnifiedCrudService` usa `extractPaginatedData` internamente):

```typescript
// ✅ CORRECTO — retorna el Observable de la query completa:
getPaginated(page: number, limit: number, filter?: any, sort?: any) {
  return this.gql.query<{ products: GqlPaginatedResult<Product> }>(
    'security',
    SECUREX_QUERIES.PRODUCTS,
    { page, limit, filter, sort }
  );
}

// ❌ INCORRECTO — no desempaquetar aquí:
getPaginated(page: number, limit: number) {
  return this.gql.query(...).pipe(map(d => d.products.data)); // ← no hagas esto para fnFetch
}
```

---

## Manejo de errores en GraphQL

`GraphqlService` ya lanza `Error` si la respuesta tiene `errors[]`. El `responseInterceptor` captura errores HTTP. En los servicios, **no necesitas** `.catch()` manual a menos que quieras comportamiento especial:

```typescript
// El UnifiedCrudService ya maneja el error y muestra toast automáticamente.
// Solo agrega catchError si necesitas fallback específico:
this.gql.query<...>('security', SECUREX_QUERIES.PRODUCT, { uuid }).pipe(
  catchError(err => {
    this.logger.error('Error específico', err, 'ProductoService');
    return of(defaultValue);
  })
)
```

---

## Filtros y orden (variables estándar)

```typescript
// filter: GenericFilterInput
const filter = {
  field: 'status',
  value: 'ACTIVE',
  operator: 'eq'   // 'eq' | 'like' | 'in' | 'gte' | 'lte'
};

// sort: SortInput
const sort = {
  field: 'created_at',
  order: 'DESC'   // 'ASC' | 'DESC'
};
```

El `UnifiedCrudService` genera estos objetos automáticamente a partir del `LazyLoadEvent` de PrimeNG cuando usas `crud.load($event)`.
