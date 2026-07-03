import { DestroyRef, ChangeDetectorRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction, pipe, throwError } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';
import { LoggerService } from '@core/services/logger.service';

// --- Interfaces existentes ---
export interface NotificationProvider {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

interface ApiOperatorOptions {
  destroyRef: DestroyRef;
  cdr?: ChangeDetectorRef;
  onStateChange: (isLoading: boolean) => void;
  notificationService?: NotificationProvider;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Operador de RxJS original (Intacto)
 */
export function handleApiState<T>(options: ApiOperatorOptions): MonoTypeOperatorFunction<T> {
  return pipe(
    // 1. Asegurar limpieza automática antes de cualquier otra lógica
    takeUntilDestroyed(options.destroyRef),

    // 2. Encender indicador de carga inmediatamente al suscribirse
    tap({
      subscribe: () => {
        options.onStateChange(true);
        options.cdr?.markForCheck();
      }
    }),

    // 3. Notificación de éxito: Solo se ejecuta si el flujo emite un valor (next)
    tap({
      next: () => {
        if (options.successMessage && options.notificationService) {
          options.notificationService.success(options.successMessage);
        }
      }
    }),

    // 4. Manejo de errores: Intercepta el error, notifica y propaga para que el componente también pueda reaccionar
    catchError((error) => {
      if (options.notificationService) {
        options.notificationService.error(
          options.errorMessage || error?.message || 'Ocurrió un error inesperado'
        );
      }
      return throwError(() => error);
    }),

    // 5. Finalización: Garantiza el apagado del loader independientemente del resultado
    finalize(() => {
      options.onStateChange(false);
      options.cdr?.markForCheck();
    })
  );
}

/**
 * Nueva función: Wrapper que simplifica la inyección de dependencias
 */
export function trackApi<T>(
  component: any,
  onStateChange: (loading: boolean) => void,
  successMessage?: string
): MonoTypeOperatorFunction<T> {
  return handleApiState({
    destroyRef: component.destroyRef,
    cdr: component.cdr,
    notificationService: component.notificationService,
    onStateChange,
    successMessage
  });
}

/**
 * Nueva función: Wrapper para Signals (Ideal para migración de componentes)
 */
export function trackSignal<T>(
  component: any,
  loadingSignal: WritableSignal<boolean>,
  successMessage?: string
): MonoTypeOperatorFunction<T> {
  return trackApi(component, (v) => loadingSignal.set(v), successMessage);
}

export function catchAndLog<T>(
  logger: LoggerService,
  context: string,
  notificationService?: NotificationProvider
): MonoTypeOperatorFunction<T> {
  return catchError((error) => {
    logger.error(`Error en ${context}`, error, context);
    if (notificationService) {
      const message = error?.message || error?.error?.message || `Error en ${context}`;
      notificationService.error(message);
    }
    return throwError(() => error);
  });
}

export function tryCatchSync<T>(
  fn: () => T,
  logger: LoggerService,
  context: string,
  fallback: T
): T {
  try {
    return fn();
  } catch (error) {
    logger.error(`Error en ${context}`, error, context);
    return fallback;
  }
}