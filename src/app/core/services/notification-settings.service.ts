import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { GraphqlService } from '../graphql/graphql.service';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '../graphql/queries/notification.queries';

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingsService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private gql = inject(GraphqlService);

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

  deleteSendAttemptGql(id: number): Observable<any> {
    return this.gql.query<{ deleteSendAttempt: boolean }>('notification', NOTIFICATION_MUTATIONS.DELETE_SEND_ATTEMPT, { id }).pipe(map(d => d.deleteSendAttempt));
  }

  // ─── GraphQL Reads ───

  getSendAttemptsGql(): Observable<any[]> {
    return this.gql.query<{ sendAttempts: any[] }>('notification', NOTIFICATION_QUERIES.SEND_ATTEMPTS).pipe(map(d => d.sendAttempts));
  }

  getNotificationsHistoryGql(): Observable<any[]> {
    return this.gql.query<{ notifications: any[] }>('notification', NOTIFICATION_QUERIES.NOTIFICATIONS).pipe(map(d => d.notifications));
  }

  deleteNotificationHistoryGql(id: number): Observable<any> {
    return this.gql.query<{ deleteNotification: boolean }>('notification', NOTIFICATION_MUTATIONS.DELETE_NOTIFICATION, { id }).pipe(map(d => d.deleteNotification));
  }

  getUserDevicesGql(): Observable<any[]> {
    return this.gql.query<{ userDevices: any[] }>('notification', NOTIFICATION_QUERIES.USER_DEVICES).pipe(map(d => d.userDevices));
  }

  deleteUserDeviceGql(id: number): Observable<any> {
    return this.gql.query<{ deleteDevice: boolean }>('notification', NOTIFICATION_MUTATIONS.DELETE_DEVICE, { id }).pipe(map(d => d.deleteDevice));
  }

  getPushSettingsGql(): Observable<any[]> {
    return this.gql.query<{ pushSettings: any[] }>('notification', NOTIFICATION_QUERIES.PUSH_SETTINGS).pipe(map(d => d.pushSettings));
  }

  getSmtpSettingsGql(): Observable<any[]> {
    return this.gql.query<{ smtpSettings: any[] }>('notification', NOTIFICATION_QUERIES.SMTP_SETTINGS).pipe(map(d => d.smtpSettings));
  }

  getAppsGql(): Observable<any[]> {
    return this.gql.query<{ apps: any[] }>('notification', NOTIFICATION_QUERIES.APPS).pipe(map(d => d.apps));
  }
}
