import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // REST: Company audit log
  getAuditLogs(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/audit-log`, { params }); }

  // REST: Admin security audit
  getSecurityAudit(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/security-audit`, { params }); }
  deleteSecurityAuditLog(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/security-audit/${uuid}`); }

  // REST: Login attempts
  getLoginAttempts(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/login-attempts`, { params }); }
  deleteLoginAttempt(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/login-attempts/${id}`); }

  // REST: Refresh tokens
  getRefreshTokens(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/refresh-tokens`, { params }); }
  deleteRefreshToken(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/refresh-tokens/${id}`); }

  // REST: Password resets
  getPasswordResets(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/password-resets`, { params }); }
  deletePasswordReset(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/password-resets/${id}`); }

  // GraphQL
  getSecurityAuditLogs(): Observable<any[]> {
    return this.gql.query<{ securityAuditLogs: any[] }>('security', SECUREX_QUERIES.SECURITY_AUDIT_LOGS).pipe(map(d => d.securityAuditLogs));
  }

  getLoginAttemptsGql(): Observable<any[]> {
    return this.gql.query<{ loginAttempts: any[] }>('security', SECUREX_QUERIES.LOGIN_ATTEMPTS).pipe(map(d => d.loginAttempts));
  }

  getPasswordResetsGql(): Observable<any[]> {
    return this.gql.query<{ passwordResets: any[] }>('security', SECUREX_QUERIES.PASSWORD_RESETS).pipe(map(d => d.passwordResets));
  }

  getRefreshTokensGql(): Observable<any[]> {
    return this.gql.query<{ refreshTokens: any[] }>('security', SECUREX_QUERIES.REFRESH_TOKENS).pipe(map(d => d.refreshTokens));
  }
}
