---
name: securex-auth-services
description: >
  Skill para entender y trabajar con los servicios de autenticación, autorización
  y permisos de SECUREX. Actívate cuando el usuario pida "proteger ruta",
  "verificar permiso", "guard", "rol de usuario", "sesión", "token", "WebAuthn",
  "passkey", "empresa activa", "cambiar empresa", "perfil de usuario",
  "permisos del rol", "usuario actual", "AuthService", "logout", o cualquier
  tarea relacionada con acceso y seguridad.
---

# SECUREX — Autenticación y Servicios de Core

---

## ⚠️ ARCHIVO PROTEGIDO

```
src/app/core/services/auth.service.ts   ← NO modificar sin instrucción explícita
```

`AuthService` maneja: login, logout, token refresh, WebAuthn, company switching, y el estado global de sesión. Tiene **450 líneas** con lógica muy interdependiente.

---

## AuthService — Signals públicos disponibles

Inyecta `AuthService` en cualquier componente/servicio para leer el estado de sesión:

```typescript
import { AuthService } from '@core/services/auth.service';

const auth = inject(AuthService);

// Usuario actual:
auth.currentUser()        // User | null (signal readonly)
auth.userMenu()           // MenuItem[] — menú de navegación del usuario
auth.userPermissions()    // string[] — slugs de permisos

// Empresa y sucursal activa:
auth.currentCompany()     // Company | null
auth.currentBranch()      // Branch | null
auth.userCompanies()      // Company[]
auth.userBranches()       // Branch[]

// Estados de carga:
auth.switchCompanyLoading()  // boolean — cambiando de empresa
auth.isRefreshing()          // boolean — refrescando token
```

---

## Cómo verificar si el usuario tiene un permiso

```typescript
import { PermissionService } from '@core/services/permission.service';

const permService = inject(PermissionService);

// En un computed o método:
const canEdit = computed(() => permService.hasPermission('users.edit'));
const canDelete = computed(() => permService.hasPermission('users.delete'));

// En template:
// @if (canEdit()) { <button>Editar</button> }
```

---

## Guard de rutas

El `authGuard` ya está configurado en el router raíz. Para rutas protegidas ya existentes, no necesitas cambiarlo.

Si necesitas un guard adicional por permiso:

```typescript
// src/app/core/guards/permission.guard.ts (crear si no existe)
export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const permService = inject(PermissionService);
    const router = inject(Router);
    if (permService.hasPermission(permission)) return true;
    return router.createUrlTree(['/home']);
  };
};
```

---

## UserService — Operaciones sobre usuarios

```typescript
import { UserService } from '@core/services/user.service';

const userService = inject(UserService);

// Obtener lista paginada (para CRUD):
userService.getUserAccessesPaginated(page, limit, filter, sort);

// Datos de una página (empresas, usuarios, apps, sucursales en una sola query):
userService.getUserAccessPageData();

// Crear acceso de usuario:
userService.createUserAccessGql(data);

// Actualizar acceso:
userService.updateUserAccessGql(uuid, data);

// Eliminar acceso:
userService.deleteUserAccessGql(uuid);
```

---

## RoleService — Operaciones sobre roles

```typescript
import { RoleService } from '@core/services/role.service';

const roleService = inject(RoleService);

// Roles por empresa:
roleService.getRolesByCompany(appId, companyUuid);

// Lista completa paginada:
roleService.getRolesPaginated(page, limit, filter, sort);
```

---

## ProfileService — Perfil del usuario actual

```typescript
import { ProfileService } from '@core/services/profile.service';

const profileService = inject(ProfileService);

profileService.getProfile();                          // Query /me
profileService.updateProfile(data);                   // Actualizar datos
profileService.updateProfilePicture(formData);        // Cambiar avatar
```

---

## WebAuthnService — Passkeys

```typescript
import { WebAuthnService } from '@core/services/webauthn.service';

const webAuthn = inject(WebAuthnService);

// Registrar nueva passkey:
await webAuthn.registerCredential(deviceName);

// Eliminar passkey:
await webAuthn.deleteCredential(credentialId);

// Login con passkey (en la pantalla de login):
await webAuthn.authenticate();
```

---

## StorageService — Acceso al storage local

**Nunca** accedas a `localStorage` o `sessionStorage` directamente. Usa `StorageService`:

```typescript
import { StorageService } from '@core/services/storage.service';

const storage = inject(StorageService);

// Usuario guardado en sesión:
storage.getUser()           // User | null
storage.getAccessToken()    // string | null
storage.getRefreshToken()   // string | null
storage.getCompany()        // Company | null
storage.getUserCompanies()  // Company[]

// Limpiar sesión:
storage.clearAll()   // solo lo usa auth.logout()
```

---

## Respuesta de API — Formato estándar

El `responseInterceptor` desenvuelve automáticamente `{ status, data }`. Tus servicios reciben el `data` directamente.

```typescript
// Backend retorna: { "status": "success", "data": { "uuid": "..." } }
// El interceptor te entrega: { "uuid": "..." }

// Por lo tanto en tu servicio:
this.http.get<User>(`${this.apiUrl}/users/me`)  // ← ya te devuelve User, no ApiResponse<User>
```

---

## Cambiar de empresa activa

```typescript
// Desde cualquier componente con acceso a AuthService:
const auth = inject(AuthService);

// Trigger manual de cambio de empresa:
auth.switchCompany(companyUuid).subscribe({
  next: () => { /* empresa cambiada */ },
  error: (err) => { /* manejar error */ }
});
```

---

## Interceptores — cuándo necesitas los context tokens

Para mostrar un toast desde un HTTP request específico sin modificar el `responseInterceptor`:

```typescript
import { HttpContext } from '@angular/common/http';
import { SHOW_TOAST, TOAST_MESSAGE } from '@core/interceptors/response.interceptor';

// En un servicio:
this.http.post(url, data, {
  context: new HttpContext()
    .set(SHOW_TOAST, true)
    .set(TOAST_MESSAGE, 'Configuración guardada')
})
```

---

## Flujo completo de autenticación (para entender, no modificar)

```
1. LoginComponent → AuthService.login(email, password)
2. AuthService guarda tokens en StorageService
3. AuthService.initSession() → carga currentUser, permissions, menu, companies
4. Router navega a /home
5. authInterceptor agrega Bearer en cada request
6. Si 401 → refreshToken() → reintenta → si falla → logout()
7. LogoutComponent → AuthService.logout() → limpia storage → navega a /login
```
