import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUserValue;

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Si es superadmin o la ruta es home, permitir siempre
  if (authService.isAdmin || state.url === '/home' || state.url === '/') {
    return true;
  }

  // Si el menú no está cargado, cargarlo primero
  if (authService.userMenu().length === 0) {
    return authService.refreshPermissions().pipe(
      map(() => {
        return checkAccess(authService, router, state.url);
      })
    );
  }

  // Si no tiene acceso en la caché local, intentamos refrescar el menú desde el API para ver si hay nuevos permisos
  if (!authService.hasRouteAccess(state.url)) {
    return authService.refreshPermissions().pipe(
      map(() => {
        return checkAccess(authService, router, state.url);
      })
    );
  }

  return checkAccess(authService, router, state.url);
};

function checkAccess(authService: AuthService, router: Router, url: string): boolean {
  if (authService.hasRouteAccess(url)) {
    return true;
  }

  const firstRoute = authService.getFirstAccessibleRoute();
  if (firstRoute) {
    router.navigate([firstRoute]);
  } else {
    authService.logout();
  }
  return false;
}
