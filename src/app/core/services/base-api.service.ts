import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';

export abstract class BaseApiService {
  protected http = inject(HttpClient);
  protected configService = inject(ConfigService);
  protected gql = inject(GraphqlService);

  protected get baseUrl(): string {
    return this.configService.apiUrl;
  }

  protected boolify(data: Record<string, any>): Record<string, any> {
    const BOOL_KEYS = new Set(['is_active', 'is_visible', 'is_super_admin']);
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      out[key] = BOOL_KEYS.has(key) ? !!val : val;
    }
    return out;
  }

  protected gqlQueryList<T>(
    domain: 'crm' | 'finance' | 'security' | 'notification' | 'report',
    query: string,
    field: string,
    variables?: Record<string, any>,
  ): Observable<T[]> {
    return this.gql.query<Record<string, T[]>>(domain, query, variables).pipe(map(d => d[field]));
  }

  protected gqlQuerySingle<T>(
    domain: 'crm' | 'finance' | 'security' | 'notification' | 'report',
    query: string,
    field: string,
    variables?: Record<string, any>,
  ): Observable<T> {
    return this.gql.query<Record<string, T>>(domain, query, variables).pipe(map(d => d[field]));
  }

  protected gqlMutation<T>(
    domain: 'crm' | 'finance' | 'security' | 'notification' | 'report',
    query: string,
    field: string,
    variables?: Record<string, any>,
  ): Observable<T> {
    return this.gql.query<Record<string, T>>(domain, query, variables).pipe(map(d => d[field]));
  }
}
