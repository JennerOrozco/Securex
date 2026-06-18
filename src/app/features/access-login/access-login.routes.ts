import { Routes } from '@angular/router';

export const accessLoginRoutes: Routes = [
  {
    path: 'profile',
    title: 'Mi Perfil',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'users',
    title: 'Usuarios',
    loadComponent: () => import('./user/user.component').then(m => m.SecurityUserCrudComponent)
  },
  {
    path: 'roles',
    title: 'Roles',
    loadComponent: () => import('./roles/roles.component').then(m => m.SecurityRoleCrudComponent)
  },
  {
    path: 'permissions',
    title: 'Permisos',
    loadComponent: () => import('./permissions/permissions.component').then(m => m.SecurityPermissionCrudComponent)
  }
];
