import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class PermissionService extends BaseApiService {
  reorderPermission(uuid: string, parentId: number | null, index: number): Observable<any> { return this.http.put(`${this.baseUrl}/company/permissions/reorder`, { uuid, parent_id: parentId, sort_order: index }); }

  getCompanyPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/company-permissions`); }
  syncCompanyPermissions(companyId: number, permissionIds: number[]): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies/${companyId}/permissions`, { permission_ids: permissionIds }); }

  getAdminPermissions(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/permissions`); }
  getPermissionsTree(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.PERMISSIONS, 'permissions');
  }

  getAdminPermissionsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.ADMIN_PERMISSIONS, 'adminPermissions');
  }

  createPermissionGql(data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.CREATE_PERMISSION, 'createPermission', this.boolify({
      name: data.name, slug: data.slug, type: data.type, icon: data.icon,
      route: data.route, parent_id: data.parent_id, sort_order: data.sort_order, is_visible: data.is_visible,
    }));
  }

  updatePermissionGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.UPDATE_PERMISSION, 'updatePermission', { uuid, ...this.boolify(data) });
  }

  deletePermissionGql(uuid: string): Observable<any> {
    return this.gqlMutate<boolean>('security', SECUREX_MUTATIONS.DELETE_PERMISSION, 'deletePermission', { uuid });
  }
}
