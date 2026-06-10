import { HttpInterceptorFn, HttpResponse, HttpContextToken, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';

interface ApiResponse {
  status: string;
  data: unknown;
  message?: string;
}

// Tokens para la estrategia de Toasts
export const SHOW_TOAST = new HttpContextToken<boolean>(() => false);
export const TOAST_MESSAGE = new HttpContextToken<string>(() => '');

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body) {
        // Solo interceptar respuestas JSON (evitar problemas con blobs/binarios)
        const contentType = event.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
          return event;
        }

        const body = event.body as ApiResponse;
        
        if (body.status === 'success') {
          // Solo se muestra toast si se solicita explícitamente vía contexto
          if (req.context.get(SHOW_TOAST)) {
            let message = req.context.get(TOAST_MESSAGE) || body.message || 'Operación exitosa';
            
            if (message === 'Permissions synchronized') {
              message = 'Permisos sincronizados';
            }
            
            notificationService.success(message);
          }
          
          if (body.data !== undefined && body.data !== null) {
            return event.clone({ body: body.data });
          } else if (body.data === null) {
            return event.clone({ body });
          }
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      // 401 lo maneja authInterceptor, no mostrar toast aquí
      if (error.status === 401) {
        return throwError(() => error);
      }

      let message = 'No se pudo realizar la acción';

      if (error.status === 403) {
        message = 'El usuario no tiene permiso para esta acción';
      } else if (error.error && typeof error.error === 'object' && error.error.message) {
        message = error.error.message;
      }

      notificationService.error(message);

      return throwError(() => error);
    })
  );
};
