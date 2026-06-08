import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { CompanyService } from './company.service';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { AuditService } from './audit.service';

/**
 * @deprecated SecurexService está siendo refactorizado en servicios por dominio.
 * Usa directamente: AppService, CompanyService, UserService, RoleService, PermissionService, AuditService.
 */
@Injectable({ providedIn: 'root' })
export class SecurexService {
  private appService = inject(AppService);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private auditService = inject(AuditService);

  // === USERS ===
  getUsers(): Observable<any> { return this.userService.getUsers(); }
  getUsersPaginated(params?: any): Observable<any> { return this.userService.getUsersPaginated(params); }
  createUser(data: any): Observable<any> { return this.userService.createUser(data); }
  updateUserRole(uuid: string, data: any): Observable<any> { return this.userService.updateUserRole(uuid, data); }
  deleteUser(uuid: string): Observable<any> { return this.userService.deleteUser(uuid); }

  // === APPS ===
  getApps(): Observable<any> { return this.appService.getApps(); }
  getApp(uuid: string): Observable<any> { return this.appService.getApp(uuid); }
  createApp(data: any): Observable<any> { return this.appService.createApp(data); }
  updateApp(uuid: string, data: any): Observable<any> { return this.appService.updateApp(uuid, data); }
  deleteApp(uuid: string): Observable<any> { return this.appService.deleteApp(uuid); }
  broadcastAppSync(): Observable<any> { return this.appService.broadcastAppSync(); }

  // === COMPANIES ===
  getCompanies(): Observable<any> { return this.companyService.getCompanies(); }
  createCompany(data: any): Observable<any> { return this.companyService.createCompany(data); }
  updateCompany(uuid: string, data: any): Observable<any> { return this.companyService.updateCompany(uuid, data); }
  deleteCompany(uuid: string): Observable<any> { return this.companyService.deleteCompany(uuid); }

  // === BRANCHES ===
  getBranches(): Observable<any> { return this.companyService.getBranches(); }
  getCompanyBranches(): Observable<any> { return this.companyService.getCompanyBranches(); }
  createBranch(data: any): Observable<any> { return this.companyService.createBranch(data); }
  updateBranch(uuid: string, data: any): Observable<any> { return this.companyService.updateBranch(uuid, data); }
  deleteBranch(uuid: string): Observable<any> { return this.companyService.deleteBranch(uuid); }

  // === ROLES ===
  getRoles(): Observable<any> { return this.roleService.getRoles(); }
  getRole(uuid: string): Observable<any> { return this.roleService.getRole(uuid); }
  createRole(data: any): Observable<any> { return this.roleService.createRole(data); }
  updateRole(uuid: string, data: any): Observable<any> { return this.roleService.updateRole(uuid, data); }
  deleteRole(uuid: string): Observable<any> { return this.roleService.deleteRole(uuid); }
  getRolePermissions(roleId: any): Observable<any> { return this.roleService.getRolePermissions(roleId); }
  syncRolePermissions(roleId: any, permissionIds: number[]): Observable<any> { return this.roleService.syncRolePermissions(roleId, permissionIds); }

  // === PERMISSIONS ===
  getPermissions(): Observable<any> { return this.permissionService.getPermissions(); }
  createPermission(data: any): Observable<any> { return this.permissionService.createPermission(data); }
  updatePermission(uuid: string, data: any): Observable<any> { return this.permissionService.updatePermission(uuid, data); }
  deletePermission(uuid: string): Observable<any> { return this.permissionService.deletePermission(uuid); }
  reorderPermission(uuid: string, parentId: number | null, index: number): Observable<any> { return this.permissionService.reorderPermission(uuid, parentId, index); }

  // === ADMIN COMPANY PERMISSIONS ===
  getCompanyPermissions(): Observable<any> { return this.permissionService.getCompanyPermissions(); }
  assignCompanyPermission(data: any): Observable<any> { return this.permissionService.assignCompanyPermission(data); }
  removeCompanyPermission(id: number): Observable<any> { return this.permissionService.removeCompanyPermission(id); }
  syncCompanyPermissions(companyId: number, permissionIds: number[]): Observable<any> { return this.permissionService.syncCompanyPermissions(companyId, permissionIds); }

