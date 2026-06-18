import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseApiService {
  getRolePermissionsGql(uuid: string): Observable<any> {
    return this.gqlQuerySingle<any>('security', SECUREX_QUERIES.ROLE_PERMISSIONS, 'rolePermissions', { uuid });
  }

  getRolesWithPermissions(companyUuid?: string | null): Observable<any[]> {
    return this.gqlQuerySingle<any>('security', SECUREX_QUERIES.ROLES, 'roles', { companyUuid }).pipe(
      map(res => res?.data ?? [])
    );
  }

  getRolesByCompany(appId: number, companyUuid?: string | null): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.ROLES_BY_COMPANY, 'rolesByCompany', { appId, companyUuid });
  }

  getRoleWithPermissions(uuid: string): Observable<any> {
    return this.gqlQuerySingle<any>('security', SECUREX_QUERIES.ROLE, 'role', { uuid });
  }

  createRoleGql(data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.CREATE_ROLE, 'createRole', {
      name: data.name, slug: data.slug, description: data.description, is_active: !!data.is_active,
    });
  }

  updateRoleGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.UPDATE_ROLE, 'updateRole', { uuid, ...this.boolify(data) });
  }

  deleteRoleGql(uuid: string): Observable<any> {
    return this.gqlMutate<boolean>('security', SECUREX_MUTATIONS.DELETE_ROLE, 'deleteRole', { uuid });
  }

  syncRolePermissionsGql(uuid: string, permissionIds: number[]): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.SYNC_ROLE_PERMISSIONS, 'syncRolePermissions', { uuid, permissionIds });
  }
}
