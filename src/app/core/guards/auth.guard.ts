import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { map, of, Observable, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    private authService = inject(AuthService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        const currentUser = this.authService.currentUserValue;

        if (!currentUser) {
            this.router.navigate(['/login']);
            return false;
        }

        // Si es superadmin o la ruta es home, permitir siempre
        if (this.authService.isAdmin || state.url === '/home' || state.url === '/') {
            return true;
        }

        // Si el menú no está cargado, cargarlo primero
        if (this.authService.userMenu().length === 0) {
            return this.authService.refreshPermissions().pipe(
                map(() => {
                    return this.checkAccess(state.url);
                })
            );
        }

        // Si no tiene acceso en la caché local, intentamos refrescar el menú desde el API para ver si hay nuevos permisos
        if (!this.authService.hasRouteAccess(state.url)) {
            return this.authService.refreshPermissions().pipe(
                map(() => {
                    return this.checkAccess(state.url);
                })
            );
        }

        return this.checkAccess(state.url);
    }

    private checkAccess(url: string): boolean {
        if (this.authService.hasRouteAccess(url)) {
            return true;
        }

        const firstRoute = this.authService.getFirstAccessibleRoute();
        if (firstRoute) {
            this.router.navigate([firstRoute]);
        } else {
            this.authService.logout();
        }
        return false;
    }
}