  // === USER ACCESS ===
  getUserAccess(): Observable<any> { return this.userService.getUserAccess(); }
  createUserAccess(data: any): Observable<any> { return this.userService.createUserAccess(data); }
  updateUserAccess(uuid: string, data: any): Observable<any> { return this.userService.updateUserAccess(uuid, data); }
  deleteUserAccess(uuid: string): Observable<any> { return this.userService.deleteUserAccess(uuid); }

  // === ADMIN USERS ===
  getAdminUsers(params?: any): Observable<any> { return this.userService.getAdminUsers(params); }
  createAdminUser(data: any): Observable<any> { return this.userService.createAdminUser(data); }
  updateAdminUser(uuid: string, data: any): Observable<any> { return this.userService.updateAdminUser(uuid, data); }
  deleteAdminUser(uuid: string): Observable<any> { return this.userService.deleteAdminUser(uuid); }

  // === ADMIN USER ACCESS ===
  getAdminAccess(): Observable<any> { return this.userService.getAdminAccess(); }
  assignAdminAccess(data: any): Observable<any> { return this.userService.assignAdminAccess(data); }
  updateAdminAccess(uuid: string, data: any): Observable<any> { return this.userService.updateAdminAccess(uuid, data); }
  removeAdminAccess(uuid: string): Observable<any> { return this.userService.removeAdminAccess(uuid); }

  // === ADMIN PERMISSIONS ===
  getAdminPermissions(): Observable<any> { return this.permissionService.getAdminPermissions(); }
  createAdminPermission(data: any): Observable<any> { return this.permissionService.createAdminPermission(data); }
  updateAdminPermission(uuid: string, data: any): Observable<any> { return this.permissionService.updateAdminPermission(uuid, data); }
  deleteAdminPermission(uuid: string): Observable<any> { return this.permissionService.deleteAdminPermission(uuid); }

  // === AUDIT LOG ===
  getAuditLogs(params?: any): Observable<any> { return this.auditService.getAuditLogs(params); }

  // === SECURITY AUDIT ===
  getSecurityAudit(params?: any): Observable<any> { return this.auditService.getSecurityAudit(params); }

  // === WEBAUTHN ===
  getWebauthnCredentials(params?: any): Observable<any> { return this.userService.getWebauthnCredentials(params); }
  deleteWebauthnCredential(id: number): Observable<any> { return this.userService.deleteWebauthnCredential(id); }

  // === LOGIN ATTEMPTS ===
  getLoginAttempts(params?: any): Observable<any> { return this.auditService.getLoginAttempts(params); }
  deleteLoginAttempt(id: number): Observable<any> { return this.auditService.deleteLoginAttempt(id); }

  // === REFRESH TOKENS ===
  getRefreshTokens(params?: any): Observable<any> { return this.auditService.getRefreshTokens(params); }
  deleteRefreshToken(id: number): Observable<any> { return this.auditService.deleteRefreshToken(id); }

  // === PASSWORD RESETS ===
  getPasswordResets(params?: any): Observable<any> { return this.auditService.getPasswordResets(params); }
  deletePasswordReset(id: number): Observable<any> { return this.auditService.deletePasswordReset(id); }

  // === USER WEBAUTHN CREDENTIALS (GraphQL) ===
  getUserWebauthnCredentials(params?: any): Observable<any> { return this.userService.getUserWebauthnCredentials(params); }

