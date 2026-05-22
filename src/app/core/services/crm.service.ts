import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get headers() {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private get baseUrl() {
    return this.configService.crmApiUrl;
  }

  // --- Leads ---
  getLeads(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leads`, { headers: this.headers });
  }

  getLead(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/leads/${uuid}`, { headers: this.headers });
  }

  createLead(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/leads`, data, { headers: this.headers });
  }

  updateLead(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/leads/${uuid}`, data, { headers: this.headers });
  }

  deleteLead(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/leads/${uuid}`, { headers: this.headers });
  }

  // --- Accounts ---
  getAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts`, { headers: this.headers });
  }

  getAccount(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts/${uuid}`, { headers: this.headers });
  }

  createAccount(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/accounts`, data, { headers: this.headers });
  }

  updateAccount(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/accounts/${uuid}`, data, { headers: this.headers });
  }

  deleteAccount(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/accounts/${uuid}`, { headers: this.headers });
  }

  // --- Contacts ---
  getContacts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contacts`, { headers: this.headers });
  }

  getContact(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/contacts/${uuid}`, { headers: this.headers });
  }

  createContact(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/contacts`, data, { headers: this.headers });
  }

  updateContact(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/contacts/${uuid}`, data, { headers: this.headers });
  }

  deleteContact(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/contacts/${uuid}`, { headers: this.headers });
  }

  // --- CRM Products ---
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`, { headers: this.headers });
  }

  getProduct(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/${uuid}`, { headers: this.headers });
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/products`, data, { headers: this.headers });
  }

  updateProduct(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${uuid}`, data, { headers: this.headers });
  }

  deleteProduct(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${uuid}`, { headers: this.headers });
  }

  uploadProductPhoto(productUuid: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Create new headers without Content-Type so browser sets it with boundary for multipart/form-data
    const authHeader = this.headers.get('Authorization');
    let uploadHeaders = new HttpHeaders();
    if (authHeader) {
      uploadHeaders = uploadHeaders.set('Authorization', authHeader);
    }
    
    return this.http.post(`${this.baseUrl}/products/${productUuid}/photos`, formData, { headers: uploadHeaders });
  }

  deleteProductPhoto(productUuid: string, photoUuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${productUuid}/photos/${photoUuid}`, { headers: this.headers });
  }

  setPrimaryProductPhoto(productUuid: string, photoUuid: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${productUuid}/photos/${photoUuid}/primary`, {}, { headers: this.headers });
  }


  // --- Sales Stages ---
  getStages(pipelineUuid?: string): Observable<any> {
    const params = pipelineUuid ? `?pipeline_uuid=${pipelineUuid}` : '';
    return this.http.get(`${this.baseUrl}/stages${params}`, { headers: this.headers });
  }

  // --- Pipelines ---
  getPipelines(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pipelines`, { headers: this.headers });
  }

  createPipeline(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/pipelines`, data, { headers: this.headers });
  }

  updatePipeline(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/pipelines/${uuid}`, data, { headers: this.headers });
  }

  activatePipeline(uuid: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/pipelines/${uuid}/activate`, {}, { headers: this.headers });
  }

  getStage(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/stages/${uuid}`, { headers: this.headers });
  }

  createStage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/stages`, data, { headers: this.headers });
  }

  updateStage(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/stages/${uuid}`, data, { headers: this.headers });
  }

  deleteStage(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/stages/${uuid}`, { headers: this.headers });
  }

  // --- Opportunities ---
  getOpportunities(): Observable<any> {
    return this.http.get(`${this.baseUrl}/opportunities`, { headers: this.headers });
  }

  getOpportunity(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/opportunities/${uuid}`, { headers: this.headers });
  }

  createOpportunity(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/opportunities`, data, { headers: this.headers });
  }

  updateOpportunity(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/opportunities/${uuid}`, data, { headers: this.headers });
  }

  deleteOpportunity(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/opportunities/${uuid}`, { headers: this.headers });
  }

  // --- Opportunity Line Items ---
  getOpportunityLineItems(opportunityUuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/opportunities/${opportunityUuid}/line-items`, { headers: this.headers });
  }

  createOpportunityLineItem(opportunityUuid: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/opportunities/${opportunityUuid}/line-items`, data, { headers: this.headers });
  }

  updateOpportunityLineItem(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/opportunities/line-items/${uuid}`, data, { headers: this.headers });
  }

  deleteOpportunityLineItem(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/opportunities/line-items/${uuid}`, { headers: this.headers });
  }

  // --- Lead Sources ---
  getLeadSources(): Observable<any> {
    return this.http.get(`${this.baseUrl}/lead-sources`, { headers: this.headers });
  }

  getLeadSource(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/lead-sources/${uuid}`, { headers: this.headers });
  }

  createLeadSource(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lead-sources`, data, { headers: this.headers });
  }

  updateLeadSource(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/lead-sources/${uuid}`, data, { headers: this.headers });
  }

  deleteLeadSource(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/lead-sources/${uuid}`, { headers: this.headers });
  }

  // --- Loss Reasons ---
  getLossReasons(): Observable<any> {
    return this.http.get(`${this.baseUrl}/loss-reasons`, { headers: this.headers });
  }

  getLossReason(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/loss-reasons/${uuid}`, { headers: this.headers });
  }

  createLossReason(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loss-reasons`, data, { headers: this.headers });
  }

  updateLossReason(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/loss-reasons/${uuid}`, data, { headers: this.headers });
  }

  deleteLossReason(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/loss-reasons/${uuid}`, { headers: this.headers });
  }

  // --- Task Types ---
  getTaskTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/task-types`, { headers: this.headers });
  }

  getTaskType(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/task-types/${uuid}`, { headers: this.headers });
  }

  createTaskType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/task-types`, data, { headers: this.headers });
  }

  updateTaskType(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/task-types/${uuid}`, data, { headers: this.headers });
  }

  deleteTaskType(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/task-types/${uuid}`, { headers: this.headers });
  }

  // --- Document Types ---
  getDocumentTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/document-types`, { headers: this.headers });
  }

  getDocumentType(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/document-types/${uuid}`, { headers: this.headers });
  }

  createDocumentType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/document-types`, data, { headers: this.headers });
  }

  updateDocumentType(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/document-types/${uuid}`, data, { headers: this.headers });
  }

  deleteDocumentType(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/document-types/${uuid}`, { headers: this.headers });
  }

  // --- Activity Tracking (Audit logs) ---
  getActivityLogs(params?: { contact_uuid?: string; opportunity_uuid?: string; account_uuid?: string; user_uuid?: string; entity_type?: string; action_type?: string }): Observable<any> {
    let queryParams = '';
    if (params) {
      const parts = Object.entries(params)
        .filter(([_, val]) => !!val)
        .map(([key, val]) => `${key}=${encodeURIComponent(val as string)}`);
      if (parts.length > 0) {
        queryParams = '?' + parts.join('&');
      }
    }
    return this.http.get(`${this.baseUrl}/activity-tracking${queryParams}`, { headers: this.headers });
  }

  createActivityLog(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/activity-tracking`, data, { headers: this.headers });
  }

  // --- Notes CRUD ---
  getNotes(entityType?: string, entityUuid?: string): Observable<any> {
    let paramsStr = '';
    if (entityType && entityUuid) {
      paramsStr = `?entity_type=${entityType}&entity_uuid=${entityUuid}`;
    }
    return this.http.get(`${this.baseUrl}/notes${paramsStr}`, { headers: this.headers });
  }

  createNote(data: { entity_type: string; entity_uuid: string; note_content: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/notes`, data, { headers: this.headers });
  }

  updateNote(uuid: string, data: { note_content: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/notes/${uuid}`, data, { headers: this.headers });
  }

  deleteNote(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notes/${uuid}`, { headers: this.headers });
  }
}
