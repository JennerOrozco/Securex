import { Routes } from '@angular/router';
import { inject, effect } from '@angular/core';
import { AuditService } from '@core/services/audit.service';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';

export const logsMonitoringRoutes: Routes = [
  {
    path: 'security-audit',
    title: 'Auditoría de Seguridad',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      permission: 'securex.security',
      title: 'Auditoría de Seguridad',
      subtitle: 'Registro de eventos de seguridad del sistema',
      resourceName: 'Auditoría',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteTitle: 'Eliminar Log de Auditoría',
      deleteMessage: '¿Estás seguro de eliminar este registro de auditoría?',
      defaultSortKey: 'created_at',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(AuditService).getSecurityAuditLogs(page, limit, filter, sort),
      fnDelete: (id: string) => inject(AuditService).deleteSecurityAuditLog(id),
      cols: () => import('./security-audit/security-audit.config').then(m => m.SECURITY_AUDIT_COLS),
      onInitFn: (crud: UnifiedCrudService, cols: any[]) => {
        effect(() => {
          const logs = crud.items();
          const eventTypes = [...new Set(logs.map((l: any) => l.event_type).filter(Boolean))];
          const col = cols.find((c: any) => c.field === 'event_type');
          if (col) col.filterOptions = eventTypes.map((e: any) => ({ label: e, value: e }));
        });
      }
    }
  },
  {
    path: 'login-attempts',
    title: 'Intentos de Acceso',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      hidePermissionGate: true,
      title: 'Intentos de Acceso',
      subtitle: 'Historial de intentos de inicio de sesión en el sistema',
      resourceName: 'Intento de Acceso',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteTitle: 'Eliminar Intento de Acceso',
      deleteMessage: '¿Estás seguro de eliminar este intento de acceso?',
      defaultSortKey: 'created_at',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(AuditService).getLoginAttemptsGql(page, limit, filter, sort),
      fnDelete: (id: string) => inject(AuditService).deleteLoginAttempt(Number(id)),
      cols: () => import('./login-attempts/login-attempts.config').then(m => m.LOGIN_ATTEMPTS_COLS)
    }
  },
  {
    path: 'password-resets',
    title: 'Restablecimientos de Contraseña',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      hidePermissionGate: true,
      title: 'Reseteos de Contraseña',
      subtitle: 'Historial de solicitudes de reseteo de contraseñas de los usuarios',
      resourceName: 'Registro de Reseteo',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteTitle: 'Eliminar Solicitud de Reseteo',
      deleteMessage: '¿Estás seguro de eliminar este registro de reseteo?',
      defaultSortKey: 'created_at',
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(AuditService).getPasswordResetsGql(page, limit, filter, sort),
      fnDelete: (id: string) => inject(AuditService).deletePasswordReset(Number(id)),
      cols: () => import('./reseteos-clave/password-resets.config').then(m => m.PASSWORD_RESETS_COLS)
    }
  },
  {
    path: 'refresh-tokens',
    title: 'Tokens de Refresco',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      hidePermissionGate: true,
      title: 'Tokens de Refresco',
      subtitle: 'Historial de tokens de autenticación activos y revocados',
      resourceName: 'Token de Refresco',
      lazy: true,
      showAdd: false,
      showEdit: false,
      showDelete: true,
      deleteTitle: 'Revocar/Eliminar Token',
      deleteMessage: '¿Estás seguro de eliminar este token? Esto obligará al usuario a iniciar sesión de nuevo.',
      defaultSortKey: 'id',
      columnMap: { created_at: 'issued_at', user_name: null as any, app_name: null as any },
      fnFetch: (page: number, limit: number, filter: any, sort: any) => inject(AuditService).getRefreshTokensGql(page, limit, filter, sort),
      fnDelete: (id: string) => inject(AuditService).deleteRefreshToken(Number(id)),
      cols: () => import('./refresh-tokens/refresh-tokens.config').then(m => m.REFRESH_TOKENS_COLS)
    }
  },
  {
    path: 'api-status',
    title: 'Estado de APIs',
    loadComponent: () => import('./api-status/api-status.component').then(m => m.ApiStatusComponent)
  }
];
