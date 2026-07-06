---
name: securex-notification-system
description: >
  Skill para trabajar con el sistema de notificaciones de SECUREX: toasts,
  notificaciones en tiempo real via SSE (Server-Sent Events), Web Push (VAPID),
  y el GraphQL del microservicio de notificaciones. Actívate cuando el usuario
  pida "notificación", "push", "SSE", "alerta en tiempo real", "notification",
  "configurar push", "marcar leída", "panel de notificaciones" o similar.
---

# SECUREX — Sistema de Notificaciones

El sistema de notificaciones tiene **3 capas independientes**. Conoce cada una antes de tocarlas.

```
Capa 1: Toasts en pantalla     → NotificationService.success/error/warn/info()
Capa 2: Notificaciones en DB   → GraphQL del microservicio de notificaciones  
Capa 3: Real-time SSE + Push   → NotificationService.initSSE() + SwPush
```

---

## ⚠️ ARCHIVOS PROTEGIDOS

```
src/app/core/services/notification.service.ts  ← NO modificar sin instrucción explícita
```

Este archivo maneja SSE, WebPush y toasts. Es frágil porque:
- `EventSource` no acepta cabeceras; el token va en query param
- El reconexión automática del SSE depende del `readyState`
- El VAPID puede rotar; hay lógica de retry de suscripción
- `NgZone.run()` es crítico para que Angular detecte los cambios del SSE

---

## Capa 1: Toasts (uso cotidiano)

```typescript
// Inyectar en cualquier servicio o componente:
private notification = inject(NotificationService);

// Métodos disponibles:
this.notification.success('Guardado correctamente');
this.notification.error('Error al procesar');
this.notification.warn('Atención: revisa los datos');
this.notification.info('Proceso iniciado');

// Con datos extra (para rich-notification):
this.notification.success('Usuario creado', { userId: 'abc123' });

// Nivel genérico:
this.notification.notify('success' | 'error' | 'warn' | 'info', 'Mensaje', optionalData);
```

**Duración automática:**
- `success` → 2000ms
- `error` → 3000ms
- `info` → 2000ms
- `warn` → 2500ms

---

## Capa 2: Notificaciones persistentes en BD (GraphQL)

El microservicio de notificaciones tiene su propio endpoint GraphQL en `configService.notificationApiUrl/graphql`.

### Queries disponibles (importar de `notification.queries.ts`)

```typescript
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '@core/graphql/queries/notification.queries';
import { GraphqlService } from '@core/graphql/graphql.service';

const gql = inject(GraphqlService);

// Listar notificaciones del usuario:
gql.query<{ notifications: { data: AppNotification[]; total: number } }>(
  'notification',
  NOTIFICATION_QUERIES.NOTIFICATIONS,
  { page: 1, limit: 50 }
)

// Listar dispositivos registrados:
gql.query('notification', NOTIFICATION_QUERIES.USER_DEVICES, { page: 1, limit: 20 })

// Listar logs de envíos:
gql.query('notification', NOTIFICATION_QUERIES.SEND_ATTEMPTS, { page: 1, limit: 20 })

// Config SMTP:
gql.query('notification', NOTIFICATION_QUERIES.SMTP_SETTINGS, { page: 1, limit: 10 })

// Config VAPID / Push Settings:
gql.query('notification', NOTIFICATION_QUERIES.PUSH_SETTINGS, { page: 1, limit: 10 })
```

### Mutations disponibles

```typescript
// Marcar como leída:
gql.mutate('notification', NOTIFICATION_MUTATIONS.MARK_READ, { id: notif.id })

// Eliminar notificación:
gql.mutate('notification', NOTIFICATION_MUTATIONS.DELETE_NOTIFICATION, { id: notif.id })

// Eliminar dispositivo registrado:
gql.mutate('notification', NOTIFICATION_MUTATIONS.DELETE_DEVICE, { id: device.id })

// Guardar config SMTP:
gql.mutate('notification', NOTIFICATION_MUTATIONS.SAVE_SMTP_SETTING, {
  id: null,                 // null para crear, número para actualizar
  app_uuid: '...',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_user: 'user@mail.com',
  smtp_pass: '...',
  smtp_encryption: 'TLS',
  from_email: 'noreply@company.com',
  from_name: 'SECUREX'
})

// Eliminar config SMTP:
gql.mutate('notification', NOTIFICATION_MUTATIONS.DELETE_SMTP_SETTING, { id: smtp.id })
```

