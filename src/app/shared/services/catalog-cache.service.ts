import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root' // Singleton para toda la aplicación
})
export class CatalogCacheService {
    private cache = new Map<string, Observable<any>>();

    /**
     * Obtiene un catálogo del caché o ejecuta la función de petición si no existe.
     * @param key Identificador único del catálogo (ej. 'countries', 'roles')
     * @param fetchFn Función que retorna el Observable de la petición HTTP
     */
    getCatalog(key: string, fetchFn: () => Observable<any>): Observable<any> {
        if (!this.cache.has(key)) {
            // shareReplay(1) guarda el último valor emitido y lo repite para futuros suscriptores
            this.cache.set(key, fetchFn().pipe(shareReplay(1)));
        }
        return this.cache.get(key)!;
    }

    /**
     * Limpia un catálogo específico o todo el caché (útil cuando el usuario cierra sesión)
     */
    clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}