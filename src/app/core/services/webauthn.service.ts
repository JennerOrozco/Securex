import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WebAuthnService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private storage = inject(StorageService);
  private authService = inject(AuthService);

  getRegisterOptions(): Observable<any> {
    const token = this.storage.getAccessToken();
    if (!token) return of(null);
    return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/register-options`, {});
  }

  register(data: any): Observable<any> {
    const token = this.storage.getAccessToken();
    if (!token) return of(null);
    return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/register`, data);
  }

  getCredentials(): Observable<any> {
    const token = this.storage.getAccessToken();
    if (!token) return of(null);
    return this.http.get<any>(`${this.configService.apiUrl}/auth/webauthn/credentials`);
  }

  deleteCredential(id: any): Observable<any> {
    const token = this.storage.getAccessToken();
    if (!token) return of(null);
    return this.http.delete<any>(`${this.configService.apiUrl}/auth/webauthn/credentials/${id}`);
  }

  getLoginOptions(email?: string): Observable<any> {
    const payload: any = { app_uuid: this.configService.appUuid };
    if (email) payload.email = email;
    return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/login-options`, payload);
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/login`, {
      ...data, app_uuid: this.configService.appUuid
    }).pipe(
      tap(response => {
        const resData = response.data ?? response;
        if (resData?.access_token) this.authService['persistSession'](resData);
      }),
      tap(response => {
        const resData = response.data ?? response;
        response.success = !!resData?.access_token;
        response.requires_company_select = !!resData?.requires_company_select;
        response.companies = resData?.companies;
        response.user = resData?.user;
        response.company = resData?.company;
      })
    );
  }
}