### Usar NotificationService para las operaciones del usuario

```typescript
// Ya tiene métodos convenientes:
private notifService = inject(NotificationService);

// Obtener notificaciones del usuario:
notifService.getNotifications(page, limit).subscribe(notifications => { ... });

// Marcar como leída:
notifService.markAsRead(notif.id).subscribe();

// Eliminar notificación:
notifService.deleteNotification(notif.id).subscribe();
```

### Interfaz AppNotification

```typescript
interface AppNotification {
  id: number;
  user_uuid: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  route_url?: string | null;
  icon_url?: string | null;
  // Extras del GraphQL completo:
  type?: string;
  channels?: string;
  company_uuid?: string;
}
```

---

## Capa 3: SSE — Notificaciones en tiempo real

El SSE se inicia en `AuthService` después del login. **No inicies SSE manualmente** en componentes.

### Cómo suscribirse al stream en un componente

```typescript
import { NotificationService } from '@core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

export class MiComponente {
  private notifService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Suscribirse al Subject del SSE:
    this.notifService.realTimeNotification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newNotif: AppNotification) => {
        // Mostrar badge, actualizar contador, agregar a lista, etc.
        console.log('Nueva notificación en tiempo real:', newNotif);
      });
  }
}
```

### Cómo funciona internamente (NO modificar)

```
Login exitoso
  → AuthService llama initSSE(token)
  → EventSource conecta a: notificationApiUrl/notifications/stream?token=<jwt>
  → onmessage → NgZone.run() → realTimeNotification$.next(parsed)
  → EventSource auto-reconecta si se cae
  → AuthService.logout() → closeSSE()
```

---

## Capa 3: Web Push (PWA)

### Registrar dispositivo (solo si no está registrado)

```typescript
// Ya manejado por AuthService post-login. Solo llama si necesitas re-registrar:
const notifService = inject(NotificationService);
await notifService.registerForPush();
```

### Desregistrar dispositivo

```typescript
await notifService.unsubscribeFromPush();
```

### Enviar notificación de prueba

```typescript
notifService.sendTestNotification(userUuid, companyUuid).subscribe();
```

---

## Agregar nuevos tipos de notificación (desde el backend)

Para añadir un nuevo tipo de notificación que llegue al frontend por SSE:

1. El backend envía un `AppNotification` por SSE con el campo `type` nuevo.
2. En el componente que escucha `realTimeNotification$`, filtra por `type`:

```typescript
this.notifService.realTimeNotification$
  .pipe(
    takeUntilDestroyed(this.destroyRef),
    filter(n => n.type === 'NEW_ORDER')   // filtra por tipo
  )
  .subscribe(notif => {
    // Lógica específica para 'NEW_ORDER'
  });
```

3. Si necesitas un toast automático para el nuevo tipo, agrégalo en `notification-panel.component.ts`, no en `notification.service.ts`.

---

## Configuración de notificaciones del usuario (`notification-settings.service.ts`)

```typescript
// Servicio para las preferencias de notificación del usuario:
import { NotificationSettingsService } from '@core/services/notification-settings.service';

const settingsService = inject(NotificationSettingsService);
settingsService.getSettings().subscribe(settings => { ... });
settingsService.updateSettings(payload).subscribe();
```

---

## Ubicación de componentes del panel

| Archivo | Propósito |
|---|---|
| `src/app/layout/notification-panel/` | Panel lateral de notificaciones del header |
| `src/app/shared/components/notification-panel/` | Componente shared del panel |
| `src/app/shared/components/rich-notification/` | Toast enriquecido con datos extra |
| `src/app/features/notification/` | Feature completo de gestión de notificaciones |
