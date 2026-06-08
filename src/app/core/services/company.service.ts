import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

  private get baseUrl(): string {
    return this.configService.apiUrl;
  }

  // REST
  getCompanies(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/companies`); }
  createCompany(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies`, data); }
  updateCompany(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/companies/${uuid}`, data); }
  deleteCompany(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/companies/${uuid}`); }

  getBranches(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/branches`); }
  getCompanyBranches(): Observable<any> { return this.http.get(`${this.baseUrl}/company/branches`); }
  createBranch(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/branches`, data); }
  updateBranch(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/branches/${uuid}`, data); }
  deleteBranch(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/branches/${uuid}`); }

  // GraphQL
  getCompaniesWithBranches(): Observable<any[]> {
    return this.gql.query<{ companies: any[] }>('security', SECUREX_QUERIES.COMPANIES).pipe(map(d => d.companies));
  }

  getCompaniesPageData(): Observable<{ apps: any[]; companies: any[] }> {
    return this.gql.query<{ apps: any[]; companies: any[] }>('security', SECUREX_QUERIES.COMPANIES_PAGE);
  }

  getCompanyWithBranches(uuid: string): Observable<any> {
    return this.gql.query<{ company: any }>('security', SECUREX_QUERIES.COMPANY, { uuid }).pipe(map(d => d.company));
  }

  getBranchesList(): Observable<any[]> {
    return this.gql.query<{ branches: any[] }>('security', SECUREX_QUERIES.BRANCHES).pipe(map(d => d.branches));
  }

  getBranchesPageData(): Observable<{ companies: any[]; branches: any[] }> {
    return this.gql.query<{ companies: any[]; branches: any[] }>('security', SECUREX_QUERIES.BRANCHES_PAGE);
  }

  createCompanyGql(data: any): Observable<any> {
    return this.gql.query<{ createCompany: any }>('security', SECUREX_MUTATIONS.CREATE_COMPANY, {
      name: data.name, tax_id: data.tax_id, logo_url: data.logo_url, is_active: !!data.is_active,
    }).pipe(map(d => d.createCompany));
  }

  updateCompanyGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateCompany: any }>('security', SECUREX_MUTATIONS.UPDATE_COMPANY, { uuid, ...this.bool(data) }).pipe(map(d => d.updateCompany));
  }

  deleteCompanyGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteCompany: boolean }>('security', SECUREX_MUTATIONS.DELETE_COMPANY, { uuid }).pipe(map(d => d.deleteCompany));
  }

  createBranchGql(data: any): Observable<any> {
    return this.gql.query<{ createBranch: any }>('security', SECUREX_MUTATIONS.CREATE_BRANCH, {
      name: data.name, company_id: data.company_id, address: data.address, phone: data.phone, is_active: !!data.is_active,
    }).pipe(map(d => d.createBranch));
  }

  updateBranchGql(uuid: string, data: any): Observable<any> {
    return this.gql.query<{ updateBranch: any }>('security', SECUREX_MUTATIONS.UPDATE_BRANCH, { uuid, ...this.bool(data) }).pipe(map(d => d.updateBranch));
  }

  deleteBranchGql(uuid: string): Observable<any> {
    return this.gql.query<{ deleteBranch: boolean }>('security', SECUREX_MUTATIONS.DELETE_BRANCH, { uuid }).pipe(map(d => d.deleteBranch));
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
