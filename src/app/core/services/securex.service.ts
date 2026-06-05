import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SecurexService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // === USERS ===
  getUsers(): Observable<any> { return this.http.get(`${this.baseUrl}/company/users`); }
  getUsersPaginated(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/users-paginated`, { params }); }
  createUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/users`, data); }
  updateUserRole(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/users/${uuid}/role`, data); }
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
  getCompanyBranches(): Observable<any> { return this.http.get(`${this.baseUrl}/company/branches`); }
  createBranch(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/branches`, data); }
  updateBranch(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/branches/${uuid}`, data); }
  deleteBranch(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/branches/${uuid}`); }

  // === ROLES ===
  getRoles(): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles`); }
  getRole(uuid: string): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles/${uuid}`); }
  createRole(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/roles`, data); }
  updateRole(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/roles/${uuid}`, data); }
  deleteRole(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/roles/${uuid}`); }
  getRolePermissions(roleId: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles/${roleId}/permissions`); }
  syncRolePermissions(roleId: any, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/company/roles/${roleId}/permissions`, { permission_ids: permissionIds }); }

  // === PERMISSIONS ===
  getPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/company/permissions`); }
  createPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/permissions`, data); }
  updatePermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/${uuid}`, data); }
  deletePermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/permissions/${uuid}`); }
  reorderPermission(uuid: string, parentId: number | null, index: number): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/reorder`, { uuid, parent_id: parentId, sort_order: index }); }

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

  // === USER WEBAUTHN CREDENTIALS (GraphQL) ===
  getUserWebauthnCredentials(params?: any): Observable<any> {
    return this.gql.query<{ userWebauthnCredentials: any[] }>('security', SECUREX_QUERIES.USER_WEBAUTHN_CREDENTIALS, params).pipe(
      map(d => d.userWebauthnCredentials)
    );
  }
  deleteUserWebauthnCredential(id: number): Observable<any> {
    return this.gql.query<{ deleteUserWebauthnCredential: boolean }>('security', SECUREX_MUTATIONS.DELETE_WEBAUTHN_CREDENTIAL, { id }).pipe(
      map(d => d.deleteUserWebauthnCredential)
    );
  }

  // ─── GraphQL: Nested reads ───

  getUsersWithRoles(params?: any): Observable<any[]> {
    return this.gql.query<{ users: any[] }>('security', SECUREX_QUERIES.USERS, params).pipe(map(d => d.users));
  }

  getAdminUsersGql(params?: any): Observable<any[]> {
    return this.gql.query<{ adminUsers: any[] }>('security', SECUREX_QUERIES.ADMIN_USERS, params).pipe(map(d => d.adminUsers));
  }

  getUserWithAccess(uuid: string): Observable<any> {
    return this.gql.query<{ user: any }>('security', SECUREX_QUERIES.USER, { uuid }).pipe(map(d => d.user));
  }

  getRolesWithPermissions(): Observable<any[]> {
    return this.gql.query<{ roles: any[] }>('security', SECUREX_QUERIES.ROLES).pipe(map(d => d.roles));
  }

  getRolesByCompany(appId: number, companyUuid?: string | null): Observable<any[]> {
    return this.gql.query<{ rolesByCompany: any[] }>('security', SECUREX_QUERIES.ROLES_BY_COMPANY, { appId, companyUuid }).pipe(map(d => d.rolesByCompany));
  }

  getRoleWithPermissions(uuid: string): Observable<any> {
    return this.gql.query<{ role: any }>('security', SECUREX_QUERIES.ROLE, { uuid }).pipe(map(d => d.role));
  }

  getPermissionsTree(): Observable<any[]> {
    return this.gql.query<{ permissions: any[] }>('security', SECUREX_QUERIES.PERMISSIONS).pipe(map(d => d.permissions));
  }

  getAdminPermissionsGql(): Observable<any[]> {
    return this.gql.query<{ adminPermissions: any[] }>('security', SECUREX_QUERIES.ADMIN_PERMISSIONS).pipe(map(d => d.adminPermissions));
  }

  getCompaniesWithBranches(): Observable<any[]> {
    return this.gql.query<{ companies: any[] }>('security', SECUREX_QUERIES.COMPANIES).pipe(map(d => d.companies));
  }

  getCompaniesPageData(): Observable<{ apps: any[]; companies: any[] }> {
    return this.gql.query<{ apps: any[]; companies: any[] }>('security', SECUREX_QUERIES.COMPANIES_PAGE);
  }

  getCompanyWithBranches(uuid: string): Observable<any> {
    return this.gql.query<{ company: any }>('security', SECUREX_QUERIES.COMPANY, { uuid }).pipe(map(d => d.company));
  }

  getBranchesList(): Observable<any[]> {
    return this.gql.query<{ branches: any[] }>('security', SECUREX_QUERIES.BRANCHES).pipe(map(d => d.branches));
  }

  getBranchesPageData(): Observable<{ companies: any[]; branches: any[] }> {
    return this.gql.query<{ companies: any[]; branches: any[] }>('security', SECUREX_QUERIES.BRANCHES_PAGE);
  }

  getAppsWithCompanies(): Observable<any[]> {
    return this.gql.query<{ apps: any[] }>('security', SECUREX_QUERIES.APPS).pipe(map(d => d.apps));
  }

  getUserAccessesWithRoles(params?: any): Observable<any[]> {
    return this.gql.query<{ userAccesses: any[] }>('security', SECUREX_QUERIES.USER_ACCESSES, params).pipe(map(d => d.userAccesses));
  }

  getUserAccessPageData(params?: any): Observable<{ userAccesses: any[]; users: any[]; apps: any[]; companies: any[]; branches: any[] }> {
    return this.gql.query<{ userAccesses: any[]; users: any[]; apps: any[]; companies: any[]; branches: any[] }>('security', SECUREX_QUERIES.USER_ACCESS_PAGE, params);
  }

  createUserAccessGql(data: any): Observable<any> {
    return this.gql.query<{ createUserAccess: any }>('security', SECUREX_MUTATIONS.CREATE_USER_ACCESS, data).pipe(map(d => d.createUserAccess));
  }

  updateUserAccessGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateUserAccess: any }>('security', SECUREX_MUTATIONS.UPDATE_USER_ACCESS, { uuid, ...data }).pipe(map(d => d.updateUserAccess));
  }

  deleteUserAccessGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteUserAccess: boolean }>('security', SECUREX_MUTATIONS.DELETE_USER_ACCESS, { uuid }).pipe(map(d => d.deleteUserAccess));
  }

  getSecurityAuditLogs(): Observable<any[]> {
    return this.gql.query<{ securityAuditLogs: any[] }>('security', SECUREX_QUERIES.SECURITY_AUDIT_LOGS).pipe(map(d => d.securityAuditLogs));
  }

  deleteSecurityAuditLog(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/security-audit/${uuid}`); }

  getLoginAttemptsGql(): Observable<any[]> {
    return this.gql.query<{ loginAttempts: any[] }>('security', SECUREX_QUERIES.LOGIN_ATTEMPTS).pipe(map(d => d.loginAttempts));
  }

  // ─── GraphQL Mutations ───

  createUserGql(data: any): Observable<any> {
    return this.gql.query<{ createUser: any }>('security', SECUREX_MUTATIONS.CREATE_USER, {
      full_name: data.full_name, email: data.email,
      is_super_admin: !!data.is_super_admin, auth_provider: data.auth_provider,
    }).pipe(map(d => d.createUser));
  }

  updateUserGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateUser: any }>('security', SECUREX_MUTATIONS.UPDATE_USER, { uuid, ...this.bool(data) }).pipe(map(d => d.updateUser));
  }

  deleteUserGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteUser: boolean }>('security', SECUREX_MUTATIONS.DELETE_USER, { uuid }).pipe(map(d => d.deleteUser));
  }

  createRoleGql(data: any): Observable<any> {
    return this.gql.query<{ createRole: any }>('security', SECUREX_MUTATIONS.CREATE_ROLE, {
      name: data.name, slug: data.slug, description: data.description, is_active: !!data.is_active,
    }).pipe(map(d => d.createRole));
  }

  updateRoleGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateRole: any }>('security', SECUREX_MUTATIONS.UPDATE_ROLE, { uuid, ...this.bool(data) }).pipe(map(d => d.updateRole));
  }

  deleteRoleGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteRole: boolean }>('security', SECUREX_MUTATIONS.DELETE_ROLE, { uuid }).pipe(map(d => d.deleteRole));
  }

  syncRolePermissionsGql(uuid: string, permissionIds: number[]): Observable<any> {
    return this.gql.query<{ syncRolePermissions: any }>('security', SECUREX_MUTATIONS.SYNC_ROLE_PERMISSIONS, { uuid, permissionIds }).pipe(map(d => d.syncRolePermissions));
  }

  createPermissionGql(data: any): Observable<any> {
    return this.gql.query<{ createPermission: any }>('security', SECUREX_MUTATIONS.CREATE_PERMISSION, this.bool({
      name: data.name, slug: data.slug, type: data.type, icon: data.icon,
      route: data.route, parent_id: data.parent_id, sort_order: data.sort_order, is_visible: data.is_visible,
    })).pipe(map(d => d.createPermission));
  }

  updatePermissionGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updatePermission: any }>('security', SECUREX_MUTATIONS.UPDATE_PERMISSION, { uuid, ...this.bool(data) }).pipe(map(d => d.updatePermission));
  }

  deletePermissionGql(uuid: string): Observable<any> {
    return this.gql.query<{ deletePermission: boolean }>('security', SECUREX_MUTATIONS.DELETE_PERMISSION, { uuid }).pipe(map(d => d.deletePermission));
  }

  createCompanyGql(data: any): Observable<any> {
    return this.gql.query<{ createCompany: any }>('security', SECUREX_MUTATIONS.CREATE_COMPANY, {
      name: data.name, tax_id: data.tax_id, logo_url: data.logo_url, is_active: !!data.is_active,
    }).pipe(map(d => d.createCompany));
  }

  updateCompanyGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateCompany: any }>('security', SECUREX_MUTATIONS.UPDATE_COMPANY, { uuid, ...this.bool(data) }).pipe(map(d => d.updateCompany));
  }

  deleteCompanyGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteCompany: boolean }>('security', SECUREX_MUTATIONS.DELETE_COMPANY, { uuid }).pipe(map(d => d.deleteCompany));
  }

  createBranchGql(data: any): Observable<any> {
    return this.gql.query<{ createBranch: any }>('security', SECUREX_MUTATIONS.CREATE_BRANCH, {
      name: data.name, company_id: data.company_id, address: data.address, phone: data.phone, is_active: !!data.is_active,
    }).pipe(map(d => d.createBranch));
  }

  updateBranchGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateBranch: any }>('security', SECUREX_MUTATIONS.UPDATE_BRANCH, { uuid, ...this.bool(data) }).pipe(map(d => d.updateBranch));
  }

  deleteBranchGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteBranch: boolean }>('security', SECUREX_MUTATIONS.DELETE_BRANCH, { uuid }).pipe(map(d => d.deleteBranch));
  }

  createAppGql(data: any): Observable<any> {
    return this.gql.query<{ createApp: any }>('security', SECUREX_MUTATIONS.CREATE_APP, {
      name: data.name, slug: data.slug, is_active: !!data.is_active,
    }).pipe(map(d => d.createApp));
  }

  updateAppGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateApp: any }>('security', SECUREX_MUTATIONS.UPDATE_APP, { uuid, ...this.bool(data) }).pipe(map(d => d.updateApp));
  }

  deleteAppGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteApp: boolean }>('security', SECUREX_MUTATIONS.DELETE_APP, { uuid }).pipe(map(d => d.deleteApp));
  }

  getPasswordResetsGql(): Observable<any[]> {
    return this.gql.query<{ passwordResets: any[] }>('security', SECUREX_QUERIES.PASSWORD_RESETS).pipe(map(d => d.passwordResets));
  }

  getRefreshTokensGql(): Observable<any[]> {
    return this.gql.query<{ refreshTokens: any[] }>('security', SECUREX_QUERIES.REFRESH_TOKENS).pipe(map(d => d.refreshTokens));
  }

  private bool(data: any): any {
    const out: any = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (key === 'is_active' || key === 'is_visible' || key === 'is_super_admin') {
        out[key] = !!val;
      } else {
        out[key] = val;
      }
    }
    return out;
  }
}
