import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingsService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get apiUrl() {
    return this.configService.notificationApiUrl; // We assume this exists based on config.json checks earlier
  }

  // --- PUSH SETTINGS ---
  getPushSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/admin/push-settings`);
  }

  getPushSetting(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/admin/push-settings/${id}`);
  }

  savePushSetting(id: number | null, data: any): Observable<any> {
    if (id) {
      return this.http.put(`${this.apiUrl}/notifications/admin/push-settings/${id}`, data);
    }
    return this.http.post(`${this.apiUrl}/notifications/admin/push-settings`, data);
  }

  deletePushSetting(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/admin/push-settings/${id}`);
  }

  // --- SMTP SETTINGS ---
  getSmtpSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/admin/smtp-settings`);
  }

  getSmtpSetting(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/admin/smtp-settings/${id}`);
  }

  saveSmtpSetting(id: number | null, data: any): Observable<any> {
    if (id) {
      return this.http.put(`${this.apiUrl}/notifications/admin/smtp-settings/${id}`, data);
    }
    return this.http.post(`${this.apiUrl}/notifications/admin/smtp-settings`, data);
  }

  deleteSmtpSetting(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/admin/smtp-settings/${id}`);
  }

  // --- TEST NOTIFICATION ---
  testNotification(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/send-jwt`, data);
  }

  sendNotificationToAny(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/send`, data);
  }

  // --- VAPID GENERATOR ---
  generateVapid(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/admin/generate-vapid`);
  }

  // --- SUPERADMIN TELEMETRY ---
  getNotificationsHistory(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/superadmin/notifications`, { params });
  }

  deleteNotificationHistory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/superadmin/notifications/${id}`);
  }

  getUserDevices(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/superadmin/user-devices`, { params });
  }

  deleteUserDevice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/superadmin/user-devices/${id}`);
  }

  getSendAttempts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/superadmin/send-attempts`, { params });
  }

  deleteSendAttempt(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/superadmin/send-attempts/${id}`);
  }
}
