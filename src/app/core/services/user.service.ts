import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  getUsers(): Observable<any> { return this.http.get(`${this.baseUrl}/company/users`); }
  getUsersPaginated(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/users-paginated`, { params }); }
  createUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/users`, data); }
  updateUserRole(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/users/${uuid}/role`, data); }
  deleteUser(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/users/${uuid}`); }

  getAdminUsers(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/users`, { params }); }
  createAdminUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/users`, data); }
  updateAdminUser(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/users/${uuid}`, data); }
  deleteAdminUser(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/users/${uuid}`); }

  getUserAccess(): Observable<any> { return this.http.get(`${this.baseUrl}/company/user-access`); }
  createUserAccess(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/user-access`, data); }
  updateUserAccess(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/user-access/${uuid}`, data); }
  deleteUserAccess(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/user-access/${uuid}`); }

  getAdminAccess(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/access`); }
  assignAdminAccess(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/access`, data); }
  updateAdminAccess(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/access/${uuid}`, data); }
  removeAdminAccess(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/access/${uuid}`); }

  getWebauthnCredentials(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/webauthn-credentials`, { params }); }
  deleteWebauthnCredential(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/webauthn-credentials/${id}`); }

  getUsersWithRoles(params?: any): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.USERS, 'users', params);
  }

  getAdminUsersGql(params?: any): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.ADMIN_USERS, 'adminUsers', params);
  }

  getUserWithAccess(uuid: string): Observable<any> {
    return this.gqlQuerySingle<any>('security', SECUREX_QUERIES.USER, 'user', { uuid });
  }

  getUserAccessesWithRoles(params?: any): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.USER_ACCESSES, 'userAccesses', params);
  }

  getUserAccessPageData(params?: any): Observable<{ userAccesses: any[]; users: any[]; apps: any[]; companies: any[]; branches: any[]; roles: any[] }> {
    return this.gql.query<{ userAccesses: any[]; users: any[]; apps: any[]; companies: any[]; branches: any[]; roles: any[] }>('security', SECUREX_QUERIES.USER_ACCESS_PAGE, params);
  }

  createUserAccessGql(data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.CREATE_USER_ACCESS, 'createUserAccess', data);
  }

  updateUserAccessGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.UPDATE_USER_ACCESS, 'updateUserAccess', { uuid, ...data });
  }

  deleteUserAccessGql(uuid: string): Observable<any> {
    return this.gqlMutation<boolean>('security', SECUREX_MUTATIONS.DELETE_USER_ACCESS, 'deleteUserAccess', { uuid });
  }

  getUserWebauthnCredentials(params?: any): Observable<any> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.USER_WEBAUTHN_CREDENTIALS, 'userWebauthnCredentials', params);
  }

  deleteUserWebauthnCredential(id: number): Observable<any> {
    return this.gqlMutation<boolean>('security', SECUREX_MUTATIONS.DELETE_WEBAUTHN_CREDENTIAL, 'deleteUserWebauthnCredential', { id });
  }

  createUserGql(data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.CREATE_USER, 'createUser', {
      full_name: data.full_name, email: data.email,
      is_super_admin: !!data.is_super_admin, auth_provider: data.auth_provider,
    });
  }

  updateUserGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.UPDATE_USER, 'updateUser', { uuid, ...this.boolify(data) });
  }

  deleteUserGql(uuid: string): Observable<any> {
    return this.gqlMutation<boolean>('security', SECUREX_MUTATIONS.DELETE_USER, 'deleteUser', { uuid });
  }

  sendUserInvitationGql(data: { email: string; full_name?: string }): Observable<any> {
    return this.gqlMutation<{ success: boolean; message: string }>('security', SECUREX_MUTATIONS.SEND_USER_INVITATION, 'sendUserInvitation', data);
  }
}
