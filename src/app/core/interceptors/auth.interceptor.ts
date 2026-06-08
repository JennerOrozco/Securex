import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/** Regex precisas para endpoints públicos de autenticación */
const PUBLIC_ENDPOINT_PATTERNS = [
    /\/auth\/login/,
    /\/auth\/register/,
    /\/auth\/forgot-password/,
    /\/auth\/reset-password/,
    /\/auth\/refresh/,
    /\/auth\/google-login/,
    /\/auth\/webauthn\/login-options/,
    /\/auth\/webauthn\/login/
];

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const notificationService = inject(NotificationService);
    // Lee el token de localStorage, consistente con donde auth.service.ts lo guarda
    const token = localStorage.getItem('accessToken');

    const isPublicEndpoint = PUBLIC_ENDPOINT_PATTERNS.some(pattern => pattern.test(req.url));

    let authReq = req;
    if (token && !isPublicEndpoint) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !isPublicEndpoint) {
                return handle401Error(authReq, next, authService, notificationService);
            }
            return throwError(() => error);
        })
    );
};

let sessionExpiredToastShown = false;

const handle401Error = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
    authService: AuthService,
    notificationService: NotificationService
): Observable<HttpEvent<unknown>> => {
    return authService.refreshToken().pipe(
        switchMap(newToken => {
            if (!newToken) {
                return throwError(() => new Error('Session expired'));
            }
            sessionExpiredToastShown = false;
            return next(req.clone({
                setHeaders: {
                    Authorization: `Bearer ${newToken}`
                }
            }));
        }),
        catchError(err => {
            if (!sessionExpiredToastShown) {
                sessionExpiredToastShown = true;
                notificationService.showError('Sesión expirada. Inicia sesión nuevamente.');
                authService.logout();
            }
            return throwError(() => err);
        })
    );
};
