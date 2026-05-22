import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private get baseUrl() {
    return `${this.config.apiUrl}/company`;
  }

  private get headers() {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // --- Users ---
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, { headers: this.headers });
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, data, { headers: this.headers });
  }

  updateUserRole(uuid: string, roleId: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${uuid}/role`, { role_id: roleId }, { headers: this.headers });
  }

  deleteUser(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${uuid}`, { headers: this.headers });
  }

  // --- Roles ---
  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`, { headers: this.headers });
  }

  createRole(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles`, data, { headers: this.headers });
  }

  updateRole(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/roles/${uuid}`, data, { headers: this.headers });
  }

  deleteRole(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/${uuid}`, { headers: this.headers });
  }

  getRolePermissions(roleId: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles/${roleId}/permissions`, { headers: this.headers });
  }

  syncRolePermissions(roleId: any, permissionIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles/${roleId}/permissions`, { permission_ids: permissionIds }, { headers: this.headers });
  }

  // --- Permissions ---
  getPermissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/permissions`, { headers: this.headers });
  }

  createPermission(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/permissions`, data, { headers: this.headers });
  }

  updatePermission(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/permissions/${uuid}`, data, { headers: this.headers });
  }

  deletePermission(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/permissions/${uuid}`, { headers: this.headers });
  }
}
