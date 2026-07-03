import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService, GraphqlDomain } from '../graphql/graphql.service';
import { normalizeApiResponse } from '../utils/api-response.utils';

export abstract class BaseApiService {
  protected http = inject(HttpClient);
  protected configService = inject(ConfigService);
  protected gql = inject(GraphqlService);

  protected get baseUrl(): string {
    return this.configService.apiUrl;
  }

  protected getRaw<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(map((response) => normalizeApiResponse<T>(response).data as T));
  }

  protected getRawById<T>(base: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${base}/${id}`).pipe(map((response) => normalizeApiResponse<T>(response).data as T));
  }

  protected postRaw<T>(url: string, data?: any): Observable<T> {
    return this.http.post<T>(url, data).pipe(map((response) => normalizeApiResponse<T>(response).data as T));
  }

  protected putRaw<T>(url: string, data?: any): Observable<T> {
    return this.http.put<T>(url, data).pipe(map((response) => normalizeApiResponse<T>(response).data as T));
  }

  protected deleteRaw<T>(url: string): Observable<T> {
    return this.http.delete<T>(url).pipe(map((response) => normalizeApiResponse<T>(response).data as T));
  }

  protected getAll<T>(endpoint: string): Observable<T> {
    return this.getRaw<T>(`${this.baseUrl}/${endpoint}`);
  }

  protected getById<T>(endpoint: string, id: string | number): Observable<T> {
    return this.getRawById<T>(`${this.baseUrl}/${endpoint}`, id);
  }

  protected create<T>(endpoint: string, data: any): Observable<T> {
    return this.postRaw<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  protected update<T>(endpoint: string, id: string | number, data: any): Observable<T> {
    return this.putRaw<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  protected delete<T>(endpoint: string, id: string | number): Observable<T> {
    return this.deleteRaw<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  protected getWithParams<T>(endpoint: string, params: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params }).pipe(map((response) => normalizeApiResponse<T>(response).data as T));
  }

  protected boolify(data: Record<string, any>, extraKeys: string[] = []): Record<string, any> {
    const BOOL_KEYS = new Set(['is_active', 'is_visible', 'is_super_admin', ...extraKeys]);
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      out[key] = BOOL_KEYS.has(key) ? !!val : val;
    }
    return out;
  }

  protected gqlQueryList<T>(
    domain: GraphqlDomain,
    query: string,
    field: string,
    variables?: Record<string, any>,
  ): Observable<T[]> {
    return this.gql.query<Record<string, T[]>>(domain, query, variables).pipe(map(d => d[field]));
  }

  protected gqlQuerySingle<T>(
    domain: GraphqlDomain,
    query: string,
    field: string,
    variables?: Record<string, any>,
  ): Observable<T> {
    return this.gql.query<Record<string, T>>(domain, query, variables).pipe(map(d => d[field]));
  }

  protected gqlMutate<T>(
    domain: GraphqlDomain,
    query: string,
    field: string,
    variables?: Record<string, any>,
  ): Observable<T> {
    return this.gql.query<Record<string, T>>(domain, query, variables).pipe(map(d => d[field]));
  }
}
