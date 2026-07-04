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
      crudConfigKey: 'security-audit',
      permission: 'securex.security',
      fnDelete: (id: string) => inject(AuditService).deleteSecurityAuditLog(id),
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
      crudConfigKey: 'login-attempts',
      hidePermissionGate: true,
      fnDelete: (id: string) => inject(AuditService).deleteLoginAttempt(Number(id)),
    }
  },
  {
    path: 'password-resets',
    title: 'Restablecimientos de Contraseña',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'password-resets',
      hidePermissionGate: true,
      fnDelete: (id: string) => inject(AuditService).deletePasswordReset(Number(id)),
    }
  },
  {
    path: 'refresh-tokens',
    title: 'Tokens de Refresco',
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: {
      crudConfigKey: 'refresh-tokens',
      hidePermissionGate: true,
      columnMap: { created_at: 'issued_at', user_name: null as any, app_name: null as any },
      fnDelete: (id: string) => inject(AuditService).deleteRefreshToken(Number(id)),
    }
  },
  {
    path: 'api-status',
    title: 'Estado de APIs',
    loadComponent: () => import('./api-status/api-status.component').then(m => m.ApiStatusComponent)
  }
];
