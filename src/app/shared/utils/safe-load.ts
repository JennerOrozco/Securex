import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function safeLoad<T>(obs$: Observable<T[]>, fallback: T[] = []): Observable<T[]> {
  return obs$.pipe(catchError(() => of(fallback)));
}

export function safeLoadValue<T>(obs$: Observable<T>, fallback: T | null = null): Observable<T | null> {
  return obs$.pipe(catchError(() => of(fallback)));
}
