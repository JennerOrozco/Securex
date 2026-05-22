import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface ResponseType {
  id: string;
  name: string;
  use_options: boolean;
  use_text: boolean;
  use_photo: boolean;
  use_signature?: boolean;
  use_email?: boolean;
  use_textarea?: boolean;
  use_date?: boolean;
  use_observations?: boolean;
  use_measurement?: boolean;
  is_static?: boolean; // For Header, Paragraph, Separator
}

export interface QuestionOption {
  id?: string;
  question_id?: string;
  option_text: string;
}

export interface ReportQuestion {
  id?: string;
  page_id?: string;
  response_type_id: string;
  question_text: string;
  order_index: number;
  placeholder?: string;
  default_value?: string;
  width?: 'full' | 'half' | 'third';
  section_header?: string;
  measurement_unit?: string;
  required?: boolean;
  response_type?: ResponseType;
  options?: QuestionOption[];
}

export interface ReportPage {
  id?: string;
  report_definition_id?: string;
  page_number: number;
  header?: string;
  questions: ReportQuestion[];
}

export interface ReportDefinition {
  id?: string;
  name: string;
  subtitle?: string;
  is_active?: boolean;
  is_public?: boolean;
  created_at?: string;
  pages?: ReportPage[];
  total_responses?: number;
  draft_responses?: number;
  completed_responses?: number;
}

export interface ReportPhoto {
  url: string;
  description: string;
}

export interface UserResponse {
  question_id: string;
  text_value?: string;
  observation_text?: string;
  measurement_value?: string;
  selected_option_id?: string;
  image_base64?: string;
  images?: ReportPhoto[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportBuilderService {
  private configService = inject(ConfigService);

  private get apiUrl() {
    return `${this.configService.reportApiUrl}`;
  }

  constructor(private http: HttpClient) { }

  getResponseTypes(): Observable<ResponseType[]> {
    return this.http.get<ResponseType[]>(`${this.apiUrl}/response-types`);
  }

  getDefinitions(userId?: string): Observable<ReportDefinition[]> {
    let url = `${this.apiUrl}/definitions?_t=${Date.now()}`;
    if (userId) url += `&user_id=${userId}`;
    return this.http.get<ReportDefinition[]>(url);
  }

  getDefinition(id: string): Observable<ReportDefinition> {
    return this.http.get<ReportDefinition>(`${this.apiUrl}/definitions/${id}`);
  }

  createDefinition(data: ReportDefinition): Observable<ReportDefinition> {
    return this.http.post<ReportDefinition>(`${this.apiUrl}/definitions`, data);
  }

  updateDefinition(id: string, data: ReportDefinition): Observable<ReportDefinition> {
    return this.http.put<ReportDefinition>(`${this.apiUrl}/definitions/${id}`, data);
  }

  deleteDefinition(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/definitions/${id}`);
  }

  duplicateDefinition(id: string, data?: { name?: string; subtitle?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/definitions/${id}/duplicate`, data || {});
  }

  submitResponses(userId: string, answers: UserResponse[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/responses`, { user_id: userId, answers });
  }

  getResponses(definitionId: string, userId?: string): Observable<any[]> {
    let url = `${this.apiUrl}/responses/${definitionId}`;
    if (userId) url += `&user_id=${userId}`;
    return this.http.get<any[]>(url);
  }

  startSubmission(defId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/submissions`, {
      report_definition_id: defId,
      user_id: userId
    });
  }

  saveAnswer(submissionId: string, userId: string, answer: UserResponse): Observable<any> {
    let imgData = answer.image_base64;
    if (!imgData && answer.images && answer.images.length > 0) {
        imgData = JSON.stringify(answer.images);
    } else if (!imgData && answer.images && answer.images.length === 0) {
        imgData = JSON.stringify([]);
    }

    const payload = {
        submission_id: submissionId,
        user_id: userId,
        question_id: answer.question_id,
        text_value: answer.text_value,
        observation_text: answer.observation_text,
        measurement_value: answer.measurement_value,
        selected_option_id: answer.selected_option_id,
        image_base64: imgData
    };
    return this.http.put(`${this.apiUrl}/submissions/response`, payload);
  }

  finishSubmission(submissionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/submissions/${submissionId}/finish`, {});
  }

  getSubmissions(userId?: string, defId?: string, status?: string): Observable<any[]> {
    let url = `${this.apiUrl}/submissions?_t=${Date.now()}`;
    if (defId) url += `&report_definition_id=${defId}`;
    if (status) url += `&status=${status}`;
    return this.http.get<any[]>(url);
  }

  getSubmission(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/submissions/${id}`);
  }

  deleteSubmission(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/submissions/${id}`);
  }

  findDraft(defId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/submissions/find-draft?report_definition_id=${defId}&user_id=${userId}`;
    return this.http.get(url);
  }

  // PDF Templates
  getPdfTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pdf-templates`);
  }

  getPdfTemplate(defId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pdf-templates/by-definition/${defId}`);
  }

  getPdfTemplateById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pdf-templates/${id}`);
  }

  deletePdfTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pdf-templates/${id}`);
  }

  savePdfTemplate(defId: string | null, name: string, elements: any[], id?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pdf-templates`, {
      id,
      report_definition_id: defId,
      name,
      elements
    });
  }

  setupPdfTable(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pdf-templates/setup-table`);
  }

  getSystemStats(userId?: string): Observable<any> {
    let url = `${this.apiUrl}/system-stats?_t=${Date.now()}`;
    if(userId) url += `&user_id=${userId}`;
    return this.http.get(url);
  }
}
