import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // REST: Company permissions
  getPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/company/permissions`); }
  createPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/permissions`, data); }
  updatePermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/${uuid}`, data); }
  deletePermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/permissions/${uuid}`); }
  reorderPermission(uuid: string, parentId: number | null, index: number): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/reorder`, { uuid, parent_id: parentId, sort_order: index }); }

  // REST: Admin company permissions
  getCompanyPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/company-permissions`); }
  assignCompanyPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/company-permissions`, data); }
  removeCompanyPermission(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/company-permissions/${id}`); }
  syncCompanyPermissions(companyId: number, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies/${companyId}/permissions`, { permission_ids: permissionIds }); }

  // REST: Admin permissions
  getAdminPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/permissions`); }
  createAdminPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/permissions`, data); }
  updateAdminPermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/permissions/${uuid}`, data); }
  deleteAdminPermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/permissions/${uuid}`); }

  // GraphQL
  getPermissionsTree(): Observable<any[]> {
    return this.gql.query<{ permissions: any[] }>('security', SECUREX_QUERIES.PERMISSIONS).pipe(map(d => d.permissions));
  }

  getAdminPermissionsGql(): Observable<any[]> {
    return this.gql.query<{ adminPermissions: any[] }>('security', SECUREX_QUERIES.ADMIN_PERMISSIONS).pipe(map(d => d.adminPermissions));
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
