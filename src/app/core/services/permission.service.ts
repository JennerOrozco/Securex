import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class PermissionService extends BaseApiService {
  getPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/company/permissions`); }
  createPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/permissions`, data); }
  updatePermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/${uuid}`, data); }
  deletePermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/permissions/${uuid}`); }
  reorderPermission(uuid: string, parentId: number | null, index: number): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/reorder`, { uuid, parent_id: parentId, sort_order: index }); }

  getCompanyPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/company-permissions`); }
  assignCompanyPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/company-permissions`, data); }
  removeCompanyPermission(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/company-permissions/${id}`); }
  syncCompanyPermissions(companyId: number, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies/${companyId}/permissions`, { permission_ids: permissionIds }); }

  getAdminPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/permissions`); }
  createAdminPermission(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/permissions`, data); }
  updateAdminPermission(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/permissions/${uuid}`, data); }
  deleteAdminPermission(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/permissions/${uuid}`); }

  getPermissionsTree(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.PERMISSIONS, 'permissions');
  }

  getAdminPermissionsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.ADMIN_PERMISSIONS, 'adminPermissions');
  }

  createPermissionGql(data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.CREATE_PERMISSION, 'createPermission', this.boolify({
      name: data.name, slug: data.slug, type: data.type, icon: data.icon,
      route: data.route, parent_id: data.parent_id, sort_order: data.sort_order, is_visible: data.is_visible,
    }));
  }

  updatePermissionGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.UPDATE_PERMISSION, 'updatePermission', { uuid, ...this.boolify(data) });
  }

  deletePermissionGql(uuid: string): Observable<any> {
    return this.gqlMutation<boolean>('security', SECUREX_MUTATIONS.DELETE_PERMISSION, 'deletePermission', { uuid });
  }
}
