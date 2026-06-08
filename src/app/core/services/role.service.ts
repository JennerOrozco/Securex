import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // REST
  getRoles(): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles`); }
  getRole(uuid: string): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles/${uuid}`); }
  createRole(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/roles`, data); }
  updateRole(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/roles/${uuid}`, data); }
  deleteRole(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/roles/${uuid}`); }
  getRolePermissions(roleId: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/roles/${roleId}/permissions`); }
  syncRolePermissions(roleId: any, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/company/roles/${roleId}/permissions`, { permission_ids: permissionIds }); }

  // GraphQL
  getRolesWithPermissions(): Observable<any[]> {
    return this.gql.query<{ roles: any[] }>('security', SECUREX_QUERIES.ROLES).pipe(map(d => d.roles));
  }

  getRolesByCompany(appId: number, companyUuid?: string | null): Observable<any[]> {
    return this.gql.query<{ rolesByCompany: any[] }>('security', SECUREX_QUERIES.ROLES_BY_COMPANY, { appId, companyUuid }).pipe(map(d => d.rolesByCompany));
  }

  getRoleWithPermissions(uuid: string): Observable<any> {
    return this.gql.query<{ role: any }>('security', SECUREX_QUERIES.ROLE, { uuid }).pipe(map(d => d.role));
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
