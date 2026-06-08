import { Injectable } from '@angular/core';

/**
 * Servicio de almacenamiento seguro para la aplicación.
 * Utiliza sessionStorage por defecto para datos sensibles (tokens, usuario, permisos)
 * con el objetivo de minimizar la exposición a ataques XSS y persistence.
 * sessionStorage se limpia automáticamente al cerrar la pestaña o navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly storage: Storage = sessionStorage;

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch {
      // sessionStorage puede fallar en modo privado o sin espacio
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      // Silencioso
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch {
      // Silencioso
    }
  }

  parseJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      this.removeItem(key);
      return null;
    }
  }

  setJson<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }
}
