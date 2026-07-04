import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../graphql/queries/securex.queries';

@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseApiService {
  getCompanies(): Observable<any> { return this.http.get(`${this.baseUrl}/admin/companies`); }
  getCompaniesWithBranches(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.COMPANIES, 'companies');
  }

  getCompaniesPageData(): Observable<{ apps: { data: any[] }; companies: { data: any[] } }> {
    return this.gql.query<{ apps: { data: any[] }; companies: { data: any[] } }>('security', SECUREX_QUERIES.COMPANIES_PAGE);
  }

  uploadLogo(file: File, appId: string, companyName: string): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('app_id', appId);
    formData.append('company_name', companyName);
    return this.http.post<{ url: string }>(`${this.baseUrl}/admin/companies/logo`, formData);
  }

  getCompanyWithBranches(uuid: string): Observable<any> {
    return this.gqlQuerySingle<any>('security', SECUREX_QUERIES.COMPANY, 'company', { uuid });
  }

  getBranchesList(): Observable<any[]> {
    return this.gqlQueryList<any>('security', SECUREX_QUERIES.BRANCHES, 'branches');
  }

  getBranchesPageData(): Observable<{ companies: { data: any[] }; branches: { data: any[] } }> {
    return this.gql.query<{ companies: { data: any[] }; branches: { data: any[] } }>('security', SECUREX_QUERIES.BRANCHES_PAGE);
  }

  createCompanyGql(data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.CREATE_COMPANY, 'createCompany', {
      name: data.name, tax_id: data.tax_id, logo_url: data.logo_url, is_active: !!data.is_active,
      app_id: data.app_id ? Number(data.app_id) : null,
    });
  }

  updateCompanyGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.UPDATE_COMPANY, 'updateCompany', { uuid, ...this.boolify(data) });
  }

  deleteCompanyGql(uuid: string): Observable<any> {
    return this.gqlMutate<boolean>('security', SECUREX_MUTATIONS.DELETE_COMPANY, 'deleteCompany', { uuid });
  }

  createBranchGql(data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.CREATE_BRANCH, 'createBranch', {
      name: data.name, company_id: data.company_id, address: data.address, phone: data.phone, is_active: !!data.is_active,
    });
  }

  updateBranchGql(uuid: string, data: any): Observable<any> {
    return this.gqlMutate<any>('security', SECUREX_MUTATIONS.UPDATE_BRANCH, 'updateBranch', { uuid, ...this.boolify(data) });
  }

  deleteBranchGql(uuid: string): Observable<any> {
    return this.gqlMutate<boolean>('security', SECUREX_MUTATIONS.DELETE_BRANCH, 'deleteBranch', { uuid });
  }
}
