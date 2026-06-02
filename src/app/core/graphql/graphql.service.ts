import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';

export type GraphqlDomain = 'crm' | 'finance' | 'security' | 'notification' | 'report';

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private getUrl(domain: GraphqlDomain): string {
    switch (domain) {
      case 'crm': return `${this.config.crmApiUrl}/graphql`;
      case 'finance': return `${this.config.financeApiUrl}/graphql`;
      case 'security': return `${this.config.apiUrl}/graphql`;
      case 'notification': return `${this.config.notificationApiUrl}/graphql`;
      case 'report': return `${this.config.reportApiUrl}/graphql`;
    }
  }

  query<T>(domain: GraphqlDomain, query: string, variables?: Record<string, any>): Observable<T> {
    return this.http.post<{ data: T }>(this.getUrl(domain), { query, variables }).pipe(
      map(res => res.data)
    );
  }
}
