import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/access-login/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        title: 'Dashboard',
        loadComponent: () => import('./features/home/dashboard.component').then(m => m.DashboardComponent)
      },

      // ── Access Login (perfil, usuarios de sesión, roles, permisos) ──────────
      {
        path: 'security',
        loadChildren: () => import('./features/access-login/access-login.routes').then(m => m.accessLoginRoutes)
      },

      // ── Global Config (catálogos, acceso admin, permisos por compañía) ──────
      {
        path: 'config',
        loadChildren: () => import('./features/global-config/global-config.routes').then(m => m.globalConfigRoutes)
      },

      // ── Logs & Monitoring ────────────────────────────────────────────────────
      {
        path: 'system-logs',
        loadChildren: () => import('./features/logs-monitoring/logs-monitoring.routes').then(m => m.logsMonitoringRoutes)
      },

      // ── Notifications ────────────────────────────────────────────────────────
      {
        path: 'notification',
        loadChildren: () => import('./features/notification/notification.routes').then(m => m.notificationRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
