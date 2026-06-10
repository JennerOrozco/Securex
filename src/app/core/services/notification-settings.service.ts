import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '../graphql/queries/notification.queries';

@Injectable({ providedIn: 'root' })
export class NotificationSettingsService extends BaseApiService {
  protected override get baseUrl(): string {
    return this.configService.notificationApiUrl;
  }

  getPushSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/admin/push-settings`);
  }

  getPushSetting(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/admin/push-settings/${id}`);
  }

  savePushSetting(id: number | null, data: any): Observable<any> {
    if (id) {
      return this.http.put(`${this.baseUrl}/notifications/admin/push-settings/${id}`, data);
    }
    return this.http.post(`${this.baseUrl}/notifications/admin/push-settings`, data);
  }

  deletePushSetting(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/admin/push-settings/${id}`);
  }

  getSmtpSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/admin/smtp-settings`);
  }

  getSmtpSetting(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/admin/smtp-settings/${id}`);
  }

  saveSmtpSetting(id: number | null, data: any): Observable<any> {
    if (id) {
      return this.http.put(`${this.baseUrl}/notifications/admin/smtp-settings/${id}`, data);
    }
    return this.http.post(`${this.baseUrl}/notifications/admin/smtp-settings`, data);
  }

  deleteSmtpSetting(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/admin/smtp-settings/${id}`);
  }

  testNotification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/send-jwt`, data);
  }

  sendNotificationToAny(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/send`, data);
  }

  generateVapid(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/admin/generate-vapid`);
  }

  getNotificationsHistory(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/superadmin/notifications`, { params });
  }

  deleteNotificationHistory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/superadmin/notifications/${id}`);
  }

  getUserDevices(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/superadmin/user-devices`, { params });
  }

  deleteUserDevice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/superadmin/user-devices/${id}`);
  }

  getSendAttempts(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/superadmin/send-attempts`, { params });
  }

  deleteSendAttempt(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/superadmin/send-attempts/${id}`);
  }

  deleteSendAttemptGql(id: number): Observable<any> {
    return this.gqlMutation<boolean>('notification', NOTIFICATION_MUTATIONS.DELETE_SEND_ATTEMPT, 'deleteSendAttempt', { id });
  }

  getSendAttemptsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('notification', NOTIFICATION_QUERIES.SEND_ATTEMPTS, 'sendAttempts');
  }

  getNotificationsHistoryGql(): Observable<any[]> {
    return this.gqlQueryList<any>('notification', NOTIFICATION_QUERIES.NOTIFICATIONS, 'notifications');
  }

  deleteNotificationHistoryGql(id: number): Observable<any> {
    return this.gqlMutation<boolean>('notification', NOTIFICATION_MUTATIONS.DELETE_NOTIFICATION, 'deleteNotification', { id });
  }

  getUserDevicesGql(): Observable<any[]> {
    return this.gqlQueryList<any>('notification', NOTIFICATION_QUERIES.USER_DEVICES, 'userDevices');
  }

  deleteUserDeviceGql(id: number): Observable<any> {
    return this.gqlMutation<boolean>('notification', NOTIFICATION_MUTATIONS.DELETE_DEVICE, 'deleteDevice', { id });
  }

  getPushSettingsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('notification', NOTIFICATION_QUERIES.PUSH_SETTINGS, 'pushSettings');
  }

  getSmtpSettingsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('notification', NOTIFICATION_QUERIES.SMTP_SETTINGS, 'smtpSettings');
  }

  getAppsGql(): Observable<any[]> {
    return this.gqlQueryList<any>('notification', NOTIFICATION_QUERIES.APPS, 'apps');
  }
}
