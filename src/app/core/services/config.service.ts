import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  private http = inject(HttpClient);

  loadConfig(): Promise<any> {
    return firstValueFrom(
      this.http.get('assets/config.json').pipe(
        tap(config => this.config = config)
      )
    );
  }

  get apiUrl(): string {
    return this.config?.apiUrl || '';
  }

  get apiMailUrl(): string {
    return this.config?.apiMailUrl || '';
  }

  get apiAdminTowerUrl(): string {
    return this.config?.apiAdminTowerUrl || '';
  }

  get appUuid(): string {
    return this.config?.appUuid || '';
  }

  get googleClientId(): string {
    return this.config?.googleClientId || '';
  }

  get vapidPublicKey(): string {
    return this.config?.vapidPublicKey || '';
  }

  get notificationApiUrl(): string {
    return this.config?.notificationApiUrl || '';
  }

  get financeApiUrl(): string {
    return this.config?.financeApiUrl || '';
  }

  get crmApiUrl(): string {
    return this.config?.crmApiUrl || '';
  }

  get reportApiUrl(): string {
    return this.config?.reportApiUrl || '';
  }
}