  // ─── GraphQL: Nested reads ───
  getUsersWithRoles(params?: any): Observable<any[]> { return this.userService.getUsersWithRoles(params); }
  getAdminUsersGql(params?: any): Observable<any[]> { return this.userService.getAdminUsersGql(params); }
  getUserWithAccess(uuid: string): Observable<any> { return this.userService.getUserWithAccess(uuid); }
  getRolesWithPermissions(): Observable<any[]> { return this.roleService.getRolesWithPermissions(); }
  getRolesByCompany(appId: number, companyUuid?: string | null): Observable<any[]> { return this.roleService.getRolesByCompany(appId, companyUuid); }
  getRoleWithPermissions(uuid: string): Observable<any> { return this.roleService.getRoleWithPermissions(uuid); }
  getPermissionsTree(): Observable<any[]> { return this.permissionService.getPermissionsTree(); }
  getAdminPermissionsGql(): Observable<any[]> { return this.permissionService.getAdminPermissionsGql(); }
  getCompaniesWithBranches(): Observable<any[]> { return this.companyService.getCompaniesWithBranches(); }
  getCompaniesPageData(): Observable<{ apps: any[]; companies: any[] }> { return this.companyService.getCompaniesPageData(); }
  getCompanyWithBranches(uuid: string): Observable<any> { return this.companyService.getCompanyWithBranches(uuid); }
  getBranchesList(): Observable<any[]> { return this.companyService.getBranchesList(); }
  getBranchesPageData(): Observable<{ companies: any[]; branches: any[] }> { return this.companyService.getBranchesPageData(); }
  getAppsWithCompanies(): Observable<any[]> { return this.appService.getAppsWithCompanies(); }
  getUserAccessesWithRoles(params?: any): Observable<any[]> { return this.userService.getUserAccessesWithRoles(params); }
  getUserAccessPageData(params?: any): Observable<any> { return this.userService.getUserAccessPageData(params); }
  getSecurityAuditLogs(): Observable<any[]> { return this.auditService.getSecurityAuditLogs(); }
  deleteSecurityAuditLog(uuid: string): Observable<any> { return this.auditService.deleteSecurityAuditLog(uuid); }
  getLoginAttemptsGql(): Observable<any[]> { return this.auditService.getLoginAttemptsGql(); }
  getPasswordResetsGql(): Observable<any[]> { return this.auditService.getPasswordResetsGql(); }
  getRefreshTokensGql(): Observable<any[]> { return this.auditService.getRefreshTokensGql(); }

  // ─── GraphQL Mutations ───
  createUserAccessGql(data: any): Observable<any> { return this.userService.createUserAccessGql(data); }
  updateUserAccessGql(uuid: string, data: any): Observable<any> { return this.userService.updateUserAccessGql(uuid, data); }
  deleteUserAccessGql(uuid: string): Observable<any> { return this.userService.deleteUserAccessGql(uuid); }
  createUserGql(data: any): Observable<any> { return this.userService.createUserGql(data); }
  updateUserGql(uuid: string, data: any): Observable<any> { return this.userService.updateUserGql(uuid, data); }
  deleteUserGql(uuid: string): Observable<any> { return this.userService.deleteUserGql(uuid); }
  createRoleGql(data: any): Observable<any> { return this.roleService.createRoleGql(data); }
  updateRoleGql(uuid: string, data: any): Observable<any> { return this.roleService.updateRoleGql(uuid, data); }
  deleteRoleGql(uuid: string): Observable<any> { return this.roleService.deleteRoleGql(uuid); }
  syncRolePermissionsGql(uuid: string, permissionIds: number[]): Observable<any> { return this.roleService.syncRolePermissionsGql(uuid, permissionIds); }
  createPermissionGql(data: any): Observable<any> { return this.permissionService.createPermissionGql(data); }
  updatePermissionGql(uuid: string, data: any): Observable<any> { return this.permissionService.updatePermissionGql(uuid, data); }
  deletePermissionGql(uuid: string): Observable<any> { return this.permissionService.deletePermissionGql(uuid); }
  createCompanyGql(data: any): Observable<any> { return this.companyService.createCompanyGql(data); }
  updateCompanyGql(uuid: string, data: any): Observable<any> { return this.companyService.updateCompanyGql(uuid, data); }
  deleteCompanyGql(uuid: string): Observable<any> { return this.companyService.deleteCompanyGql(uuid); }
  createBranchGql(data: any): Observable<any> { return this.companyService.createBranchGql(data); }
  updateBranchGql(uuid: string, data: any): Observable<any> { return this.companyService.updateBranchGql(uuid, data); }
  deleteBranchGql(uuid: string): Observable<any> { return this.companyService.deleteBranchGql(uuid); }
  createAppGql(data: any): Observable<any> { return this.appService.createAppGql(data); }
  updateAppGql(uuid: string, data: any): Observable<any> { return this.appService.updateAppGql(uuid, data); }
  deleteAppGql(uuid: string): Observable<any> { return this.appService.deleteAppGql(uuid); }
  deleteUserWebauthnCredential(id: number): Observable<any> { return this.userService.deleteUserWebauthnCredential(id); }
}
