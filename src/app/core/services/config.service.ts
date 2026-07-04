import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timer } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';

export interface AppConfig {
  apiUrl: string;
  apiMailUrl: string;
  apiAdminTowerUrl: string;
  appUuid: string;
  googleClientId: string;
  vapidPublicKey: string;
  notificationApiUrl: string;
  financeApiUrl: string;
  crmApiUrl: string;
  reportApiUrl: string;
}

const FALLBACK_CONFIG: AppConfig = {
  apiUrl: 'https://secureapi.jennerorozcoa.dev/v1',
  apiMailUrl: 'https://secureapi.jennerorozcoa.dev/v1',
  apiAdminTowerUrl: 'https://secureapi.jennerorozcoa.dev/v1',
  appUuid: 'securex-app',
  googleClientId: '',
  vapidPublicKey: '',
  notificationApiUrl: 'https://notificationapi.jennerorozcoa.dev/v1',
  financeApiUrl: 'https://financial.jennerorozcoa.dev/v1',
  crmApiUrl: 'https://crm.jennerorozcoa.dev/v1',
  reportApiUrl: 'https://reportapi.jennerorozcoa.dev/v1'
};

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;
  private http = inject(HttpClient);

  loadConfig(): Promise<AppConfig> {
    return firstValueFrom(
      this.http.get<AppConfig>('assets/config.json').pipe(
        timeout(5000),
        retry({ count: 3, delay: 1000 }),
        tap(config => this.config = config),
        catchError((err) => {
          console.warn('[ConfigService] No se pudo cargar config.json, usando fallback.', err?.message);
          this.config = FALLBACK_CONFIG;
          return [FALLBACK_CONFIG];
        })
      )
    );
  }

  get apiUrl(): string { return this.config?.apiUrl || FALLBACK_CONFIG.apiUrl; }
  get apiMailUrl(): string { return this.config?.apiMailUrl || FALLBACK_CONFIG.apiMailUrl; }
  get apiAdminTowerUrl(): string { return this.config?.apiAdminTowerUrl || FALLBACK_CONFIG.apiAdminTowerUrl; }
  get appUuid(): string { return this.config?.appUuid || FALLBACK_CONFIG.appUuid; }
  get googleClientId(): string { return this.config?.googleClientId || FALLBACK_CONFIG.googleClientId; }
  get vapidPublicKey(): string { return this.config?.vapidPublicKey || FALLBACK_CONFIG.vapidPublicKey; }
  get notificationApiUrl(): string { return this.config?.notificationApiUrl || FALLBACK_CONFIG.notificationApiUrl; }
  get financeApiUrl(): string { return this.config?.financeApiUrl || FALLBACK_CONFIG.financeApiUrl; }
  get crmApiUrl(): string { return this.config?.crmApiUrl || FALLBACK_CONFIG.crmApiUrl; }
  get reportApiUrl(): string { return this.config?.reportApiUrl || FALLBACK_CONFIG.reportApiUrl; }
}
