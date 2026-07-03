import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { Observable, firstValueFrom, map, timeout } from 'rxjs';
import { MessageService } from 'primeng/api';
import { GraphqlService } from '../graphql/graphql.service';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '../graphql/queries/notification.queries';

export interface AppNotification {
  id: number;
  user_uuid: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  route_url?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private configService = inject(ConfigService);
  private storage = inject(StorageService);
  private gql = inject(GraphqlService);
  private messageService = inject(MessageService);

  constructor() { }

  /**
   * Solicita permiso y registra el dispositivo en el microservicio de notificaciones.
   */
  async registerForPush() {
    if (!this.swPush.isEnabled) {
      return;
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.configService.vapidPublicKey
      });

      this.sendSubscriptionToApi(sub).subscribe({
        error: () => {} // Silencioso en producción
      });
    } catch {
      // Silencioso: push no es crítico para la funcionalidad core
    }
  }

  /**
   * Desinscribe el dispositivo de las notificaciones push.
   */
  async unsubscribeFromPush() {
    if (!this.swPush.isEnabled) {
      return;
    }
    try {
      const sub = await firstValueFrom(this.swPush.subscription.pipe(timeout(2000)));

      if (sub) {
        const payload = {
          device_token: JSON.stringify(sub)
        };

        this.http.delete(`${this.configService.notificationApiUrl}/notifications/devices`, { body: payload }).subscribe({
          error: () => {} // Silencioso en producción
        });

        await this.swPush.unsubscribe();
      }
    } catch {
      // Silencioso: no bloquear si falla desuscripción
    }
  }

  private getCompanyUuid(): string | null {
    return this.storage.getCompany()?.uuid ?? null;
  }

  private sendSubscriptionToApi(sub: PushSubscription) {
    const user = this.storage.getUser();
    return this.gql.mutate('notification', NOTIFICATION_MUTATIONS.REGISTER_DEVICE, {
      user_uuid: user?.uuid ?? '',
      app_uuid: this.configService.appUuid,
      device_token: JSON.stringify(sub),
      device_type: this.getDeviceType()
    });
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'PWA_ANDROID';
    if (/iPad|iPhone|iPod/.test(ua)) return 'PWA_IOS';
    return 'PWA_DESKTOP';
  }

  /**
   * Envía una notificación de prueba (solo para testing/QA)
   */
  sendTestNotification(userUuid: string, companyUuid: string) {
    const payload = {
      user_uuid: userUuid,
      app_uuid: this.configService.appUuid,
      company_uuid: companyUuid,
      title: '¡Prueba de SECUREX!',
      message: 'Esta es una notificación push de prueba desde tu PWA.',
      channels: 'PUSH'
    };

    return this.http.post(`${this.configService.notificationApiUrl}/notifications/send`, payload);
  }

  getNotifications(page = 1, limit = 50): Observable<AppNotification[]> {
    return this.gql.query<{ notifications: { data: AppNotification[]; total: number } }>('notification', NOTIFICATION_QUERIES.NOTIFICATIONS, { page, limit }).pipe(
      map(d => d.notifications.data)
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.gql.mutate('notification', NOTIFICATION_MUTATIONS.MARK_READ, { id });
  }

  deleteNotification(id: number): Observable<any> {
    return this.gql.mutate('notification', NOTIFICATION_MUTATIONS.DELETE_NOTIFICATION, { id });
  }

  private toastConfig: Record<string, { severity: string; summary: string; life: number; icon: string }> = {
    success: { severity: 'success', summary: 'Éxito', life: 2000, icon: 'pi pi-check-circle' },
    error: { severity: 'error', summary: 'Error', life: 3000, icon: 'pi pi-times-circle' },
    info: { severity: 'info', summary: 'Información', life: 2000, icon: 'pi pi-info-circle' },
    warn: { severity: 'warn', summary: 'Advertencia', life: 2500, icon: 'pi pi-exclamation-triangle' },
  };

  notify(type: keyof typeof this.toastConfig, message: string) {
    const cfg = this.toastConfig[type];
    this.messageService.add({ severity: cfg.severity, summary: cfg.summary, detail: message, life: cfg.life, icon: cfg.icon });
  }

  success(message: string) { this.notify('success', message); }

  error(message: string) { this.notify('error', message); }

  info(message: string) { this.notify('info', message); }

  warn(message: string) { this.notify('warn', message); }
}
