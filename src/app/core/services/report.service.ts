import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface ReportResponse {
  message: string;
  report_id?: string;
}

export interface Report {
  id: string;
  client_name: string;
  client_email?: string;
  start_time?: string;
  end_time?: string;
  status: 'draft' | 'completed';
  signature?: string;
  technician_signature?: string;
  technician_name?: string;
  created_at?: string;
  answers?: any[];
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private configService = inject(ConfigService);

  private get apiUrl() {
    return `${this.configService.reportApiUrl}`;
  } 

  constructor(private http: HttpClient) { }

  createReport(data: any): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.apiUrl}/submissions`, data);
  }

  getReports(): Observable<Report[]> {
    let url = `${this.apiUrl}/submissions`;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const params: string[] = [];
      if (user.id) {
        params.push(`user_id=${user.id}`);
      }
      if (user.role) {
        params.push(`role=${user.role}`);
      }
      if (params.length) {
        url += `?${params.join('&')}`;
      }
    }
    return this.http.get<Report[]>(url);
  }

  saveDraft(report: any): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.apiUrl}/submissions`, { ...report, status: 'draft' });
  }

  /**
   * Get report by UUID
   */
  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/submissions/${id}`);
  }

  /**
   * Delete a report by UUID
   */
  deleteReport(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/submissions/${id}`);
  }

  /**
   * Send the report PDF via email
   */
  sendReportEmail(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/submissions/${id}/send-email`,
      { id }
    );
  }

  /**
   * Get the URL for the dynamic PDF generation
   */
  getDynamicPdfUrl(id: string): string {
    const base = this.configService.reportApiUrl.replace(/\/v1\/report\/?$/, '');
    return `${base}/pdf.php?id=${id}`;
  }
}
