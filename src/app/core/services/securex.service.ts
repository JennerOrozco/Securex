import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SecurexService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // === USERS ===
  getUsers(): Observable<any> { return this.http.get(`${this.baseUrl}/company/users`); }
  getUsersPaginated(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/users-paginated`, { params }); }
  createUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/users`, data); }
  updateUserRole(uuid: string, roleId: number): Observable<any> { return this.http.put(`${this.baseUrl}/company/users/${uuid}/role`, { role_id: roleId }); }
  deleteUser(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/users/${uuid}`); }

  // === APPS ===
  getApps(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/apps`); }
  getApp(uuid: string): Observable<any> { return this.http.get(`${this.baseUrl}/admin/apps/${uuid}`); }
  createApp(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/apps`, data); }
  updateApp(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/apps/${uuid}`, data); }
  deleteApp(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/apps/${uuid}`); }
  broadcastAppSync(): Observable<any> { return this.http.post(`${this.baseUrl}/admin/sync-apps-broadcast`, {}); }

  // === COMPANIES ===
  getCompanies(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/companies`); }
  createCompany(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies`, data); }
  updateCompany(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/companies/${uuid}`, data); }
  deleteCompany(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/companies/${uuid}`); }

  // === BRANCHES ===
  getBranches(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/branches`); }
  createBranch(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/branches`, data); }
  updateBranch(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/branches/${uuid}`, data); }
  deleteBranch(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/branches/${uuid}`); }

  // === ROLES ===
  getRoles(): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles`); }
  getRole(uuid: string): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles/${uuid}`); }
  createRole(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/roles`, data); }
  updateRole(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/roles/${uuid}`, data); }
  deleteRole(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/roles/${uuid}`); }
  getRolePermissions(roleId: number): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles/${roleId}/permissions`); }
  syncRolePermissions(roleId: number, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/company/roles/${roleId}/permissions`, { permission_ids: permissionIds }); }

  // === PERMISSIONS ===
  getPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/company/permissions`); }
  createPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/permissions`, data); }
  updatePermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/${uuid}`, data); }
  deletePermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/permissions/${uuid}`); }

  // === ADMIN COMPANY PERMISSIONS ===
  getCompanyPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/company-permissions`); }
  assignCompanyPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/company-permissions`, data); }
  removeCompanyPermission(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/company-permissions/${id}`); }
  syncCompanyPermissions(companyId: number, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies/${companyId}/permissions`, { permission_ids: permissionIds }); }

  // === USER ACCESS ===
  getUserAccess(): Observable<any> { return this.http.get(`${this.baseUrl}/company/user-access`); }
  createUserAccess(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/user-access`, data); }
  updateUserAccess(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/user-access/${uuid}`, data); }
  deleteUserAccess(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/user-access/${uuid}`); }

  // === ADMIN USERS ===
  getAdminUsers(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/users`, { params }); }
  createAdminUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/users`, data); }
  updateAdminUser(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/users/${uuid}`, data); }
  deleteAdminUser(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/users/${uuid}`); }

  // === ADMIN USER ACCESS ===
  getAdminAccess(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/access`); }
  assignAdminAccess(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/access`, data); }
  updateAdminAccess(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/access/${uuid}`, data); }
  removeAdminAccess(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/access/${uuid}`); }

  // === ADMIN PERMISSIONS ===
  getAdminPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/permissions`); }
  createAdminPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/permissions`, data); }
  updateAdminPermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/permissions/${uuid}`, data); }
  deleteAdminPermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/permissions/${uuid}`); }

  // === AUDIT LOG (company-scoped) ===
  getAuditLogs(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/audit-log`, { params }); }

  // === SECURITY AUDIT (admin) ===
  getSecurityAudit(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/security-audit`, { params }); }

  // === WEBAUTHN ===
  getWebauthnCredentials(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/webauthn-credentials`, { params }); }
  deleteWebauthnCredential(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/webauthn-credentials/${id}`); }

  // === LOGIN ATTEMPTS ===
  getLoginAttempts(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/login-attempts`, { params }); }
  deleteLoginAttempt(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/login-attempts/${id}`); }

  // === REFRESH TOKENS ===
  getRefreshTokens(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/refresh-tokens`, { params }); }
  deleteRefreshToken(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/refresh-tokens/${id}`); }

  // === PASSWORD RESETS ===
  getPasswordResets(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/password-resets`, { params }); }
  deletePasswordReset(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/password-resets/${id}`); }

  // === USER WEBAUTHN CREDENTIALS ===
  getUserWebauthnCredentials(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/user-webauthn-credentials`, { params }); }
  deleteUserWebauthnCredential(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/user-webauthn-credentials/${id}`); }
}
