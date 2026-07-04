import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { GraphqlService } from '../graphql/graphql.service';
import { resolveQuery, resolveMutation } from '../graphql/queries/registry';
import { SECUREX_QUERIES } from '../graphql/queries/securex.queries';
import type { CrudConfigFromAPI } from '@shared/types/crud-config.types';

@Injectable({ providedIn: 'root' })
export class CrudConfigService {
  private gql = inject(GraphqlService);
  private cache = signal<Record<string, CrudConfigFromAPI>>({});

  getCrudConfig(routePath: string): Observable<CrudConfigFromAPI> {
    const cached = this.cache()[routePath];
    if (cached) return of(cached);

    return this.gql.query<{ crudConfig: CrudConfigFromAPI }>(
      'security',
      SECUREX_QUERIES.CRUD_CONFIG,
      { routePath }
    ).pipe(
      map(res => {
        const cfg = (res as any)?.crudConfig ?? (res as any)?.data?.crudConfig;
        if (cfg) this.cache.update(c => ({ ...c, [routePath]: cfg }));
        return cfg;
      }),
      catchError(() => of(null as unknown as CrudConfigFromAPI))
    );
  }

  buildFetchFn(cfg: CrudConfigFromAPI, fallback?: Function): Function | undefined {
    if (!cfg.query_name || !cfg.query_field) return fallback;
    const query = resolveQuery(cfg.graphql_domain, cfg.query_name);
    if (!query) return fallback;
    return (page: number, limit: number, filter?: any, sort?: any) =>
      this.gql.query(cfg.graphql_domain as any, query, { page, limit, filter, sort }).pipe(
        map((d: any) => d[cfg.query_field])
      );
  }

  buildDeleteFn(cfg: CrudConfigFromAPI, fallback?: Function): Function | undefined {
    if (!cfg.delete_q_name || !cfg.delete_field) return fallback;
    const mutation = resolveMutation(cfg.graphql_domain, cfg.delete_q_name);
    if (!mutation) return fallback;
    return (id: string | number) =>
      this.gql.query(cfg.graphql_domain as any, mutation, { id: Number(id) }).pipe(
        map((d: any) => d[cfg.delete_field])
      );
  }
}
