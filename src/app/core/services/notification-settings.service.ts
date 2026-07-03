import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '../graphql/queries/notification.queries';

@Injectable({ providedIn: 'root' })
export class NotificationSettingsService extends BaseApiService {
  protected override get baseUrl(): string {
    return this.configService.notificationApiUrl;
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

  saveSmtpSetting(id: number | null, data: any): Observable<any> {
    if (id) {
      return this.http.put(`${this.baseUrl}/notifications/admin/smtp-settings/${id}`, data);
    }
    return this.http.post(`${this.baseUrl}/notifications/admin/smtp-settings`, data);
  }

  deleteSmtpSetting(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/admin/smtp-settings/${id}`);
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

  deleteSendAttemptGql(id: number | string): Observable<any> {
    return this.gqlMutate<boolean>('notification', NOTIFICATION_MUTATIONS.DELETE_SEND_ATTEMPT, 'deleteSendAttempt', { id: Number(id) });
  }

  getSendAttemptsGql(page: number = 1, limit: number = 15, filter?: any, sort?: any): Observable<any> {
    return this.gqlQuerySingle<any>('notification', NOTIFICATION_QUERIES.SEND_ATTEMPTS, 'sendAttempts', { page, limit, filter, sort });
  }

  getNotificationsHistoryGql(page: number = 1, limit: number = 15, filter?: any, sort?: any): Observable<any> {
    return this.gqlQuerySingle<any>('notification', NOTIFICATION_QUERIES.NOTIFICATIONS, 'notifications', { page, limit, filter, sort });
  }

  deleteNotificationHistoryGql(id: number | string): Observable<any> {
    return this.gqlMutate<boolean>('notification', NOTIFICATION_MUTATIONS.DELETE_NOTIFICATION, 'deleteNotification', { id: Number(id) });
  }

  getUserDevicesGql(page: number = 1, limit: number = 15, filter?: any, sort?: any): Observable<any> {
    return this.gqlQuerySingle<any>('notification', NOTIFICATION_QUERIES.USER_DEVICES, 'userDevices', { page, limit, filter, sort });
  }

  deleteUserDeviceGql(id: number | string): Observable<any> {
    return this.gqlMutate<boolean>('notification', NOTIFICATION_MUTATIONS.DELETE_DEVICE, 'deleteDevice', { id: Number(id) });
  }

  getPushSettingsGql(page: number = 1, limit: number = 15, filter?: any, sort?: any): Observable<any> {
    return this.gqlQuerySingle<any>('notification', NOTIFICATION_QUERIES.PUSH_SETTINGS, 'pushSettings', { page, limit, filter, sort });
  }

  getSmtpSettingsGql(page: number = 1, limit: number = 15, filter?: any, sort?: any): Observable<any> {
    return this.gqlQuerySingle<any>('notification', NOTIFICATION_QUERIES.SMTP_SETTINGS, 'smtpSettings', { page, limit, filter, sort });
  }

  getAppsGql(page: number = 1, limit: number = 15, filter?: any, sort?: any): Observable<any> {
    return this.gqlQuerySingle<any>('notification', NOTIFICATION_QUERIES.APPS, 'apps', { page, limit, filter, sort });
  }
}
