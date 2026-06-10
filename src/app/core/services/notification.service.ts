import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { Observable, catchError, firstValueFrom, of, tap, timeout } from 'rxjs';
import { MessageService } from 'primeng/api';

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
    const storedCompany = sessionStorage.getItem('currentCompany');
    if (storedCompany) {
      try {
        const company = JSON.parse(storedCompany);
        return company?.uuid || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private sendSubscriptionToApi(sub: PushSubscription) {
    const payload: any = {
      device_token: JSON.stringify(sub),
      device_type: this.getDeviceType()
    };
    const companyUuid = this.getCompanyUuid();
    if (companyUuid) {
      payload.company_uuid = companyUuid;
    }

    return this.http.post(`${this.configService.notificationApiUrl}/notifications/devices`, payload);
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

  /**
   * Actualiza las preferencias de notificación del usuario (Email/Push).
   */
  updatePreferences(emailEnabled: boolean, pushEnabled: boolean, companyUuid: string) {
    const payload = {
      app_uuid: this.configService.appUuid,
      company_uuid: companyUuid,
      email_enabled: emailEnabled,
      push_enabled: pushEnabled
    };

    return this.http.put(`${this.configService.notificationApiUrl}/notifications/preferences`, payload);
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${this.configService.notificationApiUrl}/notifications`
    );
  }

  markAsRead(id: number): Observable<{ status: string; data: null; message: string }> {
    return this.http.put<{ status: string; data: null; message: string }>(
      `${this.configService.notificationApiUrl}/notifications/${id}/read`, null
    );
  }

  deleteNotification(id: number): Observable<{ status: string; data: null; message: string }> {
    return this.http.delete<{ status: string; data: null; message: string }>(
      `${this.configService.notificationApiUrl}/notifications/${id}`
    );
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
}
