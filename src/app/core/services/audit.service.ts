import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class AuditService extends BaseApiService {
  getAuditLogs(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/audit-log`, { params }); }

  getSecurityAudit(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/security-audit`, { params }); }
  deleteSecurityAuditLog(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/security-audit/${uuid}`); }

  getLoginAttempts(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/login-attempts`, { params }); }
  deleteLoginAttempt(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/login-attempts/${id}`); }

  getRefreshTokens(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/refresh-tokens`, { params }); }
  deleteRefreshToken(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/refresh-tokens/${id}`); }

  getPasswordResets(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/password-resets`, { params }); }
  deletePasswordReset(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/password-resets/${id}`); }

  getSecurityAuditLogs(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.SECURITY_AUDIT_LOGS, 'securityAuditLogs');
  }

  getLoginAttemptsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.LOGIN_ATTEMPTS, 'loginAttempts');
  }

  getPasswordResetsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.PASSWORD_RESETS, 'passwordResets');
  }

  getRefreshTokensGql(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.REFRESH_TOKENS, 'refreshTokens');
  }
}
