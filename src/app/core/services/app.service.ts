import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class AppService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // REST
  getApps(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/apps`); }
  getApp(uuid: string): Observable<any> { return this.http.get(`${this.baseUrl}/admin/apps/${uuid}`); }
  createApp(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/apps`, data); }
  updateApp(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/apps/${uuid}`, data); }
  deleteApp(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/apps/${uuid}`); }
  broadcastAppSync(): Observable<any> { return this.http.post(`${this.baseUrl}/admin/sync-apps-broadcast`, {}); }

  // GraphQL
  getAppsWithCompanies(): Observable<any[]> {
    return this.gql.query<{ apps: any[] }>('security', SECUREX_QUERIES.APPS).pipe(map(d => d.apps));
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
