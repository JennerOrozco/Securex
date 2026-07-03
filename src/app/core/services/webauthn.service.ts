import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { base64ToBuffer, bufferToBase64, extractBase64 } from '../../shared/utils/webauthn-utils';
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

  registerDevice(): Observable<any> {
    return this.getRegisterOptions().pipe(
      switchMap((response: any) => {
        const data = response?.data ?? response;
        const options = data?.options;
        const pubKeyOptions = options?.publicKey || options;

        if (!pubKeyOptions || !pubKeyOptions.challenge) {
          throw new Error('El backend no incluyó el challenge en las opciones.');
        }

        if (!pubKeyOptions.rp?.id) {
          pubKeyOptions.rp = pubKeyOptions.rp || {};
          pubKeyOptions.rp.id = window.location.hostname;
        }

        const base64Challenge = extractBase64(pubKeyOptions.challenge);
        pubKeyOptions.challenge = base64ToBuffer(base64Challenge);

        if (pubKeyOptions.user && typeof pubKeyOptions.user.id === 'string') {
          pubKeyOptions.user.id = base64ToBuffer(extractBase64(pubKeyOptions.user.id));
        }

        if (pubKeyOptions.excludeCredentials) {
          pubKeyOptions.excludeCredentials = pubKeyOptions.excludeCredentials.map((cred: any) => {
            cred.id = base64ToBuffer(extractBase64(cred.id));
            return cred;
          });
        }

        return from(navigator.credentials.create({ publicKey: pubKeyOptions })).pipe(
          map((credential: Credential | null) => {
            if (!credential) {
              throw new Error('No se pudo crear la credencial.');
            }
            const pubKeyCred = credential as PublicKeyCredential;
            const responseObj = pubKeyCred.response as AuthenticatorAttestationResponse;

            return {
              clientDataJSON: bufferToBase64(responseObj.clientDataJSON),
              attestationObject: bufferToBase64(responseObj.attestationObject),
              challenge: base64Challenge,
              device_name: navigator.userAgent
            };
          })
        );
      }),
      switchMap(registrationData => this.register(registrationData))
    );
  }
}
