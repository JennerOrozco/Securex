import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseApiService {
  getCompanies(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/companies`); }
  createCompany(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/companies`, data); }
  updateCompany(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/companies/${uuid}`, data); }
  deleteCompany(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/companies/${uuid}`); }

  getBranches(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/branches`); }
  getCompanyBranches(): Observable<any> { return this.http.get(`${this.baseUrl}/company/branches`); }
  createBranch(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/admin/branches`, data); }
  updateBranch(uuid: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/admin/branches/${uuid}`, data); }
  deleteBranch(uuid: string): Observable<any> { return this.http.delete(`${this.baseUrl}/admin/branches/${uuid}`); }

  getCompaniesWithBranches(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.COMPANIES, 'companies');
  }

  getCompaniesPageData(): Observable<{ apps: any[]; companies: any[] }> {
    return this.gql.query<{ apps: any[]; companies: any[] }>('security', SECUREX_QUERIES.COMPANIES_PAGE);
  }

  getCompanyWithBranches(uuid: string): Observable<any> {
    return this.gqlQuerySingle<any>('security', SECUREX_QUERIES.COMPANY, 'company', { uuid });
  }

  getBranchesList(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.BRANCHES, 'branches');
  }

  getBranchesPageData(): Observable<{ companies: any[]; branches: any[] }> {
    return this.gql.query<{ companies: any[]; branches: any[] }>('security', SECUREX_QUERIES.BRANCHES_PAGE);
  }

  createCompanyGql(data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.CREATE_COMPANY, 'createCompany', {
      name: data.name, tax_id: data.tax_id, logo_url: data.logo_url, is_active: !!data.is_active,
    });
  }

  updateCompanyGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.UPDATE_COMPANY, 'updateCompany', { uuid, ...this.boolify(data) });
  }

  deleteCompanyGql(uuid: string): Observable<any> {
    return this.gqlMutation<boolean>('security', SECUREX_MUTATIONS.DELETE_COMPANY, 'deleteCompany', { uuid });
  }

  createBranchGql(data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.CREATE_BRANCH, 'createBranch', {
      name: data.name, company_id: data.company_id, address: data.address, phone: data.phone, is_active: !!data.is_active,
    });
  }

  updateBranchGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutation<any>('security', SECUREX_MUTATIONS.UPDATE_BRANCH, 'updateBranch', { uuid, ...this.boolify(data) });
  }

  deleteBranchGql(uuid: string): Observable<any> {
    return this.gqlMutation<boolean>('security', SECUREX_MUTATIONS.DELETE_BRANCH, 'deleteBranch', { uuid });
  }
}
