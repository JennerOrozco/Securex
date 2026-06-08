import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // REST: Company-scoped users
  getUsers(): Observable<any> { return this.http.get(`${this.baseUrl}/company/users`); }
  getUsersPaginated(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/company/users-paginated`, { params }); }
  createUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/users`, data); }
  updateUserRole(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/users/${uuid}/role`, data); }
  deleteUser(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/users/${uuid}`); }

  // REST: Admin users
  getAdminUsers(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/users`, { params }); }
  createAdminUser(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/users`, data); }
  updateAdminUser(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/users/${uuid}`, data); }
  deleteAdminUser(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/users/${uuid}`); }

  // REST: User access
  getUserAccess(): Observable<any> { return this.http.get(`${this.baseUrl}/company/user-access`); }
  createUserAccess(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/company/user-access`, data); }
  updateUserAccess(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/company/user-access/${uuid}`, data); }
  deleteUserAccess(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/company/user-access/${uuid}`); }

  // REST: Admin access
  getAdminAccess(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/access`); }
  assignAdminAccess(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/access`, data); }
  updateAdminAccess(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/access/${uuid}`, data); }
  removeAdminAccess(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/access/${uuid}`); }

  // REST: WebAuthn credentials (admin view)
  getWebauthnCredentials(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/admin/webauthn-credentials`, { params }); }
  deleteWebauthnCredential(id: number): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/webauthn-credentials/${id}`); }

  // GraphQL
  getUsersWithRoles(params?: any): Observable<any[]> {
    return this.gql.query<{ users: any[] }>('security', SECUREX_QUERIES.USERS, params).pipe(map(d => d.users));
  }

  getAdminUsersGql(params?: any): Observable<any[]> {
    return this.gql.query<{ adminUsers: any[] }>('security', SECUREX_QUERIES.ADMIN_USERS, params).pipe(map(d => d.adminUsers));
  }

  getUserWithAccess(uuid: string): Observable<any> {
    return this.gql.query<{ user: any }>('security', SECUREX_QUERIES.USER, { uuid }).pipe(map(d => d.user));
  }

  getUserAccessesWithRoles(params?: any): Observable<any[]> {
    return this.gql.query<{ userAccesses: any[] }>('security', SECUREX_QUERIES.USER_ACCESSES, params).pipe(map(d => d.userAccesses));
  }

  getUserAccessPageData(params?: any): Observable<{ userAccesses: any[]; users: any[]; apps: any[]; companies: any[]; branches: any[]; roles: any[] }> {
    return this.gql.query<{ userAccesses: any[]; users: any[]; apps: any[]; companies: any[]; branches: any[]; roles: any[] }>('security', SECUREX_QUERIES.USER_ACCESS_PAGE, params);
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
