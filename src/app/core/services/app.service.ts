import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class AppService extends BaseApiService {
  getApps(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/apps`); }
  getApp(uuid: string): Observable<any> { return this.http.get(`${this.baseUrl}/admin/apps/${uuid}`); }
  createApp(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/apps`, data); }
  updateApp(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/apps/${uuid}`, data); }
  deleteApp(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/apps/${uuid}`); }
  broadcastAppSync(): Observable<any> { return this.http.post(`${this.baseUrl}/admin/sync-apps-broadcast`, {}); }

  getAppsWithCompanies(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.APPS, 'apps');
  }

  createAppGql(data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.CREATE_APP, 'createApp', {
      name: data.name, slug: data.slug, is_active: !!data.is_active,
    });
  }

  updateAppGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.UPDATE_APP, 'updateApp', { uuid, ...this.boolify(data) });
  }

  deleteAppGql(uuid: string): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.DELETE_APP, 'deleteApp', { uuid });
  }
}
